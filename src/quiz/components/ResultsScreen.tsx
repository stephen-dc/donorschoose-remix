import { useState, useEffect, useCallback, useRef } from 'react';
import type { DonorProfile, TeacherMatch, TeacherProject, MatchingThought } from '../types';
import { findTeacherMatch } from '../matchingEngine';

interface ResultsScreenProps {
    profile: Partial<DonorProfile>;
    match: TeacherMatch | null;
    thoughts: MatchingThought[];
    isLoading: boolean;
    onMatchFound: (match: TeacherMatch, thoughts: MatchingThought[]) => void;
    onRetry: () => void;
}

export function ResultsScreen({
    profile,
    match,
    thoughts: _thoughts,
    isLoading,
    onMatchFound,
    onRetry,
}: ResultsScreenProps) {
    const [visibleThoughts, setVisibleThoughts] = useState<MatchingThought[]>([]);
    const [error, setError] = useState<string | null>(null);
    const thoughtsEndRef = useRef<HTMLDivElement>(null);
    const hasStartedMatching = useRef(false);

    const addThought = useCallback((thought: MatchingThought) => {
        setVisibleThoughts(prev => [...prev, thought]);
    }, []);

    // Start matching when loading
    useEffect(() => {
        if (!isLoading || hasStartedMatching.current) return;
        hasStartedMatching.current = true;

        const collectedThoughts: MatchingThought[] = [];

        findTeacherMatch(profile, (thought) => {
            collectedThoughts.push(thought);
            setTimeout(() => addThought(thought), thought.delay);
        })
            .then((teacherMatch) => {
                if (teacherMatch) {
                    const finalThought: MatchingThought = {
                        text: `Meet ${teacherMatch.prefix} ${teacherMatch.teacherName}!`,
                        icon: '🎉',
                        delay: 0,
                    };
                    setTimeout(() => {
                        addThought(finalThought);
                        collectedThoughts.push(finalThought);
                        setTimeout(() => {
                            onMatchFound(teacherMatch, collectedThoughts);
                        }, 1000);
                    }, 3000);
                } else {
                    setError('We couldn\'t find a match right now. Try again with different answers!');
                }
            })
            .catch(() => {
                setError('Something went wrong. Please try again.');
            });
    }, [isLoading, profile, onMatchFound, addThought]);

    // Auto-scroll thoughts
    useEffect(() => {
        thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleThoughts.length]);

    if (isLoading) {
        return (
            <div className="dtm-results dtm-results--loading">
                <div className="dtm-results__thinking">
                    <div className="dtm-results__thinking-header">
                        <div className="dtm-results__spinner" />
                        <h2>Finding your perfect teacher...</h2>
                    </div>
                    <div className="dtm-results__thoughts">
                        {visibleThoughts.map((thought, i) => (
                            <div key={i} className="dtm-results__thought dtm-results__thought--fade-in">
                                <span className="dtm-results__thought-icon">{thought.icon}</span>
                                <span className="dtm-results__thought-text">{thought.text}</span>
                            </div>
                        ))}
                        <div ref={thoughtsEndRef} />
                    </div>
                    {error && (
                        <div className="dtm-results__error">
                            <p>{error}</p>
                            <button className="dtm-results__retry-btn" onClick={onRetry}>
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="dtm-results dtm-results--error">
                <h2>Hmm, we couldn't find a match.</h2>
                <p>Let's try again with different answers!</p>
                <button className="dtm-results__retry-btn" onClick={onRetry}>
                    Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="dtm-results dtm-results--matched">
            <div className="dtm-results__match-header">
                <div className="dtm-results__match-badge">YOUR MATCH</div>
                <div className="dtm-results__match-score">
                    {getMatchQuality(match.matchScore)} Match
                </div>
            </div>

            {/* ── Teacher card ── */}
            <div className="dtm-results__teacher-card">
                <div className="dtm-results__teacher-photo-wrapper">
                    <img
                        className="dtm-results__teacher-photo"
                        src={match.teacherPhotoUrl}
                        alt={`${match.prefix} ${match.teacherName}`}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>

                <div className="dtm-results__teacher-info">
                    <h2 className="dtm-results__teacher-name">
                        {match.prefix} {match.teacherName}
                    </h2>
                    <p className="dtm-results__teacher-school">
                        {match.schoolName} &middot; {match.city}, {match.state}
                    </p>
                    {match.subjects.length > 0 && (
                        <p className="dtm-results__teacher-subject">
                            {match.subjects.join(' · ')}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Teacher stats ── */}
            <div className="dtm-results__teacher-stats">
                <div className="dtm-results__stat">
                    <div className="dtm-results__stat-number">{match.totalProjects}</div>
                    <div className="dtm-results__stat-label">Project{match.totalProjects !== 1 ? 's' : ''}</div>
                </div>
                <div className="dtm-results__stat">
                    <div className="dtm-results__stat-number">{match.fundedProjects}</div>
                    <div className="dtm-results__stat-label">Funded</div>
                </div>
                <div className="dtm-results__stat">
                    <div className="dtm-results__stat-number">
                        {match.totalStudentsReached.toLocaleString()}
                    </div>
                    <div className="dtm-results__stat-label">Students Reached</div>
                </div>
            </div>

            {/* ── Match reasons ── */}
            <div className="dtm-results__reasons">
                <h3>Why you're a great match:</h3>
                {match.matchReasons.map((reason, i) => (
                    <div
                        key={i}
                        className={`dtm-results__reason dtm-results__reason--${reason.strength}`}
                    >
                        <span className="dtm-results__reason-icon">{reason.icon}</span>
                        <span className="dtm-results__reason-text">{reason.text}</span>
                    </div>
                ))}
            </div>

            {/* ── Active project CTA (if one exists) ── */}
            {match.activeProject && (
                <div className="dtm-results__active-project">
                    <h3 className="dtm-results__section-title">Active Project</h3>
                    <ProjectCard project={match.activeProject} teacherName={`${match.prefix} ${match.teacherName}`} />
                    <a
                        href={match.activeProject.fundUrl}
                        className="dtm-results__donate-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Give to {match.prefix} {match.teacherName}'s Classroom
                    </a>
                </div>
            )}

            {/* ── Project history ── */}
            {match.projects.length > (match.activeProject ? 1 : 0) && (
                <div className="dtm-results__history">
                    <h3 className="dtm-results__section-title">
                        {match.activeProject ? 'Past Projects' : 'Project History'}
                    </h3>
                    {match.projects
                        .filter(p => !match.activeProject || p.id !== match.activeProject.id)
                        .slice(0, 5)
                        .map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                teacherName={`${match.prefix} ${match.teacherName}`}
                                compact
                            />
                        ))
                    }
                </div>
            )}

            {/* ── Actions ── */}
            <div className="dtm-results__actions">
                {!match.activeProject && (
                    <a
                        href={`https://www.donorschoose.org/teacher/${match.teacherId}`}
                        className="dtm-results__donate-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Follow {match.prefix} {match.teacherName} on DonorsChoose
                    </a>
                )}
                <button className="dtm-results__retry-btn" onClick={onRetry}>
                    Try Again with Different Answers
                </button>
            </div>

            <div className="dtm-results__powered-by">
                Powered by <a href="https://www.donorschoose.org" target="_blank" rel="noopener noreferrer">DonorsChoose.org</a>
            </div>
        </div>
    );
}

function ProjectCard({
    project,
    teacherName,
    compact,
}: {
    project: TeacherProject;
    teacherName: string;
    compact?: boolean;
}) {
    const isFunded = project.fundingStatus !== 'needs funding';
    const percentFunded = parseInt(project.percentFunded || '0');

    return (
        <div className={`dtm-results__project-card ${compact ? 'dtm-results__project-card--compact' : ''}`}>
            {!compact && project.classroomImageUrl && (
                <img
                    className="dtm-results__classroom-image"
                    src={project.classroomImageUrl}
                    alt={`${teacherName}'s classroom`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            )}

            <div className="dtm-results__project-header">
                <h4 className="dtm-results__project-title">{project.title}</h4>
                <span className={`dtm-results__project-status ${isFunded ? 'dtm-results__project-status--funded' : ''}`}>
                    {isFunded ? 'Funded' : 'Needs Funding'}
                </span>
            </div>

            {!compact && (
                <p className="dtm-results__project-description">{project.shortDescription}</p>
            )}

            <div className="dtm-results__project-meta">
                <span>{project.subject}</span>
                {project.numStudents && parseInt(project.numStudents) > 0 && (
                    <span>{project.numStudents} students</span>
                )}
                {!isFunded && (
                    <span className="dtm-results__cost-to-complete">
                        ${parseFloat(project.costToComplete).toFixed(0)} needed
                    </span>
                )}
            </div>

            {!isFunded && !compact && (
                <div className="dtm-results__funding-bar">
                    <div className="dtm-results__funding-bar-bg">
                        <div
                            className="dtm-results__funding-bar-fill"
                            style={{ width: `${Math.min(100, percentFunded)}%` }}
                        />
                    </div>
                    <div className="dtm-results__funding-stats">
                        <span>{project.percentFunded}% funded</span>
                        <span className="dtm-results__cost-to-complete">
                            ${parseFloat(project.costToComplete).toFixed(0)} still needed
                        </span>
                    </div>
                </div>
            )}

            {!isFunded && !compact && project.resources.length > 0 && (
                <div className="dtm-results__resources">
                    <h4>What they need:</h4>
                    <ul>
                        {project.resources.slice(0, 4).map((resource, i) => (
                            <li key={i}>
                                {resource.quantity}x {resource.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function getMatchQuality(score: number): string {
    if (score >= 80) return 'Incredible';
    if (score >= 60) return 'Excellent';
    if (score >= 40) return 'Great';
    if (score >= 20) return 'Good';
    return 'Interesting';
}
