import { useState } from 'react'
import { STATES, BUDGET_AMOUNTS } from '../constants'

const AMOUNTS = BUDGET_AMOUNTS

interface Props {
  onStart: (params: { city: string; state: string; budget: number }) => Promise<void>
  loading: boolean
  error: string | null
  onHome: () => void
}

export default function BudgetScreen({ onStart, loading, error, onHome }: Props) {
  const [budget, setBudget] = useState(10)
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state) return
    onStart({ city, state, budget })
  }

  return (
    <div className="search-screen search-screen--picks">
      <button className="search-home-btn" onClick={onHome}>🏠 Home</button>
      <div className="logo">🏆</div>
      <h1>DC Picks</h1>
      <p className="tagline">Budget your giving, dollar by dollar</p>

      <form className="search-form" onSubmit={handleSubmit}>
        {/* Budget presets */}
        <div className="budget-presets-wrap">
          <label>Your budget</label>
          <div className="budget-presets">
            {AMOUNTS.map(a => (
              <button
                key={a}
                type="button"
                className={`budget-preset-btn${budget === a ? ' selected' : ''}`}
                onClick={() => setBudget(a)}
              >
                ${a}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="picks-city">City (optional)</label>
          <input
            id="picks-city"
            type="text"
            placeholder="e.g. Chicago"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="picks-state">State *</label>
          <select
            id="picks-state"
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
          {loading ? <span className="spinner" /> : `Start Picking — ${budget} rounds ✨`}
        </button>
      </form>
    </div>
  )
}
