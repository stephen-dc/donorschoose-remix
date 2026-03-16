import { useState, useEffect, useRef, useCallback } from 'react'
import type { Project } from '../types'
import FeedCard from './FeedCard'

interface FeedScreenProps {
  projects: Project[]
  cart: Project[]
  cartCount: number
  locationLabel: string
  onToggleCart: (project: Project) => void
  onOpenCart: () => void
  onBack: () => void
  onHome: () => void
  onCheckout: () => void
}

export default function FeedScreen({
  projects,
  cart,
  cartCount,
  onToggleCart,
  onOpenCart,
  onBack,
  onHome,
  onCheckout,
}: FeedScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0)
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
        </span>
        {cartCount > 0 ? (
          <button className="feed-checkout-btn" onClick={onCheckout}>
            Checkout ({cartCount})
          </button>
        ) : (
          <button className="feed-back-btn" onClick={onHome}>🏠 Home</button>
        )}
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
            cartCount={cartCount}
            onOpenCart={onOpenCart}
          />
        ))}
      </div>
    </div>
  )
}
