import { useState, useMemo } from 'react'
import type { MockDonation, MockUpdate } from '../utils/fundraiseMocks'
import { getAvatarColor } from '../utils/fundraiseMocks'

type ActivityItem =
  | { type: 'donation'; data: MockDonation; sortTime: number }
  | { type: 'update'; data: MockUpdate; sortTime: number }

interface ActivityFeedProps {
  donations: MockDonation[]
  updates: MockUpdate[]
  onPostUpdate?: (text: string) => void
}

export default function ActivityFeed({ donations, updates, onPostUpdate }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft] = useState('')

  const items = useMemo(() => {
    const all: ActivityItem[] = [
      ...donations.map((d) => ({ type: 'donation' as const, data: d, sortTime: d.sortTime })),
      ...updates.map((u) => ({ type: 'update' as const, data: u, sortTime: u.sortTime })),
    ]
    all.sort((a, b) => b.sortTime - a.sortTime)
    return all
  }, [donations, updates])

  const visible = expanded ? items : items.slice(0, 8)

  const handlePost = () => {
    const text = draft.trim()
    if (!text || !onPostUpdate) return
    onPostUpdate(text)
    setDraft('')
    setDrafting(false)
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <h2 className="activity-feed__heading">Activity</h2>
        {onPostUpdate && !drafting && (
          <button className="activity-feed__post-btn" onClick={() => setDrafting(true)}>
            + Post update
          </button>
        )}
      </div>

      {drafting && (
        <div className="activity-feed__compose">
          <textarea
            className="activity-feed__compose-input"
            placeholder="Share a progress update with your supporters..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="activity-feed__compose-actions">
            <button className="activity-feed__compose-cancel" onClick={() => { setDrafting(false); setDraft('') }}>
              Cancel
            </button>
            <button
              className="activity-feed__compose-post"
              onClick={handlePost}
              disabled={!draft.trim()}
            >
              Post
            </button>
          </div>
        </div>
      )}

      <div className="activity-feed__list">
        {visible.map((item) =>
          item.type === 'donation' ? (
            <DonationRow key={item.data.id} donation={item.data} />
          ) : (
            <UpdateRow key={item.data.id} update={item.data} />
          )
        )}
      </div>

      {items.length > 8 && (
        <button className="activity-feed__toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `See all ${items.length} activities`}
        </button>
      )}
    </div>
  )
}

function DonationRow({ donation: d }: { donation: MockDonation }) {
  const initial = d.name.charAt(0).toUpperCase()
  const color = getAvatarColor(d.name)

  return (
    <div className="activity-item activity-item--donation">
      <div className="activity-item__avatar" style={{ background: color }}>
        {initial}
      </div>
      <div className="activity-item__content">
        <div className="activity-item__top">
          <span className="activity-item__name">{d.name}</span>
          <span className="activity-item__amount">${d.amount}</span>
        </div>
        {d.message && <div className="activity-item__message">{d.message}</div>}
        <div className="activity-item__time">{d.timeAgo}</div>
      </div>
    </div>
  )
}

function UpdateRow({ update: u }: { update: MockUpdate }) {
  return (
    <div className="activity-item activity-item--update">
      <div className="activity-item__avatar activity-item__avatar--update">
        📣
      </div>
      <div className="activity-item__content">
        <div className="activity-item__update-label">Organizer update</div>
        <div className="activity-item__message">{u.text}</div>
        <div className="activity-item__time">{u.date}</div>
      </div>
    </div>
  )
}
