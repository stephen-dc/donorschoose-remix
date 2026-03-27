import type { MockDonation } from '../utils/fundraiseMocks'
import { getAvatarColor } from '../utils/fundraiseMocks'

interface DonorWallProps {
  donations: MockDonation[]
  max?: number
}

export default function DonorWall({ donations, max = 6 }: DonorWallProps) {
  const recent = donations.slice(0, max)
  if (recent.length === 0) return null

  return (
    <div className="donor-wall">
      <div className="donor-wall__label">Recent supporters</div>
      <div className="donor-wall__chips">
        {recent.map((d) => {
          const initial = d.name.charAt(0).toUpperCase()
          return (
            <div key={d.id} className="donor-wall__chip">
              <div className="donor-wall__avatar" style={{ background: getAvatarColor(d.name) }}>
                {initial}
              </div>
              <span className="donor-wall__name">{d.name}</span>
              <span className="donor-wall__amount">${d.amount}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
