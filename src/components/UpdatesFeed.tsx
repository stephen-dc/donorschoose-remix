import { useState } from 'react'
import type { MockUpdate } from '../utils/fundraiseMocks'

interface UpdatesFeedProps {
  updates: MockUpdate[]
  onPostUpdate?: (text: string) => void
}

export default function UpdatesFeed({ updates, onPostUpdate }: UpdatesFeedProps) {
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft] = useState('')

  const handlePost = () => {
    const text = draft.trim()
    if (!text || !onPostUpdate) return
    onPostUpdate(text)
    setDraft('')
    setDrafting(false)
  }

  return (
    <div className="updates-feed">
      <div className="updates-feed__header">
        <h2 className="updates-feed__heading">Updates</h2>
        {onPostUpdate && !drafting && (
          <button className="updates-feed__add-btn" onClick={() => setDrafting(true)}>
            + Post update
          </button>
        )}
      </div>

      {drafting && (
        <div className="updates-feed__compose">
          <textarea
            className="updates-feed__compose-input"
            placeholder="Share a progress update with your supporters..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="updates-feed__compose-actions">
            <button className="updates-feed__compose-cancel" onClick={() => { setDrafting(false); setDraft('') }}>
              Cancel
            </button>
            <button
              className="updates-feed__compose-post"
              onClick={handlePost}
              disabled={!draft.trim()}
            >
              Post
            </button>
          </div>
        </div>
      )}

      <div className="updates-feed__list">
        {updates.map((u) => (
          <div key={u.id} className="update-item">
            <p className="update-item__text">{u.text}</p>
            <span className="update-item__date">{u.date}</span>
          </div>
        ))}
        {updates.length === 0 && !drafting && (
          <p className="updates-feed__empty">No updates yet. Post one to keep your supporters in the loop!</p>
        )}
      </div>
    </div>
  )
}
