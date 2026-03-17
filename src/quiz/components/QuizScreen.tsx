import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { DonorProfile, QuizQuestion, QuizOption } from '../types';
import { selectNextQuestions, getHobbyDetailOptions } from '../questions';
import { expandHobbyKeywords } from '../hobbyKeywords';
import { ProgressBar } from './ProgressBar';

interface QuizScreenProps {
    onComplete: (profile: Partial<DonorProfile>) => void;
    initialProfile: Partial<DonorProfile>;
}

export function QuizScreen({ onComplete, initialProfile }: QuizScreenProps) {
    const [profile, setProfile] = useState<Partial<DonorProfile>>(initialProfile);
    const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
    const [, setCurrentQuestionIndex] = useState(0);
    const [selectedMulti, setSelectedMulti] = useState<Set<string>>(new Set());
    const [textInput, setTextInput] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const questionRef = useRef<HTMLDivElement>(null);

    // Get the ordered list of remaining questions
    const remainingQuestions = useMemo(
        () => selectNextQuestions(profile, answeredIds),
        [profile, answeredIds],
    );

    const currentQuestion: QuizQuestion | null = remainingQuestions[0] || null;

    // Dynamic options for hobby-detail (sync) and custom-hobby-keywords (async via Datamuse)
    const [asyncOptions, setAsyncOptions] = useState<QuizOption[] | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const syncDynamicOptions = useMemo(() => {
        if (currentQuestion?.id === 'hobby-detail' && Array.isArray(profile.hobbies)) {
            return getHobbyDetailOptions(profile.hobbies);
        }
        return null;
    }, [currentQuestion?.id, profile.hobbies]);

    useEffect(() => {
        if (currentQuestion?.id !== 'custom-hobby-keywords' || typeof profile.customHobby !== 'string') {
            setAsyncOptions(null);
            return;
        }
        let cancelled = false;
        setLoadingOptions(true);
        expandHobbyKeywords(profile.customHobby).then(results => {
            if (!cancelled) {
                setAsyncOptions(results);
                setLoadingOptions(false);
            }
        });
        return () => { cancelled = true; };
    }, [currentQuestion?.id, profile.customHobby]);

    const options: QuizOption[] = syncDynamicOptions || asyncOptions || currentQuestion?.options || [];

    // Total questions estimate for progress bar
    const totalEstimate = useMemo(() => {
        const answered = answeredIds.size;
        const remaining = remainingQuestions.length;
        return Math.max(answered + remaining, answered + 1);
    }, [answeredIds.size, remainingQuestions.length]);

    const progress = totalEstimate > 0 ? (answeredIds.size / totalEstimate) * 100 : 0;

    const advanceToNext = useCallback((questionId: string, newProfile: Partial<DonorProfile>) => {
        setIsTransitioning(true);
        setAnsweredIds(prev => {
            const next = new Set(prev);
            next.add(questionId);
            return next;
        });
        setSelectedMulti(new Set());
        setTextInput('');

        setTimeout(() => {
            setProfile(newProfile);
            setCurrentQuestionIndex(i => i + 1);
            setIsTransitioning(false);
            questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }, []);

    const handleSingleAnswer = useCallback((question: QuizQuestion, value: string) => {
        const newProfile = { ...profile, [question.profileKey]: value };
        advanceToNext(question.id, newProfile);
    }, [profile, advanceToNext]);

    const handleMultiSubmit = useCallback((question: QuizQuestion) => {
        const values = Array.from(selectedMulti);
        if (values.length === 0) return;
        const newProfile = { ...profile, [question.profileKey]: values };
        advanceToNext(question.id, newProfile);
    }, [profile, selectedMulti, advanceToNext]);

    const handleTextSubmit = useCallback((question: QuizQuestion) => {
        if (!textInput.trim()) return;
        const newProfile = { ...profile, [question.profileKey]: textInput.trim() };
        advanceToNext(question.id, newProfile);
    }, [profile, textInput, advanceToNext]);

    const handleSkip = useCallback((question: QuizQuestion) => {
        advanceToNext(question.id, profile);
    }, [profile, advanceToNext]);

    const handleFinish = useCallback(() => {
        onComplete(profile);
    }, [profile, onComplete]);

    // Auto-complete when no more questions
    useEffect(() => {
        if (!currentQuestion && answeredIds.size > 0) {
            const timer = setTimeout(handleFinish, 500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, answeredIds.size, handleFinish]);

    // No more questions
    if (!currentQuestion && answeredIds.size > 0) {
        return (
            <div className="dtm-quiz">
                <ProgressBar progress={100} questionsAnswered={answeredIds.size} />
                <div className="dtm-quiz__complete">
                    <div className="dtm-quiz__complete-icon">✨</div>
                    <h2>All done! Let's find your teacher...</h2>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="dtm-quiz">
            <ProgressBar progress={progress} questionsAnswered={answeredIds.size} />

            <div
                className={`dtm-quiz__question-wrapper ${isTransitioning ? 'dtm-quiz__question-wrapper--exiting' : 'dtm-quiz__question-wrapper--entering'}`}
                ref={questionRef}
            >
                <div className="dtm-quiz__question-header">
                    <span className="dtm-quiz__question-category">
                        {getCategoryLabel(currentQuestion.category)}
                    </span>
                    <span className="dtm-quiz__question-number">
                        {answeredIds.size + 1} of ~{totalEstimate}
                    </span>
                </div>

                <h2 className="dtm-quiz__question-text">{currentQuestion.question}</h2>
                {currentQuestion.subtitle && (
                    <p className="dtm-quiz__question-subtitle">{currentQuestion.subtitle}</p>
                )}

                <div className="dtm-quiz__options">
                    {currentQuestion.type === 'text' ? (
                        <div className="dtm-quiz__text-input-wrapper">
                            <input
                                type="text"
                                className="dtm-quiz__text-input"
                                placeholder="Type your answer..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTextSubmit(currentQuestion);
                                }}
                                autoFocus
                            />
                            <button
                                className="dtm-quiz__text-submit"
                                onClick={() => handleTextSubmit(currentQuestion)}
                                disabled={!textInput.trim()}
                            >
                                Next
                            </button>
                        </div>
                    ) : currentQuestion.type === 'multi' ? (
                        <>
                            {loadingOptions && currentQuestion.id === 'custom-hobby-keywords' ? (
                                <div className="dtm-quiz__loading-options">
                                    <div className="dtm-results__spinner" />
                                    <span>Finding related topics...</span>
                                </div>
                            ) : null}
                            <div className="dtm-quiz__multi-grid">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`dtm-quiz__option dtm-quiz__option--multi ${selectedMulti.has(option.value) ? 'dtm-quiz__option--selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMulti(prev => {
                                                const next = new Set(prev);
                                                if (next.has(option.value)) {
                                                    next.delete(option.value);
                                                } else {
                                                    next.add(option.value);
                                                }
                                                return next;
                                            });
                                        }}
                                    >
                                        {option.emoji && <span className="dtm-quiz__option-emoji">{option.emoji}</span>}
                                        <span className="dtm-quiz__option-label">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="dtm-quiz__multi-submit"
                                onClick={() => handleMultiSubmit(currentQuestion)}
                                disabled={selectedMulti.size === 0}
                            >
                                Continue with {selectedMulti.size} selected
                            </button>
                        </>
                    ) : currentQuestion.type === 'image' ? (
                        <div className="dtm-quiz__image-grid">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    className="dtm-quiz__option dtm-quiz__option--image"
                                    onClick={() => handleSingleAnswer(currentQuestion, option.value)}
                                >
                                    <span className="dtm-quiz__option-image-emoji">{option.emoji}</span>
                                    <span className="dtm-quiz__option-label">{option.label}</span>
                                    {option.description && (
                                        <span className="dtm-quiz__option-description">{option.description}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="dtm-quiz__single-grid">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    className="dtm-quiz__option dtm-quiz__option--single"
                                    onClick={() => handleSingleAnswer(currentQuestion, option.value)}
                                >
                                    {option.emoji && <span className="dtm-quiz__option-emoji">{option.emoji}</span>}
                                    <span className="dtm-quiz__option-label">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dtm-quiz__actions">
                    {currentQuestion.skippable && (
                        <button
                            className="dtm-quiz__skip"
                            onClick={() => handleSkip(currentQuestion)}
                        >
                            Skip this one
                        </button>
                    )}
                    {answeredIds.size >= 3 && (
                        <button
                            className="dtm-quiz__finish-early"
                            onClick={handleFinish}
                        >
                            Find my teacher now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        warmup: 'Getting to know you',
        academic: 'School memories',
        personality: 'About you',
        lifestyle: 'Your world',
        values: 'What matters',
        wildcard: 'Just for fun',
    };
    return labels[category] || category;
}
