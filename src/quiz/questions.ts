import type { QuizQuestion, DonorProfile } from './types';

/**
 * Hobby follow-up options keyed by the initial hobby selection.
 * When a donor picks a hobby, we show them a more specific follow-up
 * using these related sub-hobbies.
 */
const hobbyFollowUps: Record<string, { value: string; label: string; emoji: string }[]> = {
    gardening: [
        { value: 'native-plants', label: 'Native wildflowers', emoji: '🌻' },
        { value: 'vegetable-garden', label: 'Growing my own food', emoji: '🥕' },
        { value: 'composting', label: 'Composting & soil science', emoji: '🪱' },
        { value: 'botanical-art', label: 'Pressing flowers & botanical art', emoji: '🎨' },
    ],
    cooking: [
        { value: 'baking', label: 'Baking from scratch', emoji: '🍞' },
        { value: 'international-cuisine', label: 'Exploring world cuisines', emoji: '🌍' },
        { value: 'farm-to-table', label: 'Farm-to-table cooking', emoji: '🥗' },
        { value: 'food-science', label: 'The science of cooking', emoji: '🧪' },
    ],
    reading: [
        { value: 'fiction', label: 'Getting lost in fiction', emoji: '📖' },
        { value: 'nonfiction', label: 'Learning from nonfiction', emoji: '📚' },
        { value: 'poetry', label: 'Poetry & spoken word', emoji: '✍️' },
        { value: 'book-clubs', label: 'Book clubs & discussion', emoji: '💬' },
    ],
    sports: [
        { value: 'team-sports', label: 'Team sports & coaching', emoji: '⚽' },
        { value: 'running', label: 'Running or endurance sports', emoji: '🏃' },
        { value: 'outdoor-adventure', label: 'Hiking & outdoor adventure', emoji: '🏔️' },
        { value: 'yoga-wellness', label: 'Yoga & wellness', emoji: '🧘' },
    ],
    arts: [
        { value: 'painting', label: 'Painting & drawing', emoji: '🎨' },
        { value: 'music-playing', label: 'Playing an instrument', emoji: '🎸' },
        { value: 'photography', label: 'Photography', emoji: '📷' },
        { value: 'theater', label: 'Theater & performance', emoji: '🎭' },
    ],
    technology: [
        { value: 'coding', label: 'Coding & building things', emoji: '💻' },
        { value: 'robotics', label: 'Robotics & hardware', emoji: '🤖' },
        { value: 'gaming', label: 'Gaming & game design', emoji: '🎮' },
        { value: 'ai-future', label: 'AI & the future', emoji: '🧠' },
    ],
    crafts: [
        { value: 'woodworking', label: 'Woodworking', emoji: '🪚' },
        { value: 'sewing', label: 'Sewing & textile arts', emoji: '🧵' },
        { value: 'pottery', label: 'Pottery & ceramics', emoji: '🏺' },
        { value: 'diy-home', label: 'DIY home projects', emoji: '🔨' },
    ],
    animals: [
        { value: 'pets', label: 'Spoiling my pets', emoji: '🐕' },
        { value: 'wildlife', label: 'Wildlife conservation', emoji: '🦅' },
        { value: 'marine-life', label: 'Marine life & oceans', emoji: '🐋' },
        { value: 'animal-rescue', label: 'Animal rescue & fostering', emoji: '🐾' },
    ],
};

/**
 * Maps scenery choices to metro type search parameters and keyword themes.
 */
const sceneryToKeywords: Record<string, string[]> = {
    'rural-farm': ['rural', 'agriculture', 'farm', 'nature', 'outdoor'],
    'beach-coast': ['coastal', 'ocean', 'marine', 'environment', 'water'],
    'city-park': ['urban', 'community', 'park', 'city', 'neighborhood'],
    'mountain-trail': ['outdoor', 'nature', 'hiking', 'environment', 'adventure'],
    'cozy-library': ['reading', 'books', 'library', 'literacy', 'literature'],
    'bustling-market': ['culture', 'diversity', 'community', 'food', 'social'],
};

function hasHobby(profile: Partial<DonorProfile>, hobby: string): boolean {
    return Array.isArray(profile.hobbies) && profile.hobbies.includes(hobby);
}

function seemsSporty(profile: Partial<DonorProfile>): boolean {
    return hasHobby(profile, 'sports') ||
        (Array.isArray(profile.hobbyDetails) && profile.hobbyDetails.some(
            h => ['team-sports', 'running', 'outdoor-adventure'].includes(h)
        ));
}


/**
 * All possible quiz questions. The engine selects and orders them
 * dynamically based on answers given so far.
 */
export const allQuestions: QuizQuestion[] = [
    // ── WARMUP: Light, fun, gets them hooked ──
    {
        id: 'favorite-city',
        category: 'warmup',
        question: "What city makes you feel most alive?",
        subtitle: "Type any city — we'll use it in a way you won't expect.",
        type: 'text',
        options: [],
        skippable: true,
        profileKey: 'favoriteCity',
        getKeywords: (answer) => [String(answer)],
        priority: 1,
    },
    {
        id: 'scenery',
        category: 'warmup',
        question: "Pick the place you'd escape to right now.",
        subtitle: "Trust your gut — there are no wrong answers.",
        type: 'image',
        options: [
            { value: 'rural-farm', label: 'A quiet farm road', emoji: '🌾', description: 'Wide open sky, crickets, fireflies' },
            { value: 'beach-coast', label: 'Waves on a warm beach', emoji: '🏖️', description: 'Salt air, tide pools, seashells' },
            { value: 'city-park', label: 'A green city park', emoji: '🏙️', description: 'Benches, pigeons, street musicians' },
            { value: 'mountain-trail', label: 'A misty mountain trail', emoji: '⛰️', description: 'Pine trees, birdsong, morning fog' },
            { value: 'cozy-library', label: 'A sunlit library corner', emoji: '📚', description: 'Leather chairs, tall shelves, quiet' },
            { value: 'bustling-market', label: 'A vibrant street market', emoji: '🎪', description: 'Spices, colors, laughter everywhere' },
        ],
        skippable: true,
        profileKey: 'sceneryPreference',
        getKeywords: (answer) => sceneryToKeywords[String(answer)] || [],
        priority: 2,
    },
    {
        id: 'snack',
        category: 'wildcard',
        question: "You're bringing snacks to a classroom. What's in the bag?",
        subtitle: "Yes, we really need to know this.",
        type: 'single',
        options: [
            { value: 'fruit', label: 'Fresh fruit & veggies', emoji: '🍎' },
            { value: 'cookies', label: 'Homemade cookies', emoji: '🍪' },
            { value: 'pizza', label: 'Pizza, obviously', emoji: '🍕' },
            { value: 'trail-mix', label: 'Trail mix & granola', emoji: '🥜' },
            { value: 'fancy', label: 'Something bougie — cheese plate', emoji: '🧀' },
        ],
        skippable: true,
        profileKey: 'snackChoice',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                fruit: ['health', 'nutrition', 'garden', 'food'],
                cookies: ['baking', 'home economics', 'warmth'],
                pizza: ['community', 'celebration', 'fun'],
                'trail-mix': ['outdoor', 'nature', 'health', 'adventure'],
                fancy: ['culture', 'food', 'culinary', 'arts'],
            };
            return map[String(answer)] || [];
        },
        priority: 3,
    },

    // ── HOBBIES: Multi-select + adaptive follow-up ──
    {
        id: 'hobbies',
        category: 'lifestyle',
        question: "What do you actually enjoy doing? Pick all that apply.",
        subtitle: "We'll dig deeper on what you pick.",
        type: 'multi',
        options: [
            { value: 'gardening', label: 'Gardening', emoji: '🌱' },
            { value: 'cooking', label: 'Cooking', emoji: '🍳' },
            { value: 'reading', label: 'Reading', emoji: '📖' },
            { value: 'sports', label: 'Sports & fitness', emoji: '🏀' },
            { value: 'arts', label: 'Arts & music', emoji: '🎨' },
            { value: 'technology', label: 'Tech & gaming', emoji: '💻' },
            { value: 'crafts', label: 'Crafts & making', emoji: '🔧' },
            { value: 'animals', label: 'Animals & nature', emoji: '🐾' },
            { value: 'other', label: 'Something else...', emoji: '✨' },
        ],
        skippable: true,
        profileKey: 'hobbies',
        getKeywords: (answer) => {
            const hobbies = Array.isArray(answer) ? answer : [answer];
            const map: Record<string, string[]> = {
                gardening: ['garden', 'plant', 'nature', 'environment', 'science'],
                cooking: ['cooking', 'food', 'nutrition', 'culinary'],
                reading: ['reading', 'books', 'literacy', 'literature', 'library'],
                sports: ['sports', 'physical education', 'athletics', 'health'],
                arts: ['art', 'music', 'creative', 'theater', 'dance'],
                technology: ['technology', 'STEM', 'computer', 'coding', 'robotics'],
                crafts: ['craft', 'maker', 'woodworking', 'textile', 'hands-on'],
                animals: ['animal', 'nature', 'biology', 'environment', 'science'],
            };
            return hobbies.flatMap(h => map[h] || []);
        },
        priority: 4,
    },
    {
        id: 'custom-hobby',
        category: 'lifestyle',
        question: "What's your thing? Tell us about it.",
        subtitle: "Type anything — a hobby, interest, passion, side project. We'll use it to find your teacher.",
        type: 'text',
        options: [],
        skippable: true,
        shouldShow: (profile) => Array.isArray(profile.hobbies) && profile.hobbies.includes('other'),
        profileKey: 'customHobby',
        getKeywords: (answer) => {
            if (typeof answer !== 'string' || !answer.trim()) return [];
            // Split the custom hobby into individual keywords for search
            return answer.toLowerCase().split(/[\s,&+\/]+/).filter(w => w.length > 2);
        },
        priority: 4,
    },
    {
        id: 'custom-hobby-keywords',
        category: 'lifestyle',
        question: "Nice! Which of these sound related?",
        subtitle: "Pick the topics that connect to your interest — they help us find the right classroom.",
        type: 'multi',
        options: [], // Dynamically populated from expandHobbyKeywords()
        skippable: true,
        shouldShow: (profile) => typeof profile.customHobby === 'string' && profile.customHobby.trim().length > 0,
        profileKey: 'customHobbyKeywords',
        getKeywords: (answer) => {
            const picks = Array.isArray(answer) ? answer : [answer];
            // The values are already keyword-like (e.g. 'pollination', 'ecology')
            return picks;
        },
        priority: 5,
    },
    {
        id: 'hobby-detail',
        category: 'lifestyle',
        question: "Let's go deeper — which of these speaks to you?",
        subtitle: "These are based on what you just told us.",
        type: 'multi',
        options: [], // Dynamically populated based on hobby answers
        skippable: true,
        shouldShow: (profile) => Array.isArray(profile.hobbies) && profile.hobbies.some(h => h !== 'other'),
        profileKey: 'hobbyDetails',
        getKeywords: (answer) => {
            const details = Array.isArray(answer) ? answer : [answer];
            const map: Record<string, string[]> = {
                'native-plants': ['environment', 'ecology', 'biodiversity', 'garden'],
                'vegetable-garden': ['garden', 'food', 'nutrition', 'agriculture'],
                'composting': ['science', 'environment', 'sustainability'],
                'botanical-art': ['art', 'botany', 'nature', 'science'],
                'baking': ['cooking', 'math', 'measurement', 'chemistry'],
                'international-cuisine': ['culture', 'geography', 'diversity', 'food'],
                'farm-to-table': ['agriculture', 'sustainability', 'nutrition'],
                'food-science': ['science', 'chemistry', 'STEM', 'cooking'],
                'fiction': ['literacy', 'reading', 'creative writing', 'imagination'],
                'nonfiction': ['research', 'history', 'science', 'learning'],
                'poetry': ['writing', 'language arts', 'expression', 'literature'],
                'book-clubs': ['community', 'reading', 'discussion', 'literacy'],
                'team-sports': ['teamwork', 'coaching', 'physical education', 'leadership'],
                'running': ['fitness', 'health', 'endurance', 'physical education'],
                'outdoor-adventure': ['outdoor', 'nature', 'adventure', 'environment'],
                'yoga-wellness': ['wellness', 'health', 'mindfulness', 'social emotional'],
                'painting': ['art', 'visual arts', 'creative', 'expression'],
                'music-playing': ['music', 'instrument', 'band', 'orchestra'],
                'photography': ['photography', 'visual arts', 'media', 'technology'],
                'theater': ['theater', 'drama', 'performance', 'arts'],
                'coding': ['coding', 'computer science', 'STEM', 'technology'],
                'robotics': ['robotics', 'engineering', 'STEM', 'maker'],
                'gaming': ['gaming', 'design', 'technology', 'creativity'],
                'ai-future': ['technology', 'STEM', 'innovation', 'computer science'],
                'woodworking': ['woodworking', 'maker', 'hands-on', 'shop'],
                'sewing': ['textile', 'arts', 'design', 'maker'],
                'pottery': ['ceramics', 'arts', 'hands-on', 'creative'],
                'diy-home': ['maker', 'engineering', 'hands-on', 'building'],
                'pets': ['animals', 'responsibility', 'biology'],
                'wildlife': ['wildlife', 'conservation', 'environment', 'biology'],
                'marine-life': ['ocean', 'marine biology', 'science', 'environment'],
                'animal-rescue': ['community service', 'animals', 'compassion'],
            };
            return details.flatMap(d => map[d] || []);
        },
        priority: 5,
    },

    // ── ACADEMIC: Understanding their school experience ──
    {
        id: 'favorite-subject',
        category: 'academic',
        question: "What class would you time-travel back to take again?",
        subtitle: "The one that made school worth it.",
        type: 'single',
        options: [
            { value: 'math', label: 'Math', emoji: '📐' },
            { value: 'science', label: 'Science', emoji: '🔬' },
            { value: 'english', label: 'English / Language Arts', emoji: '📝' },
            { value: 'history', label: 'History / Social Studies', emoji: '🗺️' },
            { value: 'art', label: 'Art', emoji: '🎨' },
            { value: 'music', label: 'Music', emoji: '🎵' },
            { value: 'pe', label: 'P.E. / Recess', emoji: '🏃' },
            { value: 'tech', label: 'Computer / Tech class', emoji: '💻' },
        ],
        skippable: true,
        profileKey: 'favoriteSubject',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                math: ['math', 'mathematics', 'algebra', 'geometry'],
                science: ['science', 'biology', 'chemistry', 'physics', 'STEM'],
                english: ['english', 'literacy', 'reading', 'writing', 'language arts'],
                history: ['history', 'social studies', 'geography', 'civics'],
                art: ['art', 'visual arts', 'creative', 'drawing'],
                music: ['music', 'band', 'orchestra', 'choir'],
                pe: ['physical education', 'sports', 'health', 'fitness'],
                tech: ['technology', 'computer', 'coding', 'STEM'],
            };
            return map[String(answer)] || [];
        },
        priority: 6,
    },
    {
        id: 'worst-subject',
        category: 'academic',
        question: "What subject made you want to fake sick?",
        subtitle: "We'll avoid matching you with that — promise.",
        type: 'single',
        options: [
            { value: 'math', label: 'Math', emoji: '😩' },
            { value: 'science', label: 'Science', emoji: '🥴' },
            { value: 'english', label: 'English', emoji: '😵' },
            { value: 'history', label: 'History', emoji: '😴' },
            { value: 'art', label: 'Art', emoji: '🙈' },
            { value: 'pe', label: 'P.E.', emoji: '💀' },
        ],
        skippable: true,
        profileKey: 'worstSubject',
        getKeywords: () => [], // Used to exclude, not include
        priority: 8,
    },
    {
        id: 'boring-subject',
        category: 'academic',
        question: "And the most boring class you ever sat through?",
        subtitle: "No judgment. We've all been there.",
        type: 'single',
        options: [
            { value: 'math', label: 'Math lectures', emoji: '💤' },
            { value: 'science', label: 'Bio labs', emoji: '😶' },
            { value: 'english', label: 'Grammar drills', emoji: '📋' },
            { value: 'history', label: 'History memorization', emoji: '📅' },
            { value: 'art', label: 'Art appreciation', emoji: '🖼️' },
            { value: 'none', label: 'I loved it all!', emoji: '🌟' },
        ],
        skippable: true,
        shouldShow: (profile) => !!profile.worstSubject,
        profileKey: 'boringSubject',
        getKeywords: () => [],
        priority: 9,
    },
    {
        id: 'school-stress',
        category: 'academic',
        question: "What stressed you out most in school?",
        subtitle: "Helps us understand what kind of learning environment you value.",
        type: 'single',
        options: [
            { value: 'tests', label: 'Standardized testing', emoji: '📊' },
            { value: 'social', label: 'Social pressure', emoji: '👥' },
            { value: 'homework', label: 'Too much homework', emoji: '📚' },
            { value: 'boredom', label: 'Being bored', emoji: '🥱' },
            { value: 'supplies', label: 'Not having the right supplies', emoji: '✏️' },
            { value: 'none', label: 'School was great, actually', emoji: '😎' },
        ],
        skippable: true,
        profileKey: 'schoolStress',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                tests: ['assessment', 'testing', 'standards'],
                social: ['social emotional', 'community', 'inclusion', 'belonging'],
                homework: ['engagement', 'project-based', 'hands-on'],
                boredom: ['engaging', 'creative', 'innovative', 'exciting'],
                supplies: ['supplies', 'materials', 'resources', 'equity'],
                none: [],
            };
            return map[String(answer)] || [];
        },
        priority: 10,
    },

    // ── PERSONALITY: The "why would they need this" questions ──
    {
        id: 'childhood-dream',
        category: 'personality',
        question: "When you were 8, what did you want to be when you grew up?",
        subtitle: "Astronaut? Dinosaur? Both?",
        type: 'single',
        options: [
            { value: 'astronaut', label: 'Astronaut', emoji: '🚀' },
            { value: 'doctor', label: 'Doctor / Vet', emoji: '🩺' },
            { value: 'teacher', label: 'Teacher', emoji: '📚' },
            { value: 'artist', label: 'Artist / Musician', emoji: '🎨' },
            { value: 'athlete', label: 'Pro athlete', emoji: '🏆' },
            { value: 'firefighter', label: 'Firefighter / Superhero', emoji: '🦸' },
            { value: 'scientist', label: 'Scientist / Inventor', emoji: '🔬' },
            { value: 'president', label: 'President / Leader', emoji: '🏛️' },
        ],
        skippable: true,
        profileKey: 'childhoodDream',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                astronaut: ['space', 'science', 'STEM', 'exploration', 'physics'],
                doctor: ['health', 'science', 'biology', 'helping', 'medical'],
                teacher: ['education', 'teaching', 'learning', 'mentoring'],
                artist: ['art', 'music', 'creative', 'expression', 'design'],
                athlete: ['sports', 'physical education', 'teamwork', 'health'],
                firefighter: ['community service', 'helping', 'courage', 'safety'],
                scientist: ['science', 'STEM', 'research', 'innovation', 'discovery'],
                president: ['leadership', 'civics', 'government', 'social studies'],
            };
            return map[String(answer)] || [];
        },
        priority: 7,
    },
    {
        id: 'pet-preference',
        category: 'wildcard',
        question: "Every classroom needs a class pet. You're picking — what is it?",
        subtitle: "This tells us more than you'd think.",
        type: 'single',
        options: [
            { value: 'dog', label: 'A big fluffy dog', emoji: '🐕' },
            { value: 'fish', label: 'A peaceful aquarium', emoji: '🐠' },
            { value: 'hamster', label: 'Hamsters or guinea pigs', emoji: '🐹' },
            { value: 'reptile', label: 'A bearded dragon or turtle', emoji: '🦎' },
            { value: 'butterfly', label: 'A butterfly garden', emoji: '🦋' },
            { value: 'none', label: 'No pets — too chaotic', emoji: '🚫' },
        ],
        skippable: true,
        shouldShow: (profile) => !seemsSporty(profile), // Sporty people get different questions
        profileKey: 'petPreference',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                dog: ['animals', 'therapy', 'social emotional', 'community'],
                fish: ['marine', 'science', 'calm', 'biology'],
                hamster: ['animals', 'biology', 'responsibility', 'science'],
                reptile: ['science', 'biology', 'ecology', 'nature'],
                butterfly: ['nature', 'garden', 'environment', 'metamorphosis', 'science'],
                none: ['structure', 'organized'],
            };
            return map[String(answer)] || [];
        },
        priority: 11,
    },
    {
        id: 'music-taste',
        category: 'wildcard',
        question: "You're DJing the school dance. What are you playing?",
        subtitle: "Don't overthink this one.",
        type: 'single',
        options: [
            { value: 'pop', label: 'Top 40 pop', emoji: '🎤' },
            { value: 'hip-hop', label: 'Hip-hop & R&B', emoji: '🎧' },
            { value: 'country', label: 'Country', emoji: '🤠' },
            { value: 'rock', label: 'Rock / Indie', emoji: '🎸' },
            { value: 'classical', label: 'Classical / Jazz', emoji: '🎻' },
            { value: 'eclectic', label: 'A little bit of everything', emoji: '🎶' },
        ],
        skippable: true,
        shouldShow: (_profile, answeredCount) => answeredCount < 8,
        profileKey: 'musicTaste',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                pop: ['music', 'arts', 'performance'],
                'hip-hop': ['music', 'arts', 'creative writing', 'expression', 'culture'],
                country: ['music', 'rural', 'community', 'tradition'],
                rock: ['music', 'band', 'creative', 'expression'],
                classical: ['music', 'orchestra', 'band', 'classical', 'fine arts'],
                eclectic: ['music', 'diversity', 'culture', 'arts'],
            };
            return map[String(answer)] || [];
        },
        priority: 12,
    },
    {
        id: 'weekend-activity',
        category: 'lifestyle',
        question: "Perfect Saturday morning — what are you doing?",
        subtitle: "Be honest, not aspirational.",
        type: 'single',
        options: [
            { value: 'farmers-market', label: "Farmer's market", emoji: '🧺' },
            { value: 'sleeping-in', label: 'Still in bed, thanks', emoji: '😴' },
            { value: 'exercise', label: 'Working out or running', emoji: '🏃' },
            { value: 'coffee-book', label: 'Coffee and a good book', emoji: '☕' },
            { value: 'volunteering', label: 'Volunteering', emoji: '🤝' },
            { value: 'tinkering', label: 'Building or fixing something', emoji: '🔧' },
        ],
        skippable: true,
        shouldShow: (profile) => !seemsSporty(profile) || profile.weekendActivity === undefined,
        profileKey: 'weekendActivity',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                'farmers-market': ['community', 'food', 'agriculture', 'local', 'garden'],
                'sleeping-in': ['wellness', 'balance'],
                exercise: ['health', 'fitness', 'physical education', 'sports'],
                'coffee-book': ['reading', 'literacy', 'books', 'learning'],
                volunteering: ['community service', 'helping', 'social impact', 'equity'],
                tinkering: ['maker', 'engineering', 'STEM', 'hands-on', 'building'],
            };
            return map[String(answer)] || [];
        },
        priority: 13,
    },

    // ── VALUES: What causes they care about ──
    {
        id: 'social-cause',
        category: 'values',
        question: "If you could snap your fingers and fix one thing in education, what would it be?",
        subtitle: "No wrong answers — but this one matters most to us.",
        type: 'single',
        options: [
            { value: 'equity', label: 'Equal access to resources', emoji: '⚖️' },
            { value: 'mental-health', label: 'Student mental health', emoji: '🧠' },
            { value: 'stem-access', label: 'STEM for every kid', emoji: '🔬' },
            { value: 'arts-funding', label: 'Arts programs in every school', emoji: '🎭' },
            { value: 'reading', label: 'Every kid reading at grade level', emoji: '📖' },
            { value: 'teacher-pay', label: 'Teachers paid what they deserve', emoji: '💰' },
        ],
        skippable: true,
        profileKey: 'socialCause',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                equity: ['equity', 'resources', 'supplies', 'poverty', 'underserved'],
                'mental-health': ['social emotional', 'wellness', 'mindfulness', 'counseling'],
                'stem-access': ['STEM', 'science', 'technology', 'engineering', 'math'],
                'arts-funding': ['art', 'music', 'theater', 'creative', 'performance'],
                reading: ['reading', 'literacy', 'books', 'library', 'phonics'],
                'teacher-pay': ['teaching', 'professional development', 'education'],
            };
            return map[String(answer)] || [];
        },
        priority: 14,
    },
    {
        id: 'travel-style',
        category: 'wildcard',
        question: "You won a free trip. Where are you going?",
        subtitle: "This might be the weirdest question on here.",
        type: 'single',
        options: [
            { value: 'national-park', label: 'A national park', emoji: '🏕️' },
            { value: 'european-city', label: 'A European city', emoji: '🏛️' },
            { value: 'tropical-beach', label: 'A tropical island', emoji: '🌴' },
            { value: 'road-trip', label: 'Road trip across America', emoji: '🚗' },
            { value: 'cultural-immersion', label: 'Cultural immersion somewhere new', emoji: '🌍' },
            { value: 'staycation', label: 'Honestly? Staying home', emoji: '🏠' },
        ],
        skippable: true,
        shouldShow: (_profile, answeredCount) => answeredCount < 10,
        profileKey: 'travelStyle',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                'national-park': ['nature', 'environment', 'outdoor', 'conservation', 'field trip'],
                'european-city': ['history', 'culture', 'art', 'architecture', 'language'],
                'tropical-beach': ['ocean', 'marine', 'environment', 'relaxation'],
                'road-trip': ['geography', 'adventure', 'exploration', 'community'],
                'cultural-immersion': ['culture', 'diversity', 'language', 'global', 'social studies'],
                staycation: ['comfort', 'home', 'community', 'local'],
            };
            return map[String(answer)] || [];
        },
        priority: 15,
    },
    {
        id: 'age-range',
        category: 'personality',
        question: "Last one in this batch — what decade were you born in?",
        subtitle: "We're trying to find a teacher you'd get along with at a dinner party.",
        type: 'single',
        options: [
            { value: '1950s', label: '1950s or earlier', emoji: '📻' },
            { value: '1960s', label: '1960s', emoji: '☮️' },
            { value: '1970s', label: '1970s', emoji: '🪩' },
            { value: '1980s', label: '1980s', emoji: '📼' },
            { value: '1990s', label: '1990s', emoji: '💿' },
            { value: '2000s', label: '2000s or later', emoji: '📱' },
        ],
        skippable: true,
        profileKey: 'ageRange',
        getKeywords: () => [],
        priority: 16,
    },

    // ── DEEP CUTS: Only shown if we need more signal ──
    {
        id: 'unusual-preference',
        category: 'wildcard',
        question: "You have to teach a class for one day. What subject?",
        subtitle: "No prep time. You're winging it. What would you crush?",
        type: 'single',
        options: [
            { value: 'life-skills', label: 'Life skills (taxes, cooking, budgeting)', emoji: '🏦' },
            { value: 'recess-science', label: 'The science of recess games', emoji: '🤸' },
            { value: 'weird-history', label: 'The weirdest moments in history', emoji: '🦑' },
            { value: 'creativity', label: 'Creativity & imagination hour', emoji: '💡' },
            { value: 'outdoor-survival', label: 'Outdoor survival skills', emoji: '🏕️' },
            { value: 'debate', label: 'Debate club', emoji: '🗣️' },
        ],
        skippable: true,
        shouldShow: (_profile, answeredCount) => answeredCount >= 5 && answeredCount < 12,
        profileKey: 'unusualPreference',
        getKeywords: (answer) => {
            const map: Record<string, string[]> = {
                'life-skills': ['financial literacy', 'life skills', 'practical', 'real-world'],
                'recess-science': ['physical education', 'science', 'play', 'movement'],
                'weird-history': ['history', 'social studies', 'storytelling', 'research'],
                creativity: ['creative', 'art', 'imagination', 'writing', 'innovation'],
                'outdoor-survival': ['outdoor', 'nature', 'science', 'adventure', 'environment'],
                debate: ['communication', 'social studies', 'critical thinking', 'civics'],
            };
            return map[String(answer)] || [];
        },
        priority: 17,
    },
];

/**
 * Returns dynamically generated hobby-detail options based on what hobbies
 * the donor selected.
 */
export function getHobbyDetailOptions(hobbies: string[]): { value: string; label: string; emoji: string }[] {
    const options: { value: string; label: string; emoji: string }[] = [];
    for (const hobby of hobbies) {
        const followUps = hobbyFollowUps[hobby];
        if (followUps) {
            options.push(...followUps);
        }
    }
    // Cap at 8 options to keep it manageable
    return options.slice(0, 8);
}

/**
 * Decides which questions to show next based on the current donor profile.
 * Acts like Akinator — stops when we have enough signal, extends if we don't.
 */
export function selectNextQuestions(
    profile: Partial<DonorProfile>,
    answeredIds: Set<string>,
): QuizQuestion[] {
    const answeredCount = answeredIds.size;

    // Calculate how much "signal" we have
    const signalStrength = calculateSignalStrength(profile);

    // If we have strong signal after enough questions, stop
    if (signalStrength > 0.7 && answeredCount >= 5) {
        return [];
    }

    // Filter to unanswered questions that should be shown
    const candidates = allQuestions
        .filter(q => !answeredIds.has(q.id))
        .filter(q => !q.shouldShow || q.shouldShow(profile, answeredCount))
        .sort((a, b) => a.priority - b.priority);

    // If we already have good signal, only return 1-2 more questions
    if (signalStrength > 0.5 && answeredCount >= 4) {
        return candidates.slice(0, 2);
    }

    // Return questions in priority order
    return candidates;
}

/**
 * Calculates how much useful matching signal we've collected.
 * Returns 0-1 where 1 means we have plenty of data.
 */
function calculateSignalStrength(profile: Partial<DonorProfile>): number {
    let score = 0;
    const weights: Record<string, number> = {
        favoriteSubject: 0.15,
        hobbies: 0.15,
        hobbyDetails: 0.1,
        sceneryPreference: 0.1,
        socialCause: 0.1,
        childhoodDream: 0.08,
        schoolStress: 0.08,
        worstSubject: 0.06,
        snackChoice: 0.04,
        weekendActivity: 0.06,
        favoriteCity: 0.04,
        musicTaste: 0.02,
        petPreference: 0.02,
    };

    for (const [key, weight] of Object.entries(weights)) {
        const val = profile[key];
        if (val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0)) {
            score += weight;
        }
    }

    return score;
}

/**
 * Given the full donor profile, returns all accumulated keywords for matching,
 * with duplicates collapsed and frequencies tracked.
 */
export function getMatchingKeywords(profile: Partial<DonorProfile>): Map<string, number> {
    const keywordCounts = new Map<string, number>();

    for (const question of allQuestions) {
        const answer = profile[question.profileKey];
        if (answer !== undefined && answer !== '') {
            const keywords = question.getKeywords(answer);
            for (const kw of keywords) {
                keywordCounts.set(kw.toLowerCase(), (keywordCounts.get(kw.toLowerCase()) || 0) + 1);
            }
        }
    }

    return keywordCounts;
}

/**
 * Returns subject IDs to exclude based on donor's disliked subjects.
 */
export function getExcludedSubjects(profile: Partial<DonorProfile>): string[] {
    const excluded: string[] = [];
    const subjectToId: Record<string, string> = {
        math: '8',
        science: '6',
        english: '4',
        history: '3',
        art: '1',
        pe: '11',
    };

    if (profile.worstSubject && profile.worstSubject !== profile.favoriteSubject) {
        const id = subjectToId[profile.worstSubject];
        if (id) excluded.push(id);
    }
    if (profile.boringSubject && profile.boringSubject !== 'none' && profile.boringSubject !== profile.favoriteSubject) {
        const id = subjectToId[profile.boringSubject];
        if (id && !excluded.includes(id)) excluded.push(id);
    }

    return excluded;
}
