import type { Project } from '../types'
import SmellsCard from './SmellsCard'

interface Props {
  projects: Project[]
  cart: Project[]
  cartUrl: string
  onToggleCart: (project: Project) => void
  onOpenCart: () => void
  onBack: () => void
}

export default function SmellsGallery({
  projects,
  cart,
  cartUrl,
  onToggleCart,
  onOpenCart,
  onBack,
}: Props) {
  return (
    <div className="smells-app">
      <header className="smells-header">
        <button className="smells-back-btn" onClick={onBack}>← Back</button>
        <div className="smells-header-title">
          <span>🌸</span> DC Smells Nice
        </div>
        <button
          className={`smells-cart-btn${cart.length > 0 ? ' has-items' : ''}`}
          onClick={onOpenCart}
          disabled={cart.length === 0}
        >
          🧺 {cart.length > 0 ? cart.length : ''}
        </button>
      </header>

      <div className="smells-scent-key">
        <span>🌸 Floral</span>
        <span>🍪 Sweet & Savory</span>
        <span>🌿 Earthy</span>
        <span>🧪 Crisp</span>
        <span>✨ Fresh & Clean</span>
      </div>

      <main className="smells-grid">
        {projects.map(project => (
          <SmellsCard
            key={project.id}
            project={project}
            isInCart={cart.some(p => p.id === project.id)}
            onToggleCart={() => onToggleCart(project)}
          />
        ))}
      </main>

      {cart.length > 0 && (
        <div className="smells-checkout-bar">
          <span>{cart.length} project{cart.length > 1 ? 's' : ''} in basket</span>
          <a
            href={cartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="smells-checkout-btn"
          >
            Donate on DonorsChoose →
          </a>
        </div>
      )}
    </div>
  )
}
