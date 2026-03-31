import { useState } from 'react'
import type { School } from '../types'

export interface FundraiserConfig {
  title: string
  goal: number
  organizerName: string
  story: string
  heroImageURL: string
  school: School
}

interface CreateFundraiserFormProps {
  school: School
  onSubmit: (config: FundraiserConfig) => void
  onBack: () => void
}

export default function CreateFundraiserForm({ school, onSubmit, onBack }: CreateFundraiserFormProps) {
  const totalNeed = school.projects.reduce((sum, p) => sum + p.costToComplete, 0)
  const images = school.projects
    .map((p) => p.retinaImageURL || p.imageURL)
    .filter(Boolean)
    .slice(0, 8)

  const [title, setTitle] = useState(`Help ${school.name}`)
  const [goal, setGoal] = useState(totalNeed > 0 ? totalNeed : 5000)
  const [organizerName, setOrganizerName] = useState('')
  const [story, setStory] = useState(
    `${school.name} in ${school.city}, ${school.state} needs your help! ${
      school.povertyLevel
        ? `${school.povertyLevel} of students qualify for free or reduced-price lunch. `
        : ''
    }Every donation supports teachers and students with the resources they need to succeed.`
  )
  const [heroImageURL, setHeroImageURL] = useState(images[0] || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      goal,
      organizerName: organizerName || 'A Supporter',
      story,
      heroImageURL,
      school,
    })
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <button type="button" className="create-form__back" onClick={onBack}>
        ← Back to schools
      </button>
      <h1 className="create-form__title">Create Your Fundraiser</h1>
      <p className="create-form__subtitle">
        Personalize your page for {school.name}
      </p>

      <div className="create-form__field">
        <label className="create-form__label">Fundraiser Title</label>
        <input
          className="create-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="create-form__field">
        <label className="create-form__label">Goal Amount</label>
        <div className="create-form__goal-input">
          <input
            className="create-form__input"
            type="number"
            min={1}
            value={goal}
            onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div className="create-form__field">
        <label className="create-form__label">Your Name</label>
        <input
          className="create-form__input"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          placeholder="A Supporter"
        />
      </div>

      <div className="create-form__field">
        <label className="create-form__label">Your Story</label>
        <textarea
          className="create-form__textarea"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={5}
        />
      </div>

      {images.length > 0 && (
        <div className="create-form__field">
          <label className="create-form__label">Cover Photo</label>
          <div className="create-form__image-picker">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                className={`create-form__image-option${heroImageURL === url ? ' create-form__image-option--selected' : ''}`}
                onClick={() => setHeroImageURL(url)}
              >
                <img src={url} alt={`Option ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="submit" className="create-form__submit">
        Launch Fundraiser
      </button>
    </form>
  )
}
