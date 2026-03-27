const MILESTONES = [25, 50, 75, 100]

interface FundraiserProgressBarProps {
  raised: number
  goal: number
  donorCount: number
  onMilestoneClick?: (amount: number) => void
}

export default function FundraiserProgressBar({ raised, goal, donorCount, onMilestoneClick }: FundraiserProgressBarProps) {
  const pct = Math.min((raised / goal) * 100, 100)

  return (
    <div className="fundraiser-progress">
      <div className="fundraiser-progress__amounts">
        <div className="fundraiser-progress__raised">
          ${raised.toLocaleString()} <span>raised</span>
        </div>
        <div className="fundraiser-progress__goal">
          of ${goal.toLocaleString()} goal
        </div>
      </div>
      <div className="fundraiser-progress__bar-wrap">
        <div className="fundraiser-progress__bar">
          <div className="fundraiser-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="fundraiser-progress__milestones">
          {MILESTONES.map((m) => {
            const reached = pct >= m
            const amountNeeded = Math.max(0, Math.ceil((m / 100) * goal) - raised)
            return (
              <button
                key={m}
                className={`fundraiser-progress__milestone${reached ? ' fundraiser-progress__milestone--reached' : ''}`}
                style={{ left: `${m}%` }}
                onClick={() => !reached && amountNeeded > 0 && onMilestoneClick?.(amountNeeded)}
                title={reached ? `${m}% reached!` : `$${amountNeeded.toLocaleString()} to reach ${m}%`}
              >
                <div className="fundraiser-progress__milestone-dot">
                  {reached ? '✓' : ''}
                </div>
                <div className="fundraiser-progress__milestone-label">{m}%</div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="fundraiser-progress__meta">
        <span><strong>{donorCount}</strong> donor{donorCount !== 1 ? 's' : ''}</span>
        <span><strong>{Math.round(pct)}%</strong> funded</span>
      </div>
    </div>
  )
}
