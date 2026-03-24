import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Project } from '../types'
import FeedCard from './FeedCard'
import EssayDrawer from './EssayDrawer'

interface FeedScreenProps {
  projects: Project[]
  cart: Project[]
  cartCount: number
  cartUrl: string
  onToggleCart: (project: Project) => void
  onDonationSelect?: (projectId: string, amount: number) => void
  onOpenCart: () => void
  onBack: () => void
}

export default function FeedScreen({
  projects,
  cart,
  cartCount,
  cartUrl,
  onToggleCart,
  onDonationSelect,
  onOpenCart,
  onBack,
}: FeedScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [essayProject, setEssayProject] = useState<Project | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // IntersectionObserver — mark the card that's ≥60% visible as active
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActiveIndex(idx)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    cardRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [projects])

  const setCardRef = useCallback((el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el
  }, [])

  const cartIds = new Set(cart.map(p => p.id))

  return (
    <div className="feed-screen">
      {/* Sticky top nav — pointer-events: none so it doesn't block scroll */}
      <nav className="feed-topnav">
        <button className="feed-back-btn" onClick={onBack}>← Back</button>
        <span className="feed-progress">
          {activeIndex + 1} / {projects.length}
          {activeIndex === projects.length - 1 && ' · End'}
        </span>
        <button className="cart-btn feed-topnav-cart" onClick={onOpenCart} aria-label="Open cart">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </nav>

      {/* Scroll-snap container */}
      <div className="feed-scroll-container" ref={scrollContainerRef}>
        {projects.map((project, i) => (
          <FeedCard
            key={project.id}
            ref={el => setCardRef(el, i)}
            project={project}
            isActive={activeIndex === i}
            isInCart={cartIds.has(project.id)}
            onToggleCart={() => onToggleCart(project)}
            onReadEssay={() => setEssayProject(project)}
            onDonationSelect={onDonationSelect}
          />
        ))}

        {/* End-of-list card */}
        <div className="feed-end-card">
          <div className="feed-end-inner">
            <div className="feed-end-emoji">🎉</div>
            <h2 className="feed-end-title">You've seen them all!</h2>
            <p className="feed-end-subtitle">
              {cartCount > 0
                ? `You've picked ${cartCount} project${cartCount !== 1 ? 's' : ''}. Ready to donate?`
                : 'Go back and heart the projects you want to support.'}
            </p>
            {cartCount > 0 && (
              <a className="feed-end-donate-btn" href={cartUrl}>
                Donate to {cartCount} Project{cartCount !== 1 ? 's' : ''} →
              </a>
            )}
            <button className="feed-end-back-btn" onClick={onBack}>
              ← Search another area
            </button>
          </div>
        </div>
      </div>
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
