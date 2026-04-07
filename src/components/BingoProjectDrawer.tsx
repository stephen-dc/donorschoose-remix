import { motion } from 'framer-motion'
import type { Project } from '../types'
import ProjectImage from './ProjectImage'

interface Props {
  project: Project
  marked: boolean
  onMark: () => void
  onClose: () => void
}

export default function BingoProjectDrawer({ project, marked, onMark, onClose }: Props) {
  return (
    <motion.div
      className="bingo-drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bingo-drawer"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        <div style={{ position: 'relative' }}>
          <div className="bingo-drawer-handle" />
          <button className="bingo-drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <ProjectImage
          src={project.imageURL || project.retinaImageURL}
          alt={project.title}
          className="bingo-drawer-img"
          fallbackClassName="bingo-drawer-img-fallback"
        />

        <div className="bingo-drawer-body">
          <span className="bingo-drawer-subject">{project.subject}</span>
          <h2 className="bingo-drawer-title">{project.title}</h2>
          <p className="bingo-drawer-meta">
            {project.teacherName} · {project.schoolName} · {project.city}, {project.state}
          </p>
          {project.shortDescription && (
            <p className="bingo-drawer-description">{project.shortDescription}</p>
          )}
          <p className="bingo-drawer-cost">
            Needs <strong>${project.costToComplete.toLocaleString()}</strong> to complete
            {project.percentFunded > 0 && ` · ${Math.round(project.percentFunded)}% funded`}
          </p>
        </div>

        <div className="bingo-drawer-actions">
          <button
            className={`bingo-mark-btn${marked ? ' bingo-mark-btn--remove' : ''}`}
            onClick={onMark}
          >
            {marked ? '✓ Remove from Cart' : 'Add to Cart + Mark ✓'}
          </button>
          <a
            className="bingo-dc-link"
            href={project.proposalURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on DonorsChoose →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
