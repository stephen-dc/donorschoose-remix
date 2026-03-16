import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import VersusScreen from './VersusScreen'
import CartDrawer from './CartDrawer'
import { buildCartUrl } from '../utils/cartUrl'
import '../styles/app.css'
import '../styles/versus.css'

type Screen = 'search' | 'versus'

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function VersusApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('search')
  const [left, setLeft] = useState<Project | null>(null)
  const [right, setRight] = useState<Project | null>(null)
  const [pool, setPool] = useState<Project[]>([])
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [budget, setBudget] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const results = await fetchProjects(params)
      if (results.length < 2) {
        setError('Not enough projects found. Try a different city or state.')
        return
      }
      const s = shuffled(results)
      setLeft(s[0])
      setRight(s[1])
      setPool(s.slice(2))
      setCart([])
      setAmounts({})
      setBudget(params.budget ?? null)
      setScreen('versus')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePick = useCallback((side: 'left' | 'right') => {
    const winner = side === 'left' ? left : right
    if (!winner) return

    const [next, ...restPool] = pool

    setCart(c => c.find(p => p.id === winner.id) ? c : [...c, winner])
    setAmounts(a => ({ ...a, [winner.id]: a[winner.id] ?? winner.costToComplete }))

    if (side === 'left') {
      setRight(next ?? null)
    } else {
      setLeft(next ?? null)
    }
    setPool(restPool)
  }, [left, right, pool])

  const handleBack = useCallback(() => {
    setScreen('search')
    setCartOpen(false)
  }, [])

  useEffect(() => {
    if (budget !== null && cart.length > 0) {
      const share = Math.floor(budget / cart.length)
      setAmounts(Object.fromEntries(cart.map(p => [p.id, share])))
    }
  }, [cart, budget])

  return (
    <>
      {screen === 'search' && (
        <SearchScreen
          onSearch={handleSearch}
          loading={loading}
          error={error}
          title="DC Versus"
          tagline="Pick your favorite, one match at a time"
          emoji="⚡"
          accentClass="search-screen--versus"
          onHome={() => navigate('/')}
          showBudget
        />
      )}

      {screen === 'versus' && (
        <VersusScreen
          left={left}
          right={right}
          cartCount={cart.length}
          cartUrl={buildCartUrl(
            cart.map(p => ({ proposalId: p.id, amount: amounts[p.id] ?? p.costToComplete }))
          )}
          onPick={handlePick}
          onOpenCart={() => setCartOpen(true)}
          onBack={handleBack}
          onHome={() => navigate('/')}
        />
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
