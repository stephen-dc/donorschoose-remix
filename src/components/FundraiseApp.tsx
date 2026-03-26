import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, fetchSchool } from '../api'
import type { School } from '../types'
import SchoolPicker from './SchoolPicker'
import CreateFundraiserForm from './CreateFundraiserForm'
import type { FundraiserConfig } from './CreateFundraiserForm'
import FundraiserPage from './FundraiserPage'
import type { FundraiserEdits } from './FundraiserPage'
import {
  generateMockDonations,
  generateMockUpdates,
  type MockDonation,
  type MockUpdate,
} from '../utils/fundraiseMocks'
import '../styles/fundraise.css'

type Screen = 'landing' | 'pick-school' | 'create' | 'page'

export default function FundraiseApp() {
  const navigate = useNavigate()

  const [screen, setScreen] = useState<Screen>('landing')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // School search
  const [searchQuery, setSearchQuery] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

  // Fundraiser state
  const [fundraiser, setFundraiser] = useState<FundraiserConfig | null>(null)
  const [donations, setDonations] = useState<MockDonation[]>([])
  const [donateDrawerOpen, setDonateDrawerOpen] = useState(false)
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null)
  const [updates, setUpdates] = useState<MockUpdate[]>([])

  const amountRaised = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  )

  const handleSchoolSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    try {
      // Use the project API to discover schools in the area
      // Parse query: try to extract city/state or just use as keyword
      const parts = searchQuery.split(',').map((s) => s.trim())
      const state = parts.length > 1 ? parts[parts.length - 1] : ''
      const city = parts[0] || ''

      // Try fetching projects from multiple states if no state specified
      const statesToTry = state
        ? [state]
        : ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'NC', 'NV']

      const allSchoolIds = new Set<string>()
      const fetched: School[] = []

      for (const st of statesToTry.slice(0, 3)) {
        try {
          const projects = await fetchProjects({ state: st, city: city || undefined })
          for (const p of projects) {
            if (p.schoolId && !allSchoolIds.has(p.schoolId)) {
              allSchoolIds.add(p.schoolId)
              try {
                const school = await fetchSchool(p.schoolId)
                fetched.push(school)
              } catch {
                // skip
              }
            }
          }
          if (fetched.length >= 8) break
        } catch {
          // skip state
        }
      }

      // Fallback: build schools from project data if no school IDs
      if (fetched.length === 0) {
        for (const st of statesToTry.slice(0, 2)) {
          try {
            const projects = await fetchProjects({ state: st, city: city || undefined })
            const seen = new Set<string>()
            for (const p of projects) {
              if (!seen.has(p.schoolName)) {
                seen.add(p.schoolName)
                fetched.push({
                  id: p.schoolId || p.schoolName,
                  name: p.schoolName,
                  city: p.city,
                  zip: '',
                  state: p.state,
                  povertyLevel: '',
                  gradeType: { id: '', name: '' },
                  totalProposals: 0,
                  latitude: '',
                  longitude: '',
                  projects: [p],
                })
              }
            }
            if (fetched.length > 0) break
          } catch {
            // skip
          }
        }
      }

      if (fetched.length === 0) {
        setError('No schools found. Try a city and state like "Reno, NV".')
      } else {
        setSchools(fetched)
        setScreen('pick-school')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school)
    setScreen('create')
  }

  const handleCreateFundraiser = (config: FundraiserConfig) => {
    setFundraiser(config)
    setDonations(generateMockDonations(12))
    setUpdates(generateMockUpdates(config.school.name))
    setScreen('page')
  }

  const handlePostUpdate = (text: string) => {
    const newUpdate: MockUpdate = {
      id: `update-${Date.now()}`,
      text,
      date: 'just now',
      sortTime: Date.now(),
    }
    setUpdates((prev) => [newUpdate, ...prev])
  }

  const handleUpdate = (edits: FundraiserEdits) => {
    if (!fundraiser) return
    setFundraiser({
      ...fundraiser,
      ...(edits.title !== undefined && { title: edits.title }),
      ...(edits.goal !== undefined && { goal: edits.goal }),
      ...(edits.story !== undefined && { story: edits.story }),
    })
  }

  const handleDonate = (amount: number, name: string, message: string) => {
    const newDonation: MockDonation = {
      id: `donation-live-${Date.now()}`,
      name,
      amount,
      message,
      timeAgo: 'just now',
      sortTime: Date.now(),
    }
    setDonations((prev) => [newDonation, ...prev])
  }

  return (
    <div className="fundraise-app">
      {screen === 'landing' && (
        <div className="fundraise-landing">
          <button className="fundraise-landing__home" onClick={() => navigate('/')}>
            ← Home
          </button>

          <div className="fundraise-landing__content">
            <h1 className="fundraise-landing__title">
              Start a fundraiser<br />for a school you love
            </h1>
            <p className="fundraise-landing__subtitle">
              Rally your community around a school. Set a goal, share your story,
              and watch the support pour in.
            </p>

            <form className="fundraise-landing__search" onSubmit={handleSchoolSearch}>
              <div className="fundraise-landing__input-wrap">
                <span className="fundraise-landing__input-icon">🔍</span>
                <input
                  className="fundraise-landing__input"
                  type="text"
                  placeholder='Search by city and state, e.g. "Reno, NV"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                className="fundraise-landing__btn"
                type="submit"
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? 'Searching...' : 'Find Schools'}
              </button>
              {error && <p className="fundraise-landing__error">{error}</p>}
            </form>

            <div className="fundraise-landing__how">
              <h2 className="fundraise-landing__how-title">How it works</h2>
              <div className="fundraise-landing__steps">
                <div className="fundraise-landing__step">
                  <div className="fundraise-landing__step-num">1</div>
                  <div>
                    <strong>Pick a school</strong>
                    <p>Search for a school in your community</p>
                  </div>
                </div>
                <div className="fundraise-landing__step">
                  <div className="fundraise-landing__step-num">2</div>
                  <div>
                    <strong>Create your page</strong>
                    <p>Add your story, set a goal, choose a cover photo</p>
                  </div>
                </div>
                <div className="fundraise-landing__step">
                  <div className="fundraise-landing__step-num">3</div>
                  <div>
                    <strong>Share &amp; fundraise</strong>
                    <p>Send your page to friends, family, and neighbors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'pick-school' && (
        <SchoolPicker
          schools={schools}
          loading={false}
          onSelect={handleSelectSchool}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'create' && selectedSchool && (
        <CreateFundraiserForm
          school={selectedSchool}
          onSubmit={handleCreateFundraiser}
          onBack={() => setScreen('pick-school')}
        />
      )}

      {screen === 'page' && fundraiser && (
        <FundraiserPage
          title={fundraiser.title}
          goal={fundraiser.goal}
          organizerName={fundraiser.organizerName}
          story={fundraiser.story}
          heroImageURL={fundraiser.heroImageURL}
          school={fundraiser.school}
          donations={donations}
          updates={updates}
          amountRaised={amountRaised}
          donateDrawerOpen={donateDrawerOpen}
          suggestedAmount={suggestedAmount}
          onOpenDonate={(amount?: number) => {
            setSuggestedAmount(amount ?? null)
            setDonateDrawerOpen(true)
          }}
          onCloseDonate={() => {
            setDonateDrawerOpen(false)
            setSuggestedAmount(null)
          }}
          onDonate={handleDonate}
          onUpdate={handleUpdate}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </div>
  )
}
