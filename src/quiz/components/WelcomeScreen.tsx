interface WelcomeScreenProps {
    onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    return (
        <div className="dtm-welcome">
            <div className="dtm-welcome__content">
                <h1 className="dtm-welcome__title">
                    Find Your<br />
                    <span className="dtm-welcome__highlight">Perfect Teacher</span>
                </h1>
                <p className="dtm-welcome__subtitle">
                    Answer a few questions — some serious, some delightfully weird — and
                    we'll match you with a real teacher whose classroom needs your help.
                </p>
                <div className="dtm-welcome__features">
                    <div className="dtm-welcome__feature">
                        <span className="dtm-welcome__feature-icon">🧠</span>
                        <span>Adaptive quiz that learns as you go</span>
                    </div>
                    <div className="dtm-welcome__feature">
                        <span className="dtm-welcome__feature-icon">🎯</span>
                        <span>Matched to a teacher based on your personality</span>
                    </div>
                    <div className="dtm-welcome__feature">
                        <span className="dtm-welcome__feature-icon">⏱️</span>
                        <span>Takes 2-5 minutes — skip any question</span>
                    </div>
                </div>
                <button className="dtm-welcome__cta" onClick={onStart}>
                    Let's Find My Teacher
                </button>
                <p className="dtm-welcome__disclaimer">
                    No account needed. No spam. Just a fun way to give.
                </p>
            </div>
        </div>
    );
}
