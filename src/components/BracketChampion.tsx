import type { Project } from '../types'
import ProjectImage from './ProjectImage'
import '../styles/bracket.css'

interface Props {
  project: Project
  budget: number | null
  onFund: () => void
  onPlayAgain: () => void
  onHome: () => void
}

export default function BracketChampion({ project, budget, onFund, onPlayAgain, onHome }: Props) {
  const pct = Math.min(100, Math.round(project.percentFunded))
  const amount = budget ?? project.costToComplete

  return (
    <div className="bracket-champion-screen">
      <header className="bracket-champion-header">
        <button className="home-btn" onClick={onHome} aria-label="Home">🏠</button>
      </header>

      <div className="bracket-champion-hero">
        <div className="bracket-champion-trophy">🏆</div>
        <h1>We have a champion!</h1>
        <p>7 classrooms were defeated. This one earned it.</p>
      </div>

      <div className="bracket-champion-card">
        <ProjectImage
          src={project.retinaImageURL || project.imageURL}
          alt={project.title}
          className="bracket-champion-img"
          fallbackClassName="bracket-champion-img-fallback"
        />
        <div className="bracket-champion-info">
          {project.subject && (
            <span className="picks-card-subject" style={{ fontSize: '0.7rem' }}>{project.subject}</span>
          )}
          <h2>{project.title}</h2>
          <p className="teacher">{project.teacherName} · {project.schoolName}</p>
          <p className="location">
            📍 {project.city}, {project.state}
            {project.gradeLevel?.label ? ` · ${project.gradeLevel.label}` : ''}
          </p>
          <div className="bracket-funding-bar">
            <div className="bracket-funding-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="bracket-funding-text">
            <span>{pct}% funded</span>
            <span>${project.costToComplete.toLocaleString()} needed</span>
          </div>
        </div>
      </div>

      <div className="bracket-champion-actions">
        <button className="bracket-fund-btn" onClick={onFund}>
          🏆 Fund This Classroom — ${amount.toLocaleString()}
        </button>
        <button className="bracket-again-btn" onClick={onPlayAgain}>
          ↺ Run Another Bracket
        </button>
      </div>
    </div>
  )
}
