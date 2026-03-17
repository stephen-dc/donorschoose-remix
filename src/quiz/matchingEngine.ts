import type { DonorProfile, TeacherMatch, MatchReason, MatchingThought } from './types';
import { getMatchingKeywords, getExcludedSubjects } from './questions';

const DC_API_KEY = import.meta.env.VITE_DC_API_KEY || 'H9v7hCeN';

interface ApiProposal {
    id: string;
    proposalURL: string;
    fundURL: string;
    title: string;
    shortDescription: string;
    synopsis: string;
    teacherId: string;
    teacherName: string;
    prefix: string;
    teacherProfilePhotoURL: string;
    classroomImageURL: string;
    thumbImageURL: string;
    retinaImageURL: string;
    schoolName: string;
    schoolId: string;
    city: string;
    state: string;
    zip: string;
    costToComplete: string;
    totalPrice: string;
    percentFunded: string;
    numStudents: string;
    freeReducedPriceLunch: string;
    subject: { id: string; name: string };
    additionalSubjects?: { id: string; name: string }[];
    gradeLevel: { id: string; name: string };
    povertyLevel: string;
    povertyType: { label: string; name: string };
    resources?: { name: string; quantity: number; totalPrice: string }[];
    snippets?: string[];
    fundingStatus: string;
    fulfillmentTrailer: string;
}

interface ApiResponse {
    proposals: ApiProposal[];
    totalProposals: string;
}

/**
 * Builds multiple search queries from the donor profile to cast a wide net,
 * then scores and ranks teacher matches.
 */
export async function findTeacherMatch(
    profile: Partial<DonorProfile>,
    onThought: (thought: MatchingThought) => void,
): Promise<TeacherMatch | null> {
    const keywords = getMatchingKeywords(profile);
    const excludedSubjects = getExcludedSubjects(profile);

    // Sort keywords by frequency (most mentioned = most important)
    const sortedKeywords = [...keywords.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([kw]) => kw);

    onThought({
        text: `Analyzing your personality... you're clearly a ${describePersonality(profile)} type.`,
        icon: '🧠',
        delay: 800,
    });

    // Strategy 1: Search by top keywords
    const topKeywords = sortedKeywords.slice(0, 5).join(' ');
    onThought({
        text: `Searching for teachers who match: "${topKeywords}"`,
        icon: '🔍',
        delay: 1200,
    });

    const searches: Promise<ApiProposal[]>[] = [];

    // Primary keyword search
    if (topKeywords) {
        searches.push(searchProjects({ keywords: topKeywords }));
    }

    // Subject-specific search if they have a favorite
    if (profile.favoriteSubject) {
        const subjectId = getSubjectId(profile.favoriteSubject);
        if (subjectId) {
            onThought({
                text: `Looking for ${profile.favoriteSubject} teachers who need your help...`,
                icon: '📚',
                delay: 1500,
            });
            searches.push(searchProjects({ subject1: subjectId }));
        }
    }

    // Location-based search if they picked a scenery type
    if (profile.sceneryPreference) {
        const metroType = getMetroType(profile.sceneryPreference);
        if (metroType) {
            const areaLabel = metroType === 'r' ? 'rural' : metroType === 'u' ? 'urban' : 'suburban';
            onThought({
                text: `Checking ${areaLabel} schools that match your vibe...`,
                icon: '📍',
                delay: 1800,
            });
            searches.push(searchProjects({ metroType, keywords: sortedKeywords.slice(0, 3).join(' ') }));
        }
    }

    // Equity-focus search if they care about equity
    if (profile.socialCause === 'equity' || profile.schoolStress === 'supplies') {
        onThought({
            text: 'Finding teachers at high-need schools...',
            icon: '❤️',
            delay: 2000,
        });
        searches.push(searchProjects({ highestLevelPoverty: 'true', keywords: sortedKeywords.slice(0, 2).join(' ') }));
    }

    // Secondary keywords search for broader coverage
    if (sortedKeywords.length > 5) {
        const secondaryKeywords = sortedKeywords.slice(3, 8).join(' ');
        searches.push(searchProjects({ keywords: secondaryKeywords }));
    }

    // State search if they mentioned a city that hints at a state
    if (profile.favoriteCity) {
        const stateCode = guessStateFromCity(profile.favoriteCity);
        if (stateCode) {
            onThought({
                text: `Peeking at classrooms near ${profile.favoriteCity}...`,
                icon: '🗺️',
                delay: 2100,
            });
            searches.push(searchProjects({ state: stateCode, keywords: sortedKeywords.slice(0, 2).join(' ') }));
        }
    }

    // Wait for all searches
    const results = await Promise.allSettled(searches);
    const allProposals: ApiProposal[] = [];
    const seenIds = new Set<string>();

    for (const result of results) {
        if (result.status === 'fulfilled') {
            for (const proposal of result.value) {
                if (!seenIds.has(proposal.id)) {
                    seenIds.add(proposal.id);
                    allProposals.push(proposal);
                }
            }
        }
    }

    onThought({
        text: `Found ${allProposals.length} potential matches. Now scoring them...`,
        icon: '⚡',
        delay: 2200,
    });

    // Prefer teachers with photos, but don't require it
    const withPhotos = allProposals.filter(
        p => p.teacherProfilePhotoURL && !p.teacherProfilePhotoURL.includes('generic')
    );

    // Include all teachers — funded or not. Teachers with strong funded
    // histories are still great matches even if they have no active project.
    let candidates = withPhotos.length >= 3 ? withPhotos : allProposals;

    if (candidates.length === 0) {
        onThought({
            text: 'Expanding search to find the perfect match...',
            icon: '🌎',
            delay: 2500,
        });
        // Fallback: broad search
        const fallback = await searchProjects({ max: '20' });
        const fallbackWithPhotos = fallback.filter(
            p => p.teacherProfilePhotoURL && !p.teacherProfilePhotoURL.includes('generic')
        );
        candidates = fallbackWithPhotos.length > 0 ? fallbackWithPhotos : fallback;
    }

    if (candidates.length === 0) {
        return null;
    }

    // ── Group by teacher and score teacher-level relevance ──
    // Each teacher is scored by the sum of their best project scores,
    // so a teacher with many relevant projects (funded or not) ranks higher.
    const teacherMap = new Map<string, ApiProposal[]>();
    for (const proposal of candidates) {
        const tid = proposal.teacherId;
        if (!teacherMap.has(tid)) teacherMap.set(tid, []);
        teacherMap.get(tid)!.push(proposal);
    }

    const teacherScores = [...teacherMap.entries()].map(([teacherId, proposals]) => {
        // Score every project for this teacher
        const projectScores = proposals.map(p => ({
            proposal: p,
            score: scoreProposal(p, profile, keywords, excludedSubjects),
        }));
        projectScores.sort((a, b) => b.score - a.score);

        // Teacher score = best project + diminishing bonus for additional relevant projects
        let teacherScore = projectScores[0].score;
        for (let i = 1; i < projectScores.length; i++) {
            // Each additional project adds a fraction of its score
            teacherScore += Math.max(0, projectScores[i].score) * (0.3 / i);
        }
        // Bonus for having multiple projects (shows dedication)
        if (proposals.length >= 3) teacherScore += 10;
        else if (proposals.length >= 2) teacherScore += 5;

        return { teacherId, proposals, projectScores, teacherScore };
    });

    teacherScores.sort((a, b) => b.teacherScore - a.teacherScore);
    const bestTeacher = teacherScores[0];
    if (!bestTeacher) return null;

    // ── Fetch teacher's full project history for a complete picture ──
    onThought({
        text: `Looking at ${bestTeacher.proposals[0].teacherName}'s full classroom history...`,
        icon: '📋',
        delay: 2400,
    });

    let allTeacherProjects = bestTeacher.proposals;
    try {
        const history = await searchProjects({
            teacher: bestTeacher.teacherId,
            historicalProposals: 'true',
            max: '20',
        });
        if (history.length > allTeacherProjects.length) {
            allTeacherProjects = history;
        }
    } catch {
        // Fall back to what we already have
    }

    // Build teacher-level data from full project history
    const rep = allTeacherProjects[0]; // representative proposal for teacher info
    const totalProjects = allTeacherProjects.length;
    const fundedProjects = allTeacherProjects.filter(p => p.fundingStatus !== 'needs funding').length;
    const totalStudentsReached = allTeacherProjects.reduce(
        (sum, p) => sum + (parseInt(p.numStudents || '0') || 0), 0
    );

    // Collect unique subjects across all projects
    const subjectSet = new Set<string>();
    for (const p of allTeacherProjects) {
        if (p.subject?.name) subjectSet.add(p.subject.name);
        if (p.additionalSubjects) {
            for (const s of p.additionalSubjects) subjectSet.add(s.name);
        }
    }

    // Build project list: active first, then funded, sorted by relevance within each group
    const scoredProjects = allTeacherProjects.map(p => ({
        proposal: p,
        score: scoreProposal(p, profile, keywords, excludedSubjects),
    }));
    const activeProjects = scoredProjects
        .filter(s => s.proposal.fundingStatus === 'needs funding')
        .sort((a, b) => b.score - a.score);
    const completedProjects = scoredProjects
        .filter(s => s.proposal.fundingStatus !== 'needs funding')
        .sort((a, b) => b.score - a.score);
    const sortedAll = [...activeProjects, ...completedProjects];

    const toTeacherProject = (p: ApiProposal): import('./types').TeacherProject => ({
        id: p.id,
        title: p.title,
        proposalUrl: p.proposalURL,
        fundUrl: p.fundURL,
        shortDescription: p.shortDescription,
        subject: p.subject?.name || 'General',
        gradeLevel: p.gradeLevel?.name || '',
        costToComplete: p.costToComplete,
        totalPrice: p.totalPrice,
        percentFunded: p.percentFunded,
        numStudents: p.numStudents,
        fundingStatus: p.fundingStatus,
        classroomImageUrl: p.classroomImageURL || p.retinaImageURL || '',
        resources: (p.resources || []).map(r => ({
            name: r.name,
            quantity: r.quantity,
            totalPrice: r.totalPrice,
        })),
    });

    const bestActiveProject = activeProjects[0]
        ? toTeacherProject(activeProjects[0].proposal)
        : null;

    onThought({
        text: `Found your perfect match at ${rep.schoolName}!`,
        icon: '🎯',
        delay: 2600,
    });

    // Build match reasons using teacher's overall profile
    const bestScoredProposal = sortedAll[0]?.proposal || rep;
    const reasons = buildMatchReasons(bestScoredProposal, profile, keywords);

    if (totalProjects > 1) {
        reasons.unshift({
            icon: '🏆',
            text: `${fundedProjects} project${fundedProjects !== 1 ? 's' : ''} funded out of ${totalProjects} — a dedicated educator`,
            strength: 'strong',
        });
    }
    if (totalStudentsReached > 0) {
        reasons.push({
            icon: '👧',
            text: `${totalStudentsReached.toLocaleString()} students reached across all projects`,
            strength: 'strong',
        });
    }

    return {
        teacherId: rep.teacherId,
        teacherName: rep.teacherName,
        prefix: rep.prefix || 'Teacher',
        teacherPhotoUrl: rep.teacherProfilePhotoURL,
        schoolName: rep.schoolName,
        city: rep.city,
        state: rep.state,
        povertyLevel: rep.povertyLevel || '',
        freeReducedLunch: rep.freeReducedPriceLunch || '',
        matchReasons: reasons.slice(0, 6),
        matchScore: bestTeacher.teacherScore,
        totalProjects,
        fundedProjects,
        totalStudentsReached,
        subjects: [...subjectSet],
        projects: sortedAll.map(s => toTeacherProject(s.proposal)),
        activeProject: bestActiveProject,
    };
}

async function searchProjects(params: Record<string, string>): Promise<ApiProposal[]> {
    const url = new URL(`/api/common/json_feed.html`, window.location.origin);
    url.searchParams.set('APIKey', DC_API_KEY);
    url.searchParams.set('max', params.max || '10');

    for (const [key, value] of Object.entries(params)) {
        if (key !== 'max') {
            url.searchParams.set(key, value);
        }
    }

    try {
        const response = await fetch(url.toString());
        if (!response.ok) return [];
        const data: ApiResponse = await response.json();
        return data.proposals || [];
    } catch {
        return [];
    }
}

function scoreProposal(
    proposal: ApiProposal,
    profile: Partial<DonorProfile>,
    keywords: Map<string, number>,
    excludedSubjects: string[],
): number {
    let score = 0;

    // Penalty for excluded subjects
    if (proposal.subject && excludedSubjects.includes(proposal.subject.id)) {
        score -= 50;
    }
    if (proposal.additionalSubjects) {
        for (const subj of proposal.additionalSubjects) {
            if (excludedSubjects.includes(subj.id)) {
                score -= 25;
            }
        }
    }

    // Bonus for having a teacher photo (strongly preferred)
    if (proposal.teacherProfilePhotoURL && !proposal.teacherProfilePhotoURL.includes('generic')) {
        score += 30;
    }

    // Bonus for having a classroom image
    if (proposal.classroomImageURL || proposal.retinaImageURL) {
        score += 5;
    }

    // Keyword matching against essay/synopsis
    const textToSearch = [
        proposal.title,
        proposal.shortDescription,
        proposal.synopsis,
        proposal.subject?.name,
        proposal.schoolName,
    ].filter(Boolean).join(' ').toLowerCase();

    for (const [keyword, freq] of keywords.entries()) {
        if (textToSearch.includes(keyword)) {
            score += 10 * freq;
        }
    }

    // Subject match bonus
    if (profile.favoriteSubject && proposal.subject) {
        const favoriteSubjectId = getSubjectId(profile.favoriteSubject);
        if (favoriteSubjectId === proposal.subject.id) {
            score += 25;
        }
    }

    // Poverty/equity bonus for donors who care about equity
    if (profile.socialCause === 'equity' || profile.schoolStress === 'supplies') {
        const lunch = parseInt(proposal.freeReducedPriceLunch || '0');
        if (lunch >= 75) score += 15;
        else if (lunch >= 50) score += 8;
    }

    // Bonus for projects that still need funding (more actionable)
    const percentFunded = parseInt(proposal.percentFunded || '0');
    if (proposal.fundingStatus === 'needs funding') {
        score += 10;
        // Extra urgency bonus if close to goal
        if (percentFunded >= 50) score += 5;
    }

    // Bonus for projects with more students impacted
    const numStudents = parseInt(proposal.numStudents || '0');
    if (numStudents >= 20) score += 5;
    if (numStudents >= 50) score += 5;

    // Small bonus for resource-rich proposals (more engaging to show)
    if (proposal.resources && proposal.resources.length > 0) {
        score += 3;
    }

    return score;
}

function buildMatchReasons(
    proposal: ApiProposal,
    profile: Partial<DonorProfile>,
    keywords: Map<string, number>,
): MatchReason[] {
    const reasons: MatchReason[] = [];

    // Subject match
    if (profile.favoriteSubject && proposal.subject) {
        const favoriteSubjectId = getSubjectId(profile.favoriteSubject);
        if (favoriteSubjectId === proposal.subject.id) {
            reasons.push({
                icon: '📚',
                text: `Teaches ${proposal.subject.name} — your favorite subject`,
                strength: 'strong',
            });
        }
    }

    // Location/vibe match
    if (profile.sceneryPreference) {
        const vibeLabel = getVibeLabel(profile.sceneryPreference);
        if (vibeLabel) {
            reasons.push({
                icon: '📍',
                text: vibeLabel,
                strength: 'medium',
            });
        }
    }

    // Keyword matches in essay
    const textToSearch = (proposal.synopsis || proposal.shortDescription || '').toLowerCase();
    const matchedKeywords: string[] = [];
    for (const [keyword] of [...keywords.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
        if (textToSearch.includes(keyword)) {
            matchedKeywords.push(keyword);
        }
    }
    if (matchedKeywords.length > 0) {
        reasons.push({
            icon: '✨',
            text: `Their project essay mentions: ${matchedKeywords.slice(0, 3).join(', ')}`,
            strength: 'strong',
        });
    }

    // Poverty/need level
    const lunch = parseInt(proposal.freeReducedPriceLunch || '0');
    if (lunch >= 75) {
        reasons.push({
            icon: '❤️',
            text: `${lunch}% of students qualify for free/reduced lunch`,
            strength: 'strong',
        });
    }

    // Students impacted
    const numStudents = parseInt(proposal.numStudents || '0');
    if (numStudents > 0) {
        reasons.push({
            icon: '👧',
            text: `Your donation would reach ${numStudents} students`,
            strength: 'medium',
        });
    }

    // Funding progress
    const percentFunded = parseInt(proposal.percentFunded || '0');
    if (percentFunded >= 50) {
        const remaining = parseFloat(proposal.costToComplete || '0');
        reasons.push({
            icon: '🎯',
            text: `${percentFunded}% funded — only $${remaining.toFixed(0)} to go!`,
            strength: 'strong',
        });
    }

    // Childhood dream connection
    if (profile.childhoodDream) {
        const dreamConnection = getDreamConnection(profile.childhoodDream, proposal);
        if (dreamConnection) {
            reasons.push({
                icon: '💭',
                text: dreamConnection,
                strength: 'light',
            });
        }
    }

    // Social cause alignment
    if (profile.socialCause) {
        const causeConnection = getCauseConnection(profile.socialCause, proposal);
        if (causeConnection) {
            reasons.push({
                icon: '💛',
                text: causeConnection,
                strength: 'medium',
            });
        }
    }

    return reasons.slice(0, 5);
}

function describePersonality(profile: Partial<DonorProfile>): string {
    const traits: string[] = [];

    if (profile.sceneryPreference === 'rural-farm' || profile.sceneryPreference === 'mountain-trail') {
        traits.push('nature-loving');
    } else if (profile.sceneryPreference === 'cozy-library') {
        traits.push('bookish');
    } else if (profile.sceneryPreference === 'bustling-market') {
        traits.push('social');
    }

    if (profile.favoriteSubject === 'science' || profile.favoriteSubject === 'tech') {
        traits.push('curious');
    } else if (profile.favoriteSubject === 'art' || profile.favoriteSubject === 'music') {
        traits.push('creative');
    } else if (profile.favoriteSubject === 'english') {
        traits.push('thoughtful');
    }

    if (profile.socialCause === 'equity') {
        traits.push('equity-minded');
    } else if (profile.socialCause === 'mental-health') {
        traits.push('empathetic');
    }

    return traits.length > 0 ? traits.join(', ') : 'thoughtful and generous';
}

function getSubjectId(subject: string): string | null {
    const map: Record<string, string> = {
        math: '8',
        science: '6',
        english: '4',
        history: '3',
        art: '1',
        music: '10',
        pe: '11',
        tech: '7',
    };
    return map[subject] || null;
}

function getMetroType(scenery: string): string | null {
    const map: Record<string, string> = {
        'rural-farm': 'r',
        'mountain-trail': 'r',
        'city-park': 'u',
        'bustling-market': 'u',
        'beach-coast': 's',
        'cozy-library': 's',
    };
    return map[scenery] || null;
}

function getVibeLabel(scenery: string): string | null {
    const map: Record<string, string> = {
        'rural-farm': 'Located in the kind of rural community you love',
        'beach-coast': 'A school near the coast, just your style',
        'city-park': 'An urban school in the heart of the city',
        'mountain-trail': 'Nestled in a small-town community',
        'cozy-library': 'A school that values reading and quiet learning',
        'bustling-market': 'A vibrant, diverse school community',
    };
    return map[scenery] || null;
}

function getDreamConnection(dream: string, proposal: ApiProposal): string | null {
    const text = (proposal.synopsis || proposal.shortDescription || '').toLowerCase();
    const connections: Record<string, { keywords: string[]; message: string }> = {
        astronaut: { keywords: ['space', 'nasa', 'rocket', 'planet', 'star'], message: "This teacher is helping kids reach for the stars — just like you once did" },
        doctor: { keywords: ['health', 'biology', 'body', 'medicine', 'nurse'], message: "Helping future healers, just like the dream you once had" },
        teacher: { keywords: ['teach', 'learn', 'education'], message: "You once dreamed of being a teacher — here's your chance to support one" },
        artist: { keywords: ['art', 'music', 'paint', 'draw', 'creative'], message: "Fueling the same creativity that inspired you as a kid" },
        athlete: { keywords: ['sport', 'team', 'coach', 'game', 'fitness'], message: "Supporting the same athletic spirit you grew up with" },
        scientist: { keywords: ['science', 'experiment', 'lab', 'research'], message: "Backing the next generation of scientists and inventors" },
    };

    const conn = connections[dream];
    if (!conn) return null;
    if (conn.keywords.some(kw => text.includes(kw))) {
        return conn.message;
    }
    return null;
}

function getCauseConnection(cause: string, proposal: ApiProposal): string | null {
    const lunch = parseInt(proposal.freeReducedPriceLunch || '0');
    const text = (proposal.synopsis || proposal.shortDescription || '').toLowerCase();

    const connections: Record<string, () => string | null> = {
        equity: () => lunch >= 65 ? `This school serves a high-need community (${lunch}% free/reduced lunch)` : null,
        'mental-health': () => text.includes('social emotional') || text.includes('mindful') || text.includes('wellness')
            ? 'This teacher focuses on student wellbeing'
            : null,
        'stem-access': () => text.includes('stem') || text.includes('science') || text.includes('technology')
            ? 'Bringing STEM to students who need it most'
            : null,
        'arts-funding': () => text.includes('art') || text.includes('music') || text.includes('creative')
            ? 'Keeping the arts alive in schools'
            : null,
        reading: () => text.includes('reading') || text.includes('book') || text.includes('literacy')
            ? 'Helping every student become a confident reader'
            : null,
        'teacher-pay': () => 'Your donation directly supports this teacher\'s classroom needs',
    };

    const fn = connections[cause];
    return fn ? fn() : null;
}

/**
 * Naive city-to-state mapping for common US cities.
 * This isn't exhaustive — it's just to add a location signal when available.
 */
function guessStateFromCity(city: string): string | null {
    const normalized = city.toLowerCase().trim();
    const map: Record<string, string> = {
        'new york': 'NY', 'nyc': 'NY', 'brooklyn': 'NY', 'manhattan': 'NY', 'queens': 'NY', 'bronx': 'NY',
        'los angeles': 'CA', 'la': 'CA', 'san francisco': 'CA', 'sf': 'CA', 'san diego': 'CA', 'oakland': 'CA', 'san jose': 'CA',
        'chicago': 'IL',
        'houston': 'TX', 'dallas': 'TX', 'austin': 'TX', 'san antonio': 'TX', 'fort worth': 'TX',
        'phoenix': 'AZ', 'tucson': 'AZ',
        'philadelphia': 'PA', 'philly': 'PA', 'pittsburgh': 'PA',
        'jacksonville': 'FL', 'miami': 'FL', 'tampa': 'FL', 'orlando': 'FL',
        'columbus': 'OH', 'cleveland': 'OH', 'cincinnati': 'OH',
        'charlotte': 'NC', 'raleigh': 'NC',
        'indianapolis': 'IN',
        'seattle': 'WA', 'portland': 'OR',
        'denver': 'CO',
        'washington': 'DC', 'dc': 'DC',
        'boston': 'MA',
        'nashville': 'TN', 'memphis': 'TN',
        'baltimore': 'MD',
        'milwaukee': 'WI',
        'albuquerque': 'NM',
        'atlanta': 'GA',
        'detroit': 'MI',
        'minneapolis': 'MN',
        'new orleans': 'LA',
        'las vegas': 'NV',
        'honolulu': 'HI',
        'anchorage': 'AK',
    };
    return map[normalized] || null;
}
