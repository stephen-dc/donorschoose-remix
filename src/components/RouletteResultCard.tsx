import type { Project } from '../types'

interface Props {
  project: Project
  cartCount: number
  onFund: () => void
  onSpinAgain: () => void
  onBack: () => void
  onOpenCart: () => void
  onHome: () => void
}

export default function RouletteResultCard({
  project,
  cartCount,
  onFund,
  onSpinAgain,
  onBack,
  onOpenCart,
  onHome,
}: Props) {
  const pct = Math.min(100, Math.round(project.percentFunded))

  return (
    <div className="roulette-result-screen">
      <header className="roulette-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>DC Roulette</h2>
        <div className="swipe-header-right">
          <button className="home-btn" onClick={onHome} aria-label="Home">
            🏠
          </button>
          <button className="cart-btn" onClick={onOpenCart} aria-label="Open cart">
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="result-reveal">
        <p className="result-reveal-text">🎯 The wheel has spoken!</p>
      </div>

      <div className="result-card">
        <div className="result-image-wrap">
          {project.imageURL ? (
            <img
              src={project.retinaImageURL || project.imageURL}
              alt={project.title}
              loading="lazy"
            />
          ) : (
            <div className="result-image-fallback">🎓</div>
          )}
        </div>

        <div className="result-meta">
          {project.subject && (
            <span className="card-subject-badge">{project.subject}</span>
          )}
          <h2 className="result-title">{project.title}</h2>
          <p className="result-teacher">
            {project.teacherName} · {project.schoolName}
          </p>
          <p className="result-location">
            📍 {project.city}, {project.state}
            {project.gradeLevel?.label ? ` · ${project.gradeLevel.label}` : ''}
          </p>
        </div>

        <div className="result-funding">
          <div className="funding-bar-track">
            <div
              className="funding-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="funding-text">
            <span>{pct}% funded</span>
            <span>
              ${project.costToComplete.toFixed(2)} needed
              {project.numStudents > 0 ? ` · ${project.numStudents} students` : ''}
            </span>
          </div>
        </div>

        {project.shortDescription && (
          <p className="result-description">{project.shortDescription}</p>
        )}
      </div>

      <div className="result-actions">
        <button className="fund-btn" onClick={onFund}>
          💚 Fund This! (${project.costToComplete.toFixed(2)})
        </button>
        <button className="spin-again-btn" onClick={onSpinAgain}>
          🎰 Spin Again
        </button>
      </div>
    </div>
  )
}
