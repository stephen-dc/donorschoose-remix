import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjects } from '../api'
import type { Project } from '../types'
import '../styles/hawaii.css'

const DC_BASE = 'https://www.donorschoose.org'
const UTM = 'utm_source=partner&utm_campaign=hawaii-landing'

function toSchoolSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildSchoolUrl(schoolId: string, schoolName: string): string {
  return `${DC_BASE}/school/${toSchoolSlug(schoolName)}/${schoolId}/?teachers=true&${UTM}`
}

interface SchoolEntry {
  schoolId: string
  schoolName: string
  city: string
  projectCount: number
}

function buildSchoolList(projects: Project[]): SchoolEntry[] {
  const map = new Map<string, SchoolEntry>()
  for (const p of projects) {
    if (!p.schoolId) continue
    const existing = map.get(p.schoolId)
    if (existing) {
      existing.projectCount++
    } else {
      map.set(p.schoolId, {
        schoolId: p.schoolId,
        schoolName: p.schoolName,
        city: p.city,
        projectCount: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => b.projectCount - a.projectCount)
}

export default function HawaiiApp() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<SchoolEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchProjects({ state: 'HI' })
      .then(projects => {
        setSchools(buildSchoolList(projects))
      })
      .catch(() => {
        setError('Failed to load Hawaii schools. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schools
    return schools.filter(
      s =>
        s.schoolName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    )
  }, [schools, query])

  return (
    <div className="hawaii-app">
      <header className="hawaii-header">
        <button className="hawaii-back" onClick={() => navigate('/')}>
          ← Home
        </button>
        <div className="hawaii-header__inner">
          <div className="hawaii-logo">🌺</div>
          <h1 className="hawaii-title">Hawaii Schools</h1>
          <p className="hawaii-tagline">
            Browse DonorsChoose classrooms across Hawaii and support a school
          </p>
        </div>
      </header>

      <main className="hawaii-main">
        {loading && (
          <div className="hawaii-loading">
            <div className="hawaii-spinner" />
            <span>Loading Hawaii schools...</span>
          </div>
        )}

        {error && (
          <div className="hawaii-error">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="hawaii-search-wrap">
              <input
                className="hawaii-search"
                type="text"
                placeholder="Search by school or city..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <p className="hawaii-count">
              {filtered.length} school{filtered.length !== 1 ? 's' : ''} with active projects
            </p>

            <div className="hawaii-list">
              {filtered.map(school => (
                <a
                  key={school.schoolId}
                  className="hawaii-school-card"
                  href={buildSchoolUrl(school.schoolId, school.schoolName)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="hawaii-school-card__body">
                    <div className="hawaii-school-card__name">{school.schoolName}</div>
                    <div className="hawaii-school-card__location">
                      {school.city}, HI
                    </div>
                  </div>
                  <div className="hawaii-school-card__right">
                    <span className="hawaii-school-card__badge">
                      {school.projectCount} project{school.projectCount !== 1 ? 's' : ''}
                    </span>
                    <span className="hawaii-school-card__arrow">→</span>
                  </div>
                </a>
              ))}

              {filtered.length === 0 && (
                <p className="hawaii-empty">No schools match your search.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
