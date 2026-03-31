import type { School } from '../types'
import { AVATAR_COLORS } from '../utils/fundraiseMocks'

interface SchoolPickerProps {
  schools: School[]
  loading: boolean
  onSelect: (school: School) => void
  onBack: () => void
}

function getSchoolIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('elementary')) return '🏫'
  if (lower.includes('middle')) return '📚'
  if (lower.includes('high')) return '🎓'
  if (lower.includes('academy') || lower.includes('prep')) return '✨'
  return '🏫'
}

function getCardAccent(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export default function SchoolPicker({ schools, loading, onSelect, onBack }: SchoolPickerProps) {
  if (loading) {
    return (
      <div className="school-picker">
        <div className="fundraise-loading">
          <div className="fundraise-loading__spinner" />
          <span>Finding schools near you...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="school-picker">
      <button className="school-picker__back" onClick={onBack}>
        ← New search
      </button>
      <div className="school-picker__header">
        <h1 className="school-picker__title">
          {schools.length} school{schools.length !== 1 ? 's' : ''} found
        </h1>
        <p className="school-picker__subtitle">
          Pick the one you want to fundraise for
        </p>
      </div>
      <div className="school-picker__grid">
        {schools.map((school, i) => (
          <button
            key={school.id}
            className="school-card"
            onClick={() => onSelect(school)}
          >
            <div className="school-card__accent" style={{ background: getCardAccent(i) }} />
            <div className="school-card__body">
              <div className="school-card__top">
                <div className="school-card__icon">{getSchoolIcon(school.name)}</div>
                <div>
                  <div className="school-card__name">{school.name}</div>
                  <div className="school-card__location">
                    {school.city}, {school.state}
                    {school.gradeType?.name ? ` · ${school.gradeType.name}` : ''}
                  </div>
                </div>
              </div>
              <div className="school-card__tags">
                {school.povertyLevel && (
                  <span className="school-card__tag school-card__tag--need">
                    {school.povertyLevel.length > 30
                      ? 'High need'
                      : school.povertyLevel}
                  </span>
                )}
                {school.totalProposals > 0 && (
                  <span className="school-card__tag school-card__tag--funded">
                    {school.totalProposals} funded
                  </span>
                )}
                {school.projects.length > 0 && (
                  <span className="school-card__tag school-card__tag--active">
                    {school.projects.length} active
                  </span>
                )}
              </div>
            </div>
            <div className="school-card__arrow">→</div>
          </button>
        ))}
        {schools.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--dc-gray)', padding: '2rem 0' }}>
            No schools found. Try a different location.
          </p>
        )}
      </div>
    </div>
  )
}
