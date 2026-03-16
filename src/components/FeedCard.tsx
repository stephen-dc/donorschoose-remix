import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '../types'

interface FeedCardProps {
  project: Project
  isActive: boolean
  isInCart: boolean
  onToggleCart: () => void
  cartCount: number
  onOpenCart: () => void
}

interface HeartParticle {
  id: number
  x: number
  scale: number
  duration: number
}

const FeedCard = React.forwardRef<HTMLDivElement, FeedCardProps>(
  ({ project, isActive, isInCart, onToggleCart, cartCount, onOpenCart }, ref) => {
    const [hearts, setHearts] = useState<HeartParticle[]>([])
    const heartIdRef = useRef(0)

    // Track how many times this card has become active — used as key on bg div
    // to restart the Ken Burns animation each time the card scrolls into view
    const activationCountRef = useRef(0)
    const prevIsActiveRef = useRef(false)
    if (isActive && !prevIsActiveRef.current) {
      activationCountRef.current += 1
    }
    prevIsActiveRef.current = isActive

    const spawnHearts = useCallback(() => {
      const count = Math.floor(Math.random() * 3) + 5 // 5–7
      const newHearts: HeartParticle[] = Array.from({ length: count }, () => ({
        id: heartIdRef.current++,
        x: (Math.random() - 0.5) * 60,
        scale: 0.8 + Math.random() * 0.8,
        duration: 0.9 + Math.random() * 0.6,
      }))
      setHearts(prev => [...prev, ...newHearts])
    }, [])

    const handleHeartClick = useCallback(() => {
      onToggleCart()
      if (!isInCart) spawnHearts()
    }, [onToggleCart, isInCart, spawnHearts])

    const removeHeart = useCallback((id: number) => {
      setHearts(prev => prev.filter(h => h.id !== id))
    }, [])

    const fundedPct = Math.min(100, Math.round(project.percentFunded))

    return (
      <div className="feed-card" ref={ref}>
        {/* Ken Burns background — key changes when card re-enters view, restarting animation */}
        <div
          key={activationCountRef.current}
          className={`feed-card-bg${isActive ? ' is-active' : ''}`}
          style={{
            backgroundImage: `url(${project.retinaImageURL || project.imageURL})`,
          }}
        />

        {/* Dark gradient overlay */}
        <div className="feed-card-gradient" />

        {/* Right sidebar */}
        <div className="feed-sidebar">
          {/* Heart / add-to-cart button */}
          <div className="feed-heart-wrap">
            <motion.button
              key={isInCart ? 'added' : 'removed'}
              className="feed-heart-btn"
              onClick={handleHeartClick}
              animate={{ scale: isInCart ? [1, 1.35, 0.9, 1] : [1, 0.85, 1] }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              aria-label={isInCart ? 'Remove from cart' : 'Add to cart'}
            >
              {isInCart ? '❤️' : '🤍'}
            </motion.button>
            <span className="feed-heart-label">{isInCart ? 'Added' : 'Add'}</span>

            {/* Floating hearts */}
            <div className="feed-floating-hearts">
              <AnimatePresence>
                {hearts.map(heart => (
                  <motion.span
                    key={heart.id}
                    className="feed-floating-heart"
                    style={{ fontSize: `${heart.scale * 1.4}rem` }}
                    initial={{ opacity: 1, y: 0, x: 0 }}
                    animate={{ opacity: 0, y: -120, x: heart.x }}
                    exit={{}}
                    transition={{ duration: heart.duration, ease: 'easeOut' }}
                    onAnimationComplete={() => removeHeart(heart.id)}
                  >
                    ❤️
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Cart button */}
          <button className="feed-cart-btn" onClick={onOpenCart} aria-label="Open cart">
            <span>🛒</span>
            <span className="feed-cart-label">Cart</span>
            {cartCount > 0 && (
              <span className="feed-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>

        {/* Bottom info overlay */}
        <div className="feed-card-info">
          <span className="feed-subject-badge">{project.subject}</span>
          <h2 className="feed-card-title">{project.title}</h2>
          <p className="feed-card-teacher">
            {project.teacherName} · {project.schoolName}
          </p>
          <p className="feed-card-desc">{project.shortDescription}</p>

          {/* Funding progress */}
          <div className="feed-progress-bar-wrap">
            <div className="feed-progress-bar-track">
              <div
                className="feed-progress-bar-fill"
                style={{ width: `${fundedPct}%` }}
              />
            </div>
            <span className="feed-progress-pct">{fundedPct}% funded</span>
          </div>
        </div>
      </div>
    )
  }
)

FeedCard.displayName = 'FeedCard'

export default FeedCard
