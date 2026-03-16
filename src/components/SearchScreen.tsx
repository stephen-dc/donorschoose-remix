import { useState } from 'react'
import type { SearchParams } from '../api'
import { STATES, BUDGET_AMOUNTS } from '../constants'

interface Props {
  onSearch: (params: SearchParams) => Promise<void>
  loading: boolean
  error: string | null
  title?: string
  tagline?: string
  emoji?: string
  accentClass?: string
  onHome?: () => void
  showBudget?: boolean
}

export default function SearchScreen({
  onSearch,
  loading,
  error,
  title = 'DC Tinder',
  tagline = 'Swipe right to fund a classroom near you',
  emoji = '🍎',
  accentClass,
  onHome,
  showBudget = false,
}: Props) {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [budget, setBudget] = useState(10)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state) return
    onSearch({ city, state, ...(showBudget ? { budget } : {}) })
  }

  return (
    <div className={`search-screen${accentClass ? ` ${accentClass}` : ''}`}>
      {onHome && (
        <button className="search-home-btn" onClick={onHome} aria-label="Home">
          🏠 Home
        </button>
      )}
      <div className="logo">{emoji}</div>
      <h1>{title}</h1>
      <p className="tagline">{tagline}</p>

      <form className="search-form" onSubmit={handleSubmit}>
        {showBudget && (
          <div>
            <label>Budget</label>
            <div className="budget-presets">
              {BUDGET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={`budget-preset-btn${budget === amt ? ' selected' : ''}`}
                  onClick={() => setBudget(amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="city">City (optional)</label>
          <input
            id="city"
            type="text"
            placeholder="e.g. Brooklyn"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={state}
            onChange={e => setState(e.target.value)}
            required
          >
            <option value="">Select a state…</option>
            {STATES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {error && <div className="search-error">⚠️ {error}</div>}

        <button
          type="submit"
          className="search-btn"
          disabled={!state || loading}
        >
          {loading ? <span className="spinner" /> : 'Find Projects ✨'}
        </button>
      </form>
    </div>
  )
}
