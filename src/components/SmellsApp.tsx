import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchProjects, type SearchParams } from '../api'
import type { Project } from '../types'
import SearchScreen from './SearchScreen'
import SmellsGallery from './SmellsGallery'
import CartDrawer from './CartDrawer'
import { buildCartUrl } from '../utils/cartUrl'
import '../styles/app.css'
import '../styles/smells.css'

const SMELL_REGEX =
  /garden|flower|plant|herb|bloom|botanical|greenhouse|cook|bak|kitchen|culinary|food|recipe|chef|nature|outdoor|environment|ecology|earth|soil|compost|organic|farm|forest|wood|scent|fragrance|aroma|smell|olfact|lavender|rose|mint|vanilla|cinnamon|spice|candle|soap|hygiene/i

export function getScentProfile(project: Project): { emoji: string; label: string } {
  const text =
    `${project.title} ${project.shortDescription} ${project.subject} ${project.essay ?? ''}`.toLowerCase()
  if (/garden|flower|plant|herb|bloom|botanical|greenhouse|rose|lavender|orchid|succulent/.test(text))
    return { emoji: '🌸', label: 'Floral' }
  if (/cook|bak|kitchen|culinary|food|recipe|chef|spice|bread|pastry|vanilla|cinnamon/.test(text))
    return { emoji: '🍪', label: 'Sweet & Savory' }
  if (/nature|outdoor|environment|ecology|earth|soil|compost|organic|farm|forest|wood/.test(text))
    return { emoji: '🌿', label: 'Earthy' }
  if (/science|chemistry|biology|lab|experiment|smell|scent|fragrance|aroma|olfact/.test(text))
    return { emoji: '🧪', label: 'Crisp' }
  return { emoji: '✨', label: 'Fresh & Clean' }
}

type Screen = 'search' | 'gallery'

export default function SmellsApp() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('search')
  const [projects, setProjects] = useState<Project[]>([])
  const [cart, setCart] = useState<Project[]>([])
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [budget] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const results = await fetchProjects(params)
      const smelly = results.filter(p => {
        const text = `${p.title} ${p.shortDescription} ${p.subject} ${p.essay ?? ''}`
        return SMELL_REGEX.test(text)
      })
      if (smelly.length === 0) {
        setError('👃 Nothing smells nice in that area. Try a different city or state.')
        return
      }
      setProjects(smelly)
      setCart([])
      setAmounts({})
      setScreen('gallery')
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
          emoji="🌸"
          title="DC Smells Nice"
          tagline="Only the finest-smelling classrooms"
          accentClass="search-screen--smells"
          onHome={() => navigate('/')}
        />
      )}

      {screen === 'gallery' && (
        <SmellsGallery
          projects={projects}
          cart={cart}
          cartUrl={buildCartUrl(
            cart.map(p => ({ proposalId: p.id, amount: amounts[p.id] ?? p.costToComplete }))
          )}
          onToggleCart={handleToggleCart}
          onOpenCart={() => setCartOpen(true)}
          onBack={handleBack}
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
