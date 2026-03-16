import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import CartDrawer from './CartDrawer'
import CheckoutScreen from './CheckoutScreen'
import RouletteWheel from './RouletteWheel'
import RouletteResultCard from './RouletteResultCard'
import '../styles/app.css'
import '../styles/roulette.css'

type RouletteScreen = 'search' | 'wheel' | 'result' | 'checkout'

export default function RouletteApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<RouletteScreen>('search')
  const [wheelProjects, setWheelProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
      setWheelProjects(results.slice(0, 12))
      setBudget(params.budget ?? null)
      setLocationLabel(params.city ? `${params.city}, ${params.state}` : params.state)
      setScreen('wheel')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSpinComplete = useCallback((index: number) => {
    setSelectedProject(wheelProjects[index])
    setScreen('result')
  }, [wheelProjects])

  const handleFund = useCallback(() => {
    if (selectedProject) {
      setCart(c => c.find(p => p.id === selectedProject.id) ? c : [...c, selectedProject])
      setAmounts(a => ({ ...a, [selectedProject.id]: a[selectedProject.id] ?? selectedProject.costToComplete }))
    }
    setScreen('wheel')
  }, [selectedProject])

  const handleSpinAgain = useCallback(() => {
    setScreen('wheel')
  }, [])

  const handleCheckout = useCallback(() => {
    setCartOpen(false)
    setScreen('checkout')
  }, [])

  const handleReset = useCallback(() => {
    setScreen('search')
    setWheelProjects([])
    setSelectedProject(null)
    setCart([])
    setAmounts({})
    setBudget(null)
    setCartOpen(false)
    setLocationLabel('')
  }, [])

  const handleBackToSearch = useCallback(() => {
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
          title="DC Roulette"
          tagline="Let fate fund a classroom"
          emoji="🎰"
          accentClass="search-screen--roulette"
          onHome={() => navigate('/')}
          showBudget
        />
      )}

      {screen === 'wheel' && (
        <RouletteWheel
          projects={wheelProjects}
          locationLabel={locationLabel}
          cartCount={cart.length}
          onSpinComplete={handleSpinComplete}
          onBack={handleBackToSearch}
          onOpenCart={() => setCartOpen(true)}
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'result' && selectedProject && (
        <RouletteResultCard
          project={selectedProject}
          cartCount={cart.length}
          onFund={handleFund}
          onSpinAgain={handleSpinAgain}
          onBack={() => setScreen('wheel')}
          onOpenCart={() => setCartOpen(true)}
          onHome={() => navigate('/')}
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
