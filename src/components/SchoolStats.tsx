import type { School } from '../types'

interface SchoolStatsProps {
  school: School
}

export default function SchoolStats({ school }: SchoolStatsProps) {
  return (
    <div className="school-stats">
      <div className="school-stats__name">{school.name}</div>
      <div className="school-stats__location">
        {school.city}, {school.state}
        {school.gradeType?.name ? ` · ${school.gradeType.name}` : ''}
      </div>
      <div className="school-stats__grid">
        {school.povertyLevel && (
          <div className="school-stats__item">
            <strong>{school.povertyLevel}</strong>
            free/reduced lunch
          </div>
        )}
        <div className="school-stats__item">
          <strong>{school.projects.length}</strong>
          active project{school.projects.length !== 1 ? 's' : ''}
        </div>
        {school.totalProposals > 0 && (
          <div className="school-stats__item">
            <strong>{school.totalProposals}</strong>
            projects funded
          </div>
        )}
        {school.zip && (
          <div className="school-stats__item">
            <strong>{school.zip}</strong>
            zip code
          </div>
        )}
      </div>
    </div>
  )
}
