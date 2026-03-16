import type { Project } from '../types'
import { buildCartUrl } from '../utils/cartUrl'

interface Props {
  cart: Project[]
  onReset: () => void
}

export default function CheckoutScreen({ cart, onReset }: Props) {
  const total = cart.reduce((sum, p) => sum + p.costToComplete, 0)

  const cartUrl = buildCartUrl(
    cart.map(p => ({ proposalId: p.id, amount: p.costToComplete }))
  )

  return (
    <div className="checkout-screen">
      <div className="checkout-hero">
        <div className="emoji">💝</div>
        <h1>You're about to change lives!</h1>
        <p>Review your {cart.length} project{cart.length !== 1 ? 's' : ''} below</p>
      </div>

      <div className="checkout-items">
        {cart.map(project => (
          <div key={project.id} className="checkout-item">
            {project.imageURL ? (
              <img
                src={project.imageURL}
                alt={project.title}
                className="checkout-item-img"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="checkout-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#2a2a3e', borderRadius: 10 }}>🏫</div>
            )}
            <div className="checkout-item-info">
              <h3>{project.title}</h3>
              <p>{project.teacherName} · {project.schoolName}</p>
              <p>{project.city}, {project.state}</p>
            </div>
            <div className="checkout-item-cost">
              ${project.costToComplete.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary">
        <div className="checkout-total-row">
          <span>Total donation</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <a href={cartUrl} className="donate-btn">
          Donate ${total.toLocaleString()} 💝
        </a>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '0.875rem',
            marginTop: '0.75rem',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 50,
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          ← Back to browsing
        </button>
      </div>
    </div>
  )
}
