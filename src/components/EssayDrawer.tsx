import { motion } from 'framer-motion'
import type { Project } from '../types'
import '../styles/essay-drawer.css'

interface Props {
  project: Project | null
  onClose: () => void
}

export default function EssayDrawer({ project, onClose }: Props) {
  if (!project) return null

  const body = project.essay?.trim() || project.shortDescription

  return (
    <motion.div
      className="essay-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="essay-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        <div className="essay-handle-bar" />

        <div className="essay-header">
          <div className="essay-header-text">
            <h3 className="essay-title">{project.title}</h3>
            <p className="essay-teacher">{project.teacherName} · {project.schoolName}</p>
          </div>
          <button className="essay-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="essay-body">
          {body
            ? body.split(/\n+/).map((para, i) => (
                <p key={i} className="essay-paragraph">{para}</p>
              ))
            : <p className="essay-empty">No essay available for this project.</p>
          }
        </div>

        <div className="essay-footer">
          <a
            href={project.proposalURL}
            target="_blank"
            rel="noopener noreferrer"
            className="essay-link-btn"
          >
            See full project on DonorsChoose →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
