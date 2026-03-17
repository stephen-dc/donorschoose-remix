interface ProgressBarProps {
    progress: number;
    questionsAnswered: number;
}

export function ProgressBar({ progress, questionsAnswered }: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="dtm-progress">
            <div className="dtm-progress__bar">
                <div
                    className="dtm-progress__fill"
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
            <span className="dtm-progress__label">
                {questionsAnswered === 0
                    ? "Let's get started"
                    : clampedProgress >= 100
                        ? 'Ready to match!'
                        : `${questionsAnswered} answered`}
            </span>
        </div>
    );
}
