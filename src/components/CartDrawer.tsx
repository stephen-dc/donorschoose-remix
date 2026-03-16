import { motion } from 'framer-motion'
import type { Project } from '../types'
import { buildCartUrl } from '../utils/cartUrl'
import ProjectImage from './ProjectImage'

interface Props {
  cart: Project[]
  amounts: Record<string, number>
  budget?: number | null
  onAmountChange: (id: string, amount: number) => void
  onRemove?: (id: string) => void
  onClose: () => void
}

export default function CartDrawer({ cart, amounts, budget, onAmountChange, onRemove, onClose }: Props) {
  const total = cart.reduce((sum, p) => sum + (amounts[p.id] ?? p.costToComplete), 0)
  const cartUrl = buildCartUrl(
    cart.map(p => ({ proposalId: p.id, amount: amounts[p.id] ?? p.costToComplete }))
  )

  return (
    <motion.div
      className="cart-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="cart-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        <div className="cart-header">
          <h2>My Picks 🛒 <span style={{ fontWeight: 400, opacity: 0.5, fontSize: '0.9rem' }}>({cart.length})</span></h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💔</div>
              <p>Swipe right on projects to add them here!</p>
            </div>
          </div>
        ) : (
          <div className="cart-items">
            {budget != null && cart.length > 0 && (
              <div className="cart-budget-context">
                ${budget} budget · ${Math.floor(budget / cart.length)} each
              </div>
            )}
            {cart.map(project => (
              <div key={project.id} className="cart-item">
                {onRemove && (
                  <button
                    className="cart-item-remove"
                    onClick={() => onRemove(project.id)}
                    aria-label={`Remove ${project.title}`}
                  >✕</button>
                )}
                <ProjectImage
                  src={project.thumbImageURL || project.imageURL}
                  alt={project.title}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <div className="cart-item-title">{project.title}</div>
                  <div className="cart-item-school">{project.schoolName}</div>
                  <div className="cart-item-amount">
                    <span className="cart-item-amount-prefix">$</span>
                    <input
                      type="number"
                      className="cart-item-amount-input"
                      min={1}
                      max={project.costToComplete}
                      value={amounts[project.id] ?? project.costToComplete}
                      onChange={e => onAmountChange(project.id, Math.max(1, Number(e.target.value)))}
                    />
                    <span className="cart-item-amount-max">of ${project.costToComplete.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div className="cart-total">
            <span>{budget != null ? 'Total donation' : 'Total to fully fund all'}</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
          <a
            className="checkout-btn"
            href={cart.length > 0 ? cartUrl : undefined}
            style={{ pointerEvents: cart.length === 0 ? 'none' : 'auto', opacity: cart.length === 0 ? 0.5 : 1 }}
          >
            Donate to {cart.length} Project{cart.length !== 1 ? 's' : ''} →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
