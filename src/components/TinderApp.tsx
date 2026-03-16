import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import SwipeScreen from './SwipeScreen'
import CartDrawer from './CartDrawer'
import CheckoutScreen from './CheckoutScreen'
import '../styles/app.css'

type Screen = 'search' | 'swipe' | 'checkout'

export default function TinderApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('search')
  const [projects, setProjects] = useState<Project[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cart, setCart] = useState<Project[]>([])
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
      setCurrentIndex(0)
      setCart([])
      setLocationLabel(params.city ? `${params.city}, ${params.state}` : params.state)
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
    setProjects(prev => {
      const project = prev[currentIndex]
      if (project) {
        setCart(c => c.find(p => p.id === project.id) ? c : [...c, project])
      }
      return prev
    })
    setCurrentIndex(i => i + 1)
  }, [currentIndex])

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
    setCurrentIndex(0)
    setCart([])
    setCartOpen(false)
    setLocationLabel('')
  }, [])

  return (
    <>
      {screen === 'search' && (
        <SearchScreen
          onSearch={handleSearch}
          loading={loading}
          error={error}
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

      {screen === 'checkout' && (
        <CheckoutScreen
          cart={cart}
          onReset={handleReset}
        />
      )}

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onCheckout={handleCheckout}
          />
        )}
      </AnimatePresence>
    </>
  )
}
