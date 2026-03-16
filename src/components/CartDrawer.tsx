import { motion } from 'framer-motion'
import type { Project } from '../types'

interface Props {
  cart: Project[]
  amounts: Record<string, number>
  onAmountChange: (id: string, amount: number) => void
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ cart, amounts, onAmountChange, onClose, onCheckout }: Props) {
  const total = cart.reduce((sum, p) => sum + (amounts[p.id] ?? p.costToComplete), 0)

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
            {cart.map(project => (
              <div key={project.id} className="cart-item">
                {project.thumbImageURL || project.imageURL ? (
                  <img
                    src={project.thumbImageURL || project.imageURL}
                    alt={project.title}
                    className="cart-item-img"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="cart-item-img">🏫</div>
                )}
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
            <span>Total to fully fund all</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
          <button
            className="checkout-btn"
            onClick={onCheckout}
            disabled={cart.length === 0}
          >
            Donate to {cart.length} Project{cart.length !== 1 ? 's' : ''} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
