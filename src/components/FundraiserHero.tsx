import { getAvatarColor } from '../utils/fundraiseMocks'

interface FundraiserHeroProps {
  title: string
  organizerName: string
  heroImageURL: string
  schoolName: string
  schoolLocation: string
}

export default function FundraiserHero({
  title,
  organizerName,
  heroImageURL,
  schoolName,
  schoolLocation,
}: FundraiserHeroProps) {
  const initial = organizerName.charAt(0).toUpperCase()
  const avatarColor = getAvatarColor(organizerName)
  const hasImage = !!heroImageURL

  if (!hasImage) {
    return (
      <div className="fundraiser-hero fundraiser-hero--no-image">
        <div className="fundraiser-hero__pattern">
          <div className="fundraiser-hero__pattern-icon">🏫</div>
          <div className="fundraiser-hero__pattern-content">
            <h1 className="fundraiser-hero__title">{title}</h1>
            <div className="fundraiser-hero__organizer">
              <div className="fundraiser-hero__avatar" style={{ background: avatarColor }}>
                {initial}
              </div>
              <span>
                {organizerName} is fundraising for {schoolName} · {schoolLocation}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fundraiser-hero">
      <img className="fundraiser-hero__image" src={heroImageURL} alt={schoolName} />
      <div className="fundraiser-hero__overlay">
        <h1 className="fundraiser-hero__title">{title}</h1>
        <div className="fundraiser-hero__organizer">
          <div className="fundraiser-hero__avatar" style={{ background: avatarColor }}>
            {initial}
          </div>
          <span>
            {organizerName} is fundraising for {schoolName} · {schoolLocation}
          </span>
        </div>
      </div>
    </div>
  )
}
