import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import FeedScreen from './FeedScreen'
import CartDrawer from './CartDrawer'
import CheckoutScreen from './CheckoutScreen'
import '../styles/app.css'
import '../styles/feed.css'

type Screen = 'search' | 'feed' | 'checkout'

export default function FeedApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('search')
  const [projects, setProjects] = useState<Project[]>([])
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [budget, setBudget] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const results = await fetchProjects(params)
      if (results.length === 0) {
        setError('No projects found for that location. Try a different city or state.')
        return
      }
      setProjects(results)
      setCart([])
      setAmounts({})
      setBudget(params.budget ?? null)
      setLocationLabel(params.city ? `${params.city}, ${params.state}` : params.state)
      setScreen('feed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleToggleCart = useCallback((project: Project) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === project.id)
      if (exists) return prev.filter(p => p.id !== project.id)
      setAmounts(a => ({ ...a, [project.id]: a[project.id] ?? project.costToComplete }))
      return [...prev, project]
    })
  }, [])

  const handleBack = useCallback(() => {
    setScreen('search')
    setCartOpen(false)
  }, [])

  const handleCheckout = useCallback(() => {
    setCartOpen(false)
    setScreen('checkout')
  }, [])

  const handleReset = useCallback(() => {
    setScreen('search')
    setProjects([])
    setCart([])
    setAmounts({})
    setBudget(null)
    setCartOpen(false)
    setLocationLabel('')
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
          showBudget
          emoji="📱"
          title="DC Feed"
          tagline="Scroll your way to impact"
          accentClass="search-screen--feed"
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'feed' && (
        <FeedScreen
          projects={projects}
          cart={cart}
          cartCount={cart.length}
          onToggleCart={handleToggleCart}
          onOpenCart={() => setCartOpen(true)}
          onBack={handleBack}
        />
      )}

      {screen === 'checkout' && (
        <CheckoutScreen
          cart={cart}
          amounts={amounts}
          onReset={handleReset}
        />
      )}

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            amounts={amounts}
            budget={budget}
            onAmountChange={(id, val) => setAmounts(a => ({ ...a, [id]: val }))}
            onClose={() => setCartOpen(false)}
            onCheckout={handleCheckout}
          />
        )}
      </AnimatePresence>
    </>
  )
}
