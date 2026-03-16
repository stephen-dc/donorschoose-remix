import type { Project } from '../types'
import { buildCartUrl } from '../utils/cartUrl'
import ProjectImage from './ProjectImage'

interface Props {
  projects: Project[]
  pickMap: Record<string, number>
  budget: number
  onPlayAgain: () => void
  onHome: () => void
}

const RANK_EMOJI = ['🥇', '🥈', '🥉']

export default function PicksResultsScreen({
  projects,
  pickMap,
  budget,
  onPlayAgain,
  onHome,
}: Props) {
  const ranked = projects
    .filter(p => (pickMap[p.id] ?? 0) > 0)
    .sort((a, b) => (pickMap[b.id] ?? 0) - (pickMap[a.id] ?? 0))

  const projectCount = ranked.length

  const donateAllUrl = buildCartUrl(
    ranked.map(p => ({ proposalId: p.id, amount: pickMap[p.id] ?? 0 }))
  )

  return (
    <div className="picks-results-screen">
      <div className="picks-results-hero">
        <div className="emoji">🏆</div>
        <h1>Your Picks!</h1>
        <p>
          ${budget} spread across {projectCount} classroom{projectCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="picks-results-list">
        {ranked.map((project, i) => {
          const dollars = pickMap[project.id] ?? 0
          const rank = i < 3 ? RANK_EMOJI[i] : String(i + 1)
          const singleUrl = buildCartUrl([{ proposalId: project.id, amount: dollars }])

          return (
            <div key={project.id} className="picks-result-row">
              <span className="picks-result-rank">{rank}</span>

              <ProjectImage
                src={project.thumbImageURL || project.imageURL}
                alt={project.title}
                className="picks-result-img"
                fallbackClassName="picks-result-img-fallback"
                loading="lazy"
              />

              <div className="picks-result-info">
                <p className="picks-result-title">{project.title}</p>
                <p className="picks-result-location">
                  {project.teacherName} · {project.city}, {project.state}
                </p>
              </div>

              <div className="picks-result-right">
                <span className="picks-result-badge">${dollars}</span>
                <a
                  href={singleUrl}
                  className="picks-donate-link"
                >
                  Donate →
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="picks-results-footer">
        <a href={donateAllUrl} className="picks-donate-all-btn">
          💝 Donate All ${budget} →
        </a>
        <div className="picks-footer-row">
          <button className="picks-play-again-btn" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="picks-home-btn" onClick={onHome}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  )
}
