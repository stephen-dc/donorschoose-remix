export interface DonorProfile {
    favoriteCity: string;
    favoriteSubject: string;
    hobbies: string[];
    hobbyDetails: string[];
    sceneryPreference: string;
    childhoodDream: string;
    schoolStress: string;
    worstSubject: string;
    boringSubject: string;
    ageRange: string;
    socialCause: string;
    unusualPreference: string;
    snackChoice: string;
    weekendActivity: string;
    musicTaste: string;
    petPreference: string;
    travelStyle: string;
    customHobby: string;
    customHobbyKeywords: string[];
    [key: string]: string | string[];
}

export interface QuizQuestion {
    id: string;
    category: 'warmup' | 'academic' | 'personality' | 'lifestyle' | 'values' | 'wildcard';
    question: string;
    subtitle?: string;
    type: 'single' | 'multi' | 'image' | 'text';
    options: QuizOption[];
    skippable: boolean;
    shouldShow?: (profile: Partial<DonorProfile>, answeredCount: number) => boolean;
    profileKey: keyof DonorProfile;
    getKeywords: (answer: string | string[]) => string[];
    priority: number;
}

export interface QuizOption {
    value: string;
    label: string;
    emoji?: string;
    imageUrl?: string;
    description?: string;
}

export interface TeacherProject {
    id: string;
    title: string;
    proposalUrl: string;
    fundUrl: string;
    shortDescription: string;
    subject: string;
    gradeLevel: string;
    costToComplete: string;
    totalPrice: string;
    percentFunded: string;
    numStudents: string;
    fundingStatus: string;
    classroomImageUrl: string;
    resources: ProjectResource[];
}

export interface TeacherMatch {
    teacherId: string;
    teacherName: string;
    prefix: string;
    teacherPhotoUrl: string;
    schoolName: string;
    city: string;
    state: string;
    povertyLevel: string;
    freeReducedLunch: string;
    matchReasons: MatchReason[];
    matchScore: number;
    // Teacher-level aggregates
    totalProjects: number;
    fundedProjects: number;
    totalStudentsReached: number;
    subjects: string[];
    // All projects (active first, then funded)
    projects: TeacherProject[];
    // Best active project if one exists, otherwise null
    activeProject: TeacherProject | null;
}

export interface MatchReason {
    icon: string;
    text: string;
    strength: 'strong' | 'medium' | 'light';
}

export interface ProjectResource {
    name: string;
    quantity: number;
    totalPrice: string;
}

export interface MatchingThought {
    text: string;
    icon: string;
    delay: number;
}
