import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { DonorProfile, TeacherMatch, MatchingThought } from './types';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { WelcomeScreen } from './components/WelcomeScreen';

type Screen = 'welcome' | 'quiz' | 'matching' | 'results';

export function DonorTeacherMatcher() {
    const [screen, setScreen] = useState<Screen>('welcome');
    const [profile, setProfile] = useState<Partial<DonorProfile>>({});
    const [match, setMatch] = useState<TeacherMatch | null>(null);
    const [thoughts, setThoughts] = useState<MatchingThought[]>([]);

    const handleStart = useCallback(() => {
        setScreen('quiz');
    }, []);

    const handleQuizComplete = useCallback((finalProfile: Partial<DonorProfile>) => {
        setProfile(finalProfile);
        setScreen('matching');
    }, []);

    const handleMatchFound = useCallback((teacherMatch: TeacherMatch, matchingThoughts: MatchingThought[]) => {
        setMatch(teacherMatch);
        setThoughts(matchingThoughts);
        setScreen('results');
    }, []);

    const handleRetry = useCallback(() => {
        setProfile({});
        setMatch(null);
        setThoughts([]);
        setScreen('quiz');
    }, []);

    return (
        <div className="donor-teacher-matcher">
            <nav className="dtm-nav">
                <Link to="/" className="dtm-nav__back">&larr; Home</Link>
                <span className="dtm-nav__title">Find Your Teacher</span>
            </nav>
            {screen === 'welcome' && (
                <WelcomeScreen onStart={handleStart} />
            )}
            {screen === 'quiz' && (
                <QuizScreen
                    onComplete={handleQuizComplete}
                    initialProfile={profile}
                />
            )}
            {(screen === 'matching' || screen === 'results') && (
                <ResultsScreen
                    profile={profile}
                    match={match}
                    thoughts={thoughts}
                    isLoading={screen === 'matching'}
                    onMatchFound={handleMatchFound}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
}
