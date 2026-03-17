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
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const shareText = `I just matched with ${project.teacherName}'s classroom in ${project.city}, ${project.state} on DonorsChoose! 🍎\n${project.proposalURL}`
  const hasShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  function handleShare() {
    navigator.share({
      title: `${project.teacherName}'s classroom needs your help!`,
      text: `I just matched with ${project.teacherName}'s classroom in ${project.city}, ${project.state} on DonorsChoose! 🍎`,
      url: project.proposalURL,
    }).catch(() => {})
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="match-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      />

      {/* Centering shell — pointer-events: none so clicks pass through to backdrop */}
      <div className="match-card-wrap">
        <motion.div
          className="match-card"
          initial={{ scale: 0.82, opacity: 0, y: 32 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* Photo */}
          <div className="match-card-photo">
            {project.imageURL ? (
              <img
                src={project.retinaImageURL || project.imageURL}
                alt={project.title}
                className="match-card-photo-img"
              />
            ) : (
              <div className="match-card-photo-fallback">🏫</div>
            )}
            <div className="match-card-photo-gradient" />
            <div className="match-card-hearts">
              <span className="match-heart match-heart--1">❤️</span>
              <span className="match-heart match-heart--2">❤️</span>
              <span className="match-heart match-heart--3">❤️</span>
            </div>
          </div>

          {/* Body */}
          <div className="match-card-body">
            <p className="match-card-eyebrow">It's a match!</p>
            <h2 className="match-card-headline">
              I just matched with {project.teacherName}'s classroom in {project.city}, {project.state} 🍎
            </h2>
            <p className="match-card-sub">{project.title}</p>

            <div className="match-card-actions">
              {hasShare && (
                <button className="match-card-btn match-card-btn--primary" onClick={handleShare}>
                  Share 📤
                </button>
              )}
              <button
                className={`match-card-btn ${hasShare ? 'match-card-btn--secondary' : 'match-card-btn--primary'}`}
                onClick={handleCopy}
              >
                {copied ? 'Copied ✓' : 'Copy link 🔗'}
              </button>
            </div>

            <button className="match-card-dismiss" onClick={onDismiss}>
              Keep swiping →
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
