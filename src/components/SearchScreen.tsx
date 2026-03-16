import { useState } from 'react'
import type { SearchParams } from '../api'

const STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'Washington D.C.'],
]

interface Props {
  onSearch: (params: SearchParams) => Promise<void>
  loading: boolean
  error: string | null
  title?: string
  tagline?: string
  emoji?: string
  accentClass?: string
  onHome?: () => void
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
}: Props) {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state) return
    onSearch({ city, state })
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
