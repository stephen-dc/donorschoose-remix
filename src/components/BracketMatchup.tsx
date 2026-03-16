import { useState } from 'react'
import type { Project } from '../types'
import '../styles/picks.css'

const ROUND_LABELS: Record<number, string> = {
  1: 'Quarterfinals',
  2: 'Semifinals',
  3: 'Final',
}

interface Props {
  pair: [Project, Project]
  round: number        // 1-based
  matchupIndex: number // 0-based within round
  totalMatchups: number
  onPick: (winner: Project) => void
  onHome: () => void
}

export default function BracketMatchup({
  pair,
  round,
  matchupIndex,
  totalMatchups,
  onPick,
  onHome,
}: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [left, right] = pair
  const roundLabel = ROUND_LABELS[round] ?? `Round ${round}`

  function handlePick(project: Project) {
    if (pickedId !== null) return
    setPickedId(project.id)
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
        <div style={{ textAlign: 'center' }}>
          <span className="picks-round-label">{roundLabel}</span>
          {totalMatchups > 1 && (
            <div style={{ fontSize: '0.7rem', opacity: 0.55, marginTop: '0.1rem' }}>
              Match {matchupIndex + 1} of {totalMatchups}
            </div>
          )}
        </div>
        <button className="home-btn" onClick={onHome} aria-label="Home" style={{ visibility: 'hidden' }}>
          🏠
        </button>
      </header>

      <div className="picks-vs-arena">
        <BracketCard
          project={left}
          picked={pickedId === left.id}
          onPick={() => handlePick(left)}
        />
        <div className="picks-vs-divider">VS</div>
        <BracketCard
          project={right}
          picked={pickedId === right.id}
          onPick={() => handlePick(right)}
        />
      </div>
    </div>
  )
}

function BracketCard({
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
