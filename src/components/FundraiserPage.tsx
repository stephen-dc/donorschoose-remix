import { useState } from 'react'
import type { School } from '../types'
import type { MockDonation, MockUpdate } from '../utils/fundraiseMocks'
import FundraiserHero from './FundraiserHero'
import FundraiserProgressBar from './FundraiserProgressBar'
import DonorWall from './DonorWall'
import SchoolStats from './SchoolStats'
import ActivityFeed from './ActivityFeed'
import DonateDrawer from './DonateDrawer'

export interface FundraiserEdits {
  title?: string
  goal?: number
  story?: string
}

interface FundraiserPageProps {
  title: string
  goal: number
  organizerName: string
  story: string
  heroImageURL: string
  school: School
  donations: MockDonation[]
  updates: MockUpdate[]
  amountRaised: number
  donateDrawerOpen: boolean
  suggestedAmount: number | null
  onOpenDonate: (amount?: number) => void
  onCloseDonate: () => void
  onDonate: (amount: number, name: string, message: string) => void
  onUpdate: (edits: FundraiserEdits) => void
  onPostUpdate: (text: string) => void
}

export default function FundraiserPage({
  title,
  goal,
  organizerName,
  story,
  heroImageURL,
  school,
  donations,
  updates,
  amountRaised,
  donateDrawerOpen,
  suggestedAmount,
  onOpenDonate,
  onCloseDonate,
  onDonate,
  onUpdate,
  onPostUpdate,
}: FundraiserPageProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editGoal, setEditGoal] = useState(String(goal))
  const [editStory, setEditStory] = useState(story)

  const handleStartEdit = () => {
    setEditTitle(title)
    setEditGoal(String(goal))
    setEditStory(story)
    setEditing(true)
  }

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      goal: parseInt(editGoal) || goal,
      story: editStory,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  const pageUrl = window.location.href
  const shareText = `Help support ${school.name}! ${title}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: pageUrl })
      } catch {
        // User cancelled share — that's fine
      }
    } else {
      // Fallback: copy link
      handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <>
      <div className="fundraiser-page">
        <FundraiserHero
          title={title}
          organizerName={organizerName}
          heroImageURL={heroImageURL}
          schoolName={school.name}
          schoolLocation={`${school.city}, ${school.state}`}
        />

        {editing && (
          <div className="fundraiser-edit-bar">
            <span className="fundraiser-edit-bar__label">Editing your page</span>
            <div className="fundraiser-edit-bar__actions">
              <button className="fundraiser-edit-bar__cancel" onClick={handleCancel}>Cancel</button>
              <button className="fundraiser-edit-bar__save" onClick={handleSave}>Save changes</button>
            </div>
          </div>
        )}

        {editing ? (
          <div className="fundraiser-edit-section">
            <label className="fundraiser-edit-section__label">Title</label>
            <input
              className="fundraiser-edit-section__input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <label className="fundraiser-edit-section__label">Goal amount ($)</label>
            <input
              className="fundraiser-edit-section__input"
              type="number"
              min={1}
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
            />
          </div>
        ) : (
          <div className="fundraiser-edit-toggle">
            <button className="fundraiser-edit-toggle__btn" onClick={handleStartEdit}>
              Edit page
            </button>
          </div>
        )}

        <FundraiserProgressBar
          raised={amountRaised}
          goal={editing ? (parseInt(editGoal) || goal) : goal}
          donorCount={donations.length}
          onMilestoneClick={(amount) => onOpenDonate(amount)}
        />

        <DonorWall donations={donations} />

        <div className="fundraiser-share">
          <button className="fundraiser-share__btn" onClick={handleShare}>Share</button>
          <button className="fundraiser-share__btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        <div className="fundraiser-divider" />

        <SchoolStats school={school} />

        <div className="fundraiser-story">
          <h2 className="fundraiser-story__heading">Story</h2>
          {editing ? (
            <textarea
              className="fundraiser-edit-section__textarea"
              value={editStory}
              onChange={(e) => setEditStory(e.target.value)}
              rows={5}
            />
          ) : (
            <p className="fundraiser-story__text">{story}</p>
          )}
        </div>

        <div className="fundraiser-divider" />

        <ActivityFeed donations={donations} updates={updates} onPostUpdate={onPostUpdate} />
      </div>

      <div className="fundraiser-donate-bar">
        <button className="fundraiser-donate-bar__btn" onClick={() => onOpenDonate()}>
          Donate now
        </button>
      </div>

      <DonateDrawer
        open={donateDrawerOpen}
        schoolName={school.name}
        suggestedAmount={suggestedAmount}
        onClose={onCloseDonate}
        onDonate={onDonate}
      />
    </>
  )
}
