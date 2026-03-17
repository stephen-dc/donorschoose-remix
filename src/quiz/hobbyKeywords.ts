/**
 * Uses the Datamuse API to find words semantically related to a
 * custom hobby input. Returns them as selectable quiz options with
 * auto-assigned emojis by category.
 *
 * Datamuse `ml=` (means like) returns words with similar meaning.
 * Datamuse `rel_trg=` (triggered by) returns associated words.
 * We combine both for broader coverage.
 */

interface RelatedTerm {
    value: string;
    label: string;
    emoji: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
    science: '🔬',
    nature: '🌿',
    art: '🎨',
    music: '🎵',
    math: '📐',
    technology: '💻',
    health: '❤️',
    community: '🤝',
    environment: '🌍',
    food: '🍳',
    animal: '🐾',
    sport: '💪',
    book: '📖',
    water: '🌊',
    space: '🚀',
    build: '🔧',
    plant: '🌱',
    history: '📜',
};

function pickEmoji(word: string): string {
    const lower = word.toLowerCase();
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
        if (lower.includes(key)) return emoji;
    }
    return '✨';
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface DatamuseWord {
    word: string;
    score: number;
    tags?: string[];
}

/**
 * Fetches semantically related words from the Datamuse API.
 * Combines "means like" and "triggered by" results for broader coverage.
 */
export async function expandHobbyKeywords(customHobby: string): Promise<RelatedTerm[]> {
    if (!customHobby || !customHobby.trim()) return [];

    const query = encodeURIComponent(customHobby.trim());

    try {
        // Fetch both "means like" and "triggered by" in parallel
        const [mlRes, trgRes] = await Promise.all([
            fetch(`https://api.datamuse.com/words?ml=${query}&max=15`),
            fetch(`https://api.datamuse.com/words?rel_trg=${query}&max=10`),
        ]);

        const mlWords: DatamuseWord[] = mlRes.ok ? await mlRes.json() : [];
        const trgWords: DatamuseWord[] = trgRes.ok ? await trgRes.json() : [];

        // Merge and deduplicate, preferring higher-scored entries
        const wordMap = new Map<string, number>();
        for (const w of mlWords) {
            wordMap.set(w.word.toLowerCase(), w.score);
        }
        for (const w of trgWords) {
            const existing = wordMap.get(w.word.toLowerCase()) || 0;
            wordMap.set(w.word.toLowerCase(), Math.max(existing, w.score));
        }

        // Filter: keep single words or two-word phrases, skip very short ones
        const filtered = [...wordMap.entries()]
            .filter(([word]) => word.length > 2 && word.split(' ').length <= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        if (filtered.length === 0) {
            return getFallbackTerms(customHobby);
        }

        return filtered.map(([word]) => ({
            value: word,
            label: capitalize(word),
            emoji: pickEmoji(word),
        }));
    } catch {
        return getFallbackTerms(customHobby);
    }
}

/**
 * Fallback when the API is unavailable — splits the input into tokens
 * and returns them as options plus generic educational terms.
 */
function getFallbackTerms(customHobby: string): RelatedTerm[] {
    const tokens = customHobby.toLowerCase().split(/[\s,&+\/\-]+/).filter(w => w.length > 2);
    const terms: RelatedTerm[] = tokens.slice(0, 3).map(t => ({
        value: t,
        label: capitalize(t),
        emoji: pickEmoji(t),
    }));
    // Add generic educational fallbacks
    terms.push(
        { value: 'creativity', label: 'Creativity & expression', emoji: '✨' },
        { value: 'hands-on', label: 'Hands-on learning', emoji: '🔧' },
        { value: 'community', label: 'Community & connection', emoji: '🤝' },
    );
    return terms;
}
