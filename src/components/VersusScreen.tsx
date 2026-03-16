import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '../types'
import EssayDrawer from './EssayDrawer'

interface Props {
  left: Project | null
  right: Project | null
  cartCount: number
  cartUrl: string
  onPick: (side: 'left' | 'right') => void
  onOpenCart: () => void
  onBack: () => void
  onHome: () => void
}

export default function VersusScreen({
  left,
  right,
  cartCount,
  cartUrl,
  onPick,
  onOpenCart,
  onBack,
}: Props) {
  const [essayProject, setEssayProject] = useState<Project | null>(null)
  const [pickingSide, setPickingSide] = useState<'left' | 'right' | null>(null)
  const isDone = !left || !right

  function handlePick(side: 'left' | 'right') {
    if (pickingSide !== null) return
    setPickingSide(side)
    setTimeout(() => {
      setPickingSide(null)
      onPick(side)
    }, 280)
  }

  return (
    <div className="versus-screen">
      <nav className="versus-topnav">
        <button className="versus-back-btn" onClick={onBack}>← Back</button>
        <div className="versus-topnav-title">⚡ VS</div>
        <button className="cart-btn versus-cart-btn" onClick={onOpenCart} aria-label="Open cart">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </nav>

      {isDone ? (
        <div className="versus-done">
          <div className="versus-done-emoji">🎉</div>
          <h2>You've seen them all!</h2>
          <p>
            {cartCount > 0
              ? `You picked ${cartCount} project${cartCount !== 1 ? 's' : ''}. Ready to donate?`
              : 'Go back and try another area.'}
          </p>
          {cartCount > 0 && (
            <a className="versus-done-donate" href={cartUrl}>
              Donate to {cartCount} Project{cartCount !== 1 ? 's' : ''} →
            </a>
          )}
          <button className="versus-done-back" onClick={onBack}>← Search another area</button>
        </div>
      ) : (
        <div className="versus-arena">
          <div className="versus-divider">
            <div className="versus-vs-badge">VS</div>
          </div>

          <div className="versus-slot versus-slot--left">
            <AnimatePresence mode="wait">
              {left && (
                <motion.div
                  key={left.id}
                  className="versus-card-wrapper"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <VersusCard
                    project={left}
                    isWinner={pickingSide === 'left'}
                    onPick={() => handlePick('left')}
                    onEssay={() => setEssayProject(left)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="versus-slot versus-slot--right">
            <AnimatePresence mode="wait">
              {right && (
                <motion.div
                  key={right.id}
                  className="versus-card-wrapper"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <VersusCard
                    project={right}
                    isWinner={pickingSide === 'right'}
                    onPick={() => handlePick('right')}
                    onEssay={() => setEssayProject(right)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {essayProject && (
          <EssayDrawer
            project={essayProject}
            onClose={() => setEssayProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function VersusCard({
  project,
  isWinner,
  onPick,
  onEssay,
}: {
  project: Project
  isWinner: boolean
  onPick: () => void
  onEssay: () => void
}) {
  return (
    <motion.div
      className="versus-card"
      animate={isWinner ? { scale: [1, 1.04, 1] } : {}}
      transition={{ duration: 0.28 }}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onPick()}
      aria-label={`Pick: ${project.title}`}
    >
      {project.imageURL ? (
        <div
          className="versus-card-bg"
          style={{ backgroundImage: `url(${project.retinaImageURL || project.imageURL})` }}
        />
      ) : (
        <div className="versus-card-bg versus-card-bg--fallback">🏫</div>
      )}

      {isWinner && <div className="versus-winner-flash" />}

      <div className="versus-card-gradient" />

      <div className="versus-card-info">
        {project.subject && (
          <span className="versus-card-subject">{project.subject}</span>
        )}
        <p className="versus-card-title">{project.title}</p>
        <p className="versus-card-location">📍 {project.city}, {project.state}</p>
      </div>

      <button
        className={`versus-pick-btn${isWinner ? ' versus-pick-btn--winner' : ''}`}
        onClick={e => { e.stopPropagation(); onPick() }}
      >
        {isWinner ? '❤️ Picked!' : '❤️ Pick this'}
      </button>

      {(project.essay || project.shortDescription) && (
        <button
          className="versus-essay-btn"
          onClick={e => { e.stopPropagation(); onEssay() }}
          aria-label="Read essay"
        >
          📖
        </button>
      )}
    </motion.div>
  )
}
