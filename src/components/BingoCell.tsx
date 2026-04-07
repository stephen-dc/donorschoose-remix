import type { Project } from '../types'
import ProjectImage from './ProjectImage'

export interface BingoCellData {
  project: Project | null
  marked: boolean
}

interface Props {
  cell: BingoCellData
  isBingoLine: boolean
  onClick: () => void
}

export default function BingoCell({ cell, isBingoLine, onClick }: Props) {
  const { project, marked } = cell

  if (!project) {
    return <div className="bingo-cell bingo-cell--empty" />
  }

  return (
    <button
      className={`bingo-cell${isBingoLine ? ' bingo-cell--bingo-line' : ''}`}
      onClick={onClick}
      title={project.title}
    >
      <ProjectImage
        src={project.thumbImageURL || project.imageURL}
        alt={project.title}
        className="bingo-cell-img"
        fallbackClassName="bingo-cell-img-fallback"
        loading="lazy"
      />
      <div className="bingo-cell-body">
        <div className="bingo-cell-title">{project.title}</div>
        <div className="bingo-cell-cost">${project.costToComplete.toLocaleString()}</div>
      </div>
      {marked && (
        <div className="bingo-cell-marked-overlay" aria-label="Funded">✓</div>
      )}
    </button>
  )
}
