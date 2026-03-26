import { useState } from 'react'
import type { MockDonation } from '../utils/fundraiseMocks'
import { getAvatarColor } from '../utils/fundraiseMocks'

interface DonationsFeedProps {
  donations: MockDonation[]
}

export default function DonationsFeed({ donations }: DonationsFeedProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? donations : donations.slice(0, 5)

  return (
    <div className="donations-feed">
      <h2 className="donations-feed__heading">
        Recent Donations ({donations.length})
      </h2>
      <div className="donations-feed__list">
        {visible.map((d) => {
          const initial = d.name.charAt(0).toUpperCase()
          const color = getAvatarColor(d.name)
          return (
            <div key={d.id} className="donation-item">
              <div className="donation-item__avatar" style={{ background: color }}>
                {initial}
              </div>
              <div className="donation-item__content">
                <div className="donation-item__header">
                  <span className="donation-item__name">{d.name}</span>
                  <span className="donation-item__amount">${d.amount}</span>
                </div>
                {d.message && (
                  <div className="donation-item__message">{d.message}</div>
                )}
                <div className="donation-item__time">{d.timeAgo}</div>
              </div>
            </div>
          )
        })}
      </div>
      {donations.length > 5 && (
        <button
          className="donations-feed__toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `See all ${donations.length} donations`}
        </button>
      )}
    </div>
  )
}
