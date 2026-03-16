import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Project } from '../types'
import SwipeCard from './SwipeCard'
import EssayDrawer from './EssayDrawer'

interface Props {
  projects: Project[]
  currentIndex: number
  cartCount: number
  locationLabel: string
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onOpenCart: () => void
  onBack: () => void
  onHome?: () => void
}

export default function SwipeScreen({
  projects,
  currentIndex,
  cartCount,
  locationLabel,
  onSwipeLeft,
  onSwipeRight,
  onOpenCart,
  onBack,
  onHome,
}: Props) {
  const [essayProject, setEssayProject] = useState<Project | null>(null)

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') onSwipeLeft()
    else onSwipeRight()
  }, [onSwipeLeft, onSwipeRight])

  // Keyboard support
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (currentIndex >= projects.length) return
      if (e.key === 'ArrowLeft') onSwipeLeft()
      if (e.key === 'ArrowRight') onSwipeRight()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, projects.length, onSwipeLeft, onSwipeRight])

  const remaining = projects.length - currentIndex

  // The visible cards: show up to 3 from currentIndex
  const visibleProjects = projects.slice(currentIndex, currentIndex + 3)
  const topProject = visibleProjects[0] ?? null

  return (
    <div className="swipe-screen">
      <header className="swipe-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>
          {remaining > 0
            ? `${remaining} project${remaining !== 1 ? 's' : ''} near ${locationLabel}`
            : 'No more projects'}
        </h2>
        <div className="swipe-header-right">
          {onHome && (
            <button className="home-btn" onClick={onHome} aria-label="Home">
              🏠
            </button>
          )}
          <button className="cart-btn" onClick={onOpenCart} aria-label="Open cart">
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="card-area">
        {remaining === 0 ? (
          <div className="empty-state">
            <div className="emoji">🎉</div>
            <h2>You've seen them all!</h2>
            <p>
              {cartCount > 0
                ? `You saved ${cartCount} project${cartCount !== 1 ? 's' : ''}. Ready to donate?`
                : 'Try a different location to find more projects.'}
            </p>
            {cartCount > 0 ? (
              <button onClick={onOpenCart}>View My Cart ({cartCount})</button>
            ) : (
              <button onClick={onBack}>Search Again</button>
            )}
          </div>
        ) : (
          <div className="card-stack">
            {/* Render behind card first (lower DOM order = lower default z-index) */}
            {visibleProjects.length >= 2 && (
              <SwipeCard
                key={visibleProjects[1].id}
                project={visibleProjects[1]}
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            {/* Top card — same key as when it was the behind card, so React updates in-place */}
            {visibleProjects.length >= 1 && (
              <SwipeCard
                key={visibleProjects[0].id}
                project={visibleProjects[0]}
                onSwipe={handleSwipe}
                isTop={true}
              />
            )}
          </div>
        )}
      </div>

      {remaining > 0 && (
        <div className="action-buttons">
          <button
            className="action-btn skip"
            onClick={onSwipeLeft}
            aria-label="Skip"
          >
            ✕
          </button>
          <button
            className="action-btn info-action"
            onClick={() => setEssayProject(topProject)}
            aria-label="Read more"
            disabled={!topProject}
          >
            ℹ
          </button>
          <button
            className="action-btn like"
            onClick={onSwipeRight}
            aria-label="Add to cart"
          >
            ♥
          </button>
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
