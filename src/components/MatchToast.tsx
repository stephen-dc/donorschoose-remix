import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../types'

interface Props {
  project: Project
  onDismiss: () => void
}

export default function MatchToast({ project, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const teacherFirst = project.teacherName.split(' ')[0] ?? project.teacherName
  const shareText = `I just matched with ${project.teacherName}'s classroom in ${project.city}, ${project.state} on DonorsChoose! 🍎\n${project.proposalURL}`

  const hasShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  function handleShare() {
    navigator.share({
      title: `${project.teacherName}'s classroom needs your help!`,
      text: `I just matched with ${project.teacherName}'s classroom in ${project.city}, ${project.state} on DonorsChoose! 🍎`,
      url: project.proposalURL,
    }).catch(() => {/* user cancelled or error */})
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      className="match-toast"
      initial={{ y: -88, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -88, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      {project.imageURL ? (
        <img
          className="match-toast-thumb"
          src={project.retinaImageURL || project.imageURL}
          alt={project.title}
        />
      ) : (
        <div className="match-toast-thumb match-toast-thumb--fallback">🏫</div>
      )}

      <div className="match-toast-body">
        <p className="match-toast-headline">
          ❤️ Matched with <strong>{teacherFirst}</strong>!
        </p>
        <p className="match-toast-location">📍 {project.city}, {project.state}</p>
        <div className="match-toast-actions">
          {hasShare && (
            <button className="match-toast-btn" onClick={handleShare}>
              Share 📤
            </button>
          )}
          <button className="match-toast-btn" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy link 🔗'}
          </button>
        </div>
      </div>

      <button className="match-toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </motion.div>
  )
}
