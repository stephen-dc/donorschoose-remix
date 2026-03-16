import { useState } from 'react'
import type { Project } from '../types'

interface Props {
  pair: [Project, Project]
  round: number    // 0-based
  budget: number
  onPick: (winner: Project) => void
  onHome: () => void
}

export default function PicksVsScreen({ pair, round, budget, onPick, onHome }: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [left, right] = pair
  const pct = (round / budget) * 100

  function handlePick(project: Project) {
    if (pickedId !== null) return  // debounce double-tap
    setPickedId(project.id)
    // Brief flash, then advance
    setTimeout(() => {
      setPickedId(null)
      onPick(project)
    }, 220)
  }

  return (
    <div className="picks-vs-screen">
      <header className="picks-vs-header">
        <button className="back-btn" onClick={onHome} aria-label="Home">
          ←
        </button>
        <span className="picks-round-label">
          Round {round + 1} of {budget}
        </span>
        <button className="home-btn" onClick={onHome} aria-label="Home" style={{ visibility: 'hidden' }}>
          🏠
        </button>
      </header>

      <div className="picks-progress-wrap">
        <div className="picks-progress-track">
          <div className="picks-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="picks-vs-arena">
        <PickCard
          project={left}
          picked={pickedId === left.id}
          onPick={() => handlePick(left)}
        />
        <div className="picks-vs-divider">VS</div>
        <PickCard
          project={right}
          picked={pickedId === right.id}
          onPick={() => handlePick(right)}
        />
      </div>
    </div>
  )
}

function PickCard({
  project,
  picked,
  onPick,
}: {
  project: Project
  picked: boolean
  onPick: () => void
}) {
  return (
    <div
      className={`picks-project-card${picked ? ' picked' : ''}`}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onPick()}
      aria-label={`Pick: ${project.title}`}
    >
      {project.imageURL ? (
        <div
          className="picks-card-image"
          style={{ backgroundImage: `url(${project.retinaImageURL || project.imageURL})` }}
        />
      ) : (
        <div className="picks-card-image-fallback">🎓</div>
      )}
      <div className="picks-card-gradient" />
      <div className="picks-card-content">
        {project.subject && (
          <span className="picks-card-subject">{project.subject}</span>
        )}
        <p className="picks-card-title">{project.title}</p>
        <p className="picks-card-location">📍 {project.city}, {project.state}</p>
      </div>
    </div>
  )
}
