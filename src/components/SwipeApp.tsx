import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import SwipeScreen from './SwipeScreen'
import CartDrawer from './CartDrawer'
import MatchToast from './MatchToast'
import '../styles/app.css'

type Screen = 'search' | 'swipe'

export default function SwipeApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('search')
  const [projects, setProjects] = useState<Project[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [budget, setBudget] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [lastMatch, setLastMatch] = useState<Project | null>(null)
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
      setCurrentIndex(0)
      setCart([])
      setAmounts({})
      setBudget(params.budget ?? null)
      setLocationLabel(params.city ? `${params.city}, ${params.state ?? ''}` : (params.state ?? ''))
      setScreen('swipe')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex(i => i + 1)
  }, [])

  const handleSwipeRight = useCallback(() => {
    const project = projects[currentIndex]
    if (project) {
      setCart(c => c.find(p => p.id === project.id) ? c : [...c, project])
      setAmounts(a => ({ ...a, [project.id]: a[project.id] ?? project.costToComplete }))
      setLastMatch(project)
    }
    setCurrentIndex(i => i + 1)
  }, [currentIndex, projects])

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
          title="DC Swipe"
          showBudget
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'swipe' && (
        <SwipeScreen
          projects={projects}
          currentIndex={currentIndex}
          cartCount={cart.length}
          locationLabel={locationLabel}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
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

      <AnimatePresence>
        {lastMatch && (
          <MatchToast
            key={lastMatch.id}
            project={lastMatch}
            onDismiss={() => setLastMatch(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
