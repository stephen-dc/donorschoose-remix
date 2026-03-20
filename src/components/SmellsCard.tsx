import type { Project } from '../types'
import { getScentProfile } from './SmellsApp'

interface Props {
  project: Project
  isInCart: boolean
  onToggleCart: () => void
}

export default function SmellsCard({ project, isInCart, onToggleCart }: Props) {
  const scent = getScentProfile(project)
  const fundedPct = Math.min(100, Math.round(project.percentFunded))

  return (
    <div className={`smells-card${isInCart ? ' is-in-cart' : ''}`}>
      <div className="smells-card-img-wrap">
        {project.thumbImageURL && (
          <img
            src={project.thumbImageURL}
            alt={project.title}
            className="smells-card-img"
            loading="lazy"
          />
        )}
        <span className={`smells-scent-badge smells-scent-badge--${scent.label.toLowerCase().replace(/[^a-z]/g, '-')}`}>
          {scent.emoji} {scent.label}
        </span>
      </div>

      <div className="smells-card-body">
        <h3 className="smells-card-title">{project.title}</h3>
        <p className="smells-card-teacher">
          {project.teacherName} · {project.schoolName}
        </p>
        <p className="smells-card-desc">{project.shortDescription}</p>

        <div className="smells-progress-wrap">
          <div className="smells-progress-track">
            <div className="smells-progress-fill" style={{ width: `${fundedPct}%` }} />
          </div>
          <span className="smells-progress-pct">{fundedPct}% funded</span>
        </div>

        <button
          className={`smells-add-btn${isInCart ? ' is-added' : ''}`}
          onClick={onToggleCart}
        >
          {isInCart ? '✅ In Basket' : '🧺 Add to Basket'}
        </button>
      </div>
    </div>
  )
}
