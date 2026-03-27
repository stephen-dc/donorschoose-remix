import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects } from '../api'
import type { Project } from '../types'
import CartDrawer from './CartDrawer'
import DartsMap from './DartsMap'
import ProjectImage from './ProjectImage'
import '../styles/app.css'
import '../styles/darts.css'

type Screen = 'budget' | 'map' | 'result'

export default function DartsApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('budget')
  const [budgetInput, setBudgetInput] = useState('')
  const [budget, setBudget] = useState<number | null>(null)
  const [dartStateName, setDartStateName] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    if (budget !== null && cart.length > 0) {
      const share = Math.floor(budget / cart.length)
      setAmounts(Object.fromEntries(cart.map(p => [p.id, share])))
    }
  }, [cart, budget])

  function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseInt(budgetInput, 10)
    setBudget(!isNaN(parsed) && parsed > 0 ? parsed : null)
    setScreen('map')
  }

  const handleStateClick = useCallback(async (abbr: string, name: string) => {
    setLoading(true)
    setError(null)
    setDartStateName(name)
    try {
      const projects = await fetchProjects({ state: abbr })
      if (projects.length === 0) {
        setError(`No open projects found in ${name} right now. Try another state!`)
        setLoading(false)
        return
      }
      const picked = projects[Math.floor(Math.random() * projects.length)]
      setProject(picked)
      setScreen('result')
    } catch (e) {
      console.error('DC Darts fetch error:', e)
      setError(e instanceof Error ? e.message : 'Something went wrong. Try clicking again.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleAddToCart() {
    if (!project) return
    setCart(c => c.find(p => p.id === project.id) ? c : [...c, project])
    setAmounts(a => ({ ...a, [project.id]: a[project.id] ?? project.costToComplete }))
    setProject(null)
    setScreen('map')
  }

  function handleThrowAgain() {
    setProject(null)
    setError(null)
    setScreen('map')
  }

  const inCart = project ? cart.some(p => p.id === project.id) : false

  return (
    <>
      {/* ── Budget screen ── */}
      {screen === 'budget' && (
        <div className="darts-budget-screen">
          <button className="darts-home-btn" onClick={() => navigate('/')}>← Home</button>
          <div className="darts-budget-inner">
            <div className="darts-hero-emoji">🏹</div>
            <h1 className="darts-title">DC Darts</h1>
            <p className="darts-subtitle">Throw a dart at the map and fund the classroom it hits.</p>
            <form className="darts-budget-form" onSubmit={handleBudgetSubmit}>
              <label className="darts-budget-label" htmlFor="darts-budget">
                Budget <span className="darts-optional">(optional)</span>
              </label>
              <div className="darts-budget-field">
                <span className="darts-budget-prefix">$</span>
                <input
                  id="darts-budget"
                  className="darts-budget-input"
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                />
              </div>
              <button className="darts-throw-btn" type="submit">
                Throw a Dart! →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Map screen ── */}
      {screen === 'map' && (
        <div className="darts-map-screen">
          <div className="darts-map-topbar">
            <button className="darts-home-btn" onClick={() => navigate('/')}>← Home</button>
            <p className="darts-map-hint">Click a state to throw your dart</p>
            <button
              className="darts-cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              🛒{cart.length > 0 && <span className="darts-cart-badge">{cart.length}</span>}
            </button>
          </div>

          {error && (
            <div className="darts-error-banner">
              {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <DartsMap loading={loading} onStateClick={handleStateClick} />
        </div>
      )}

      {/* ── Result screen ── */}
      {screen === 'result' && project && (
        <div className="darts-result-screen">
          <div className="darts-result-topbar">
            <button className="darts-home-btn" onClick={handleThrowAgain}>← Map</button>
            <button
              className="darts-cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              🛒{cart.length > 0 && <span className="darts-cart-badge">{cart.length}</span>}
            </button>
          </div>

          <div className="darts-result-inner">
            <p className="darts-landed">🎯 Your dart landed in <strong>{dartStateName}</strong>!</p>

            <div className="darts-result-card">
              <ProjectImage
                src={project.imageURL}
                alt={project.title}
                className="darts-result-img"
                fallbackClassName="darts-result-img darts-result-img--fallback"
              />
              <div className="darts-result-info">
                <h2 className="darts-result-title">{project.title}</h2>
                <p className="darts-result-school">{project.schoolName} · {project.city}, {project.state}</p>
                <p className="darts-result-desc">{project.shortDescription}</p>
                <p className="darts-result-cost">${project.costToComplete.toLocaleString()} needed to fully fund</p>
              </div>
            </div>

            <div className="darts-result-actions">
              <button
                className="darts-add-btn"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? 'Already in cart ✓' : 'Add to Cart'}
              </button>
              <button className="darts-again-btn" onClick={handleThrowAgain}>
                Throw Again
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            amounts={amounts}
            budget={budget}
            onAmountChange={(id, val) => setAmounts(a => ({ ...a, [id]: val }))}
            onRemove={id => setCart(c => c.filter(p => p.id !== id))}
            onClose={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
