import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '../types'
import ProjectImage from './ProjectImage'
import EssayDrawer from './EssayDrawer'

interface Props {
  project: Project
  marked: boolean
  onMark: (amount: number) => void
  onClose: () => void
}

const PRESETS = [10, 25, 50]

export default function BingoProjectDrawer({ project, marked, onMark, onClose }: Props) {
  const [amount, setAmount] = useState(project.costToComplete)
  const [customInput, setCustomInput] = useState('')
  const [essayOpen, setEssayOpen] = useState(false)

  const isComplete = amount === project.costToComplete
  const isCustom = !PRESETS.includes(amount) && !isComplete

  function selectPreset(val: number) {
    setAmount(val)
    setCustomInput('')
  }

  function handleCustomChange(val: string) {
    setCustomInput(val)
    const n = parseInt(val, 10)
    if (!isNaN(n) && n > 0) setAmount(n)
  }

  return (
    <motion.div
      className="bingo-drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bingo-drawer"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        <div style={{ position: 'relative' }}>
          <div className="bingo-drawer-handle" />
          <button className="bingo-drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <ProjectImage
          src={project.imageURL || project.retinaImageURL}
          alt={project.title}
          className="bingo-drawer-img"
          fallbackClassName="bingo-drawer-img-fallback"
        />

        <div className="bingo-drawer-body">
          <span className="bingo-drawer-subject">{project.subject}</span>
          <h2 className="bingo-drawer-title">{project.title}</h2>
          <p className="bingo-drawer-meta">
            {project.teacherName} · {project.schoolName} · {project.city}, {project.state}
          </p>
          {project.shortDescription && (
            <p className="bingo-drawer-description">{project.shortDescription}</p>
          )}
          <p className="bingo-drawer-cost">
            Needs <strong>${project.costToComplete.toLocaleString()}</strong> to complete
            {project.percentFunded > 0 && ` · ${Math.round(project.percentFunded)}% funded`}
          </p>

          {!marked && (
            <div className="bingo-amount-picker">
              <p className="bingo-amount-label">Donation amount</p>
              <div className="bingo-amount-presets">
                {PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`bingo-amount-btn${amount === p && !isComplete ? ' bingo-amount-btn--selected' : ''}`}
                    onClick={() => selectPreset(p)}
                  >
                    ${p}
                  </button>
                ))}
                <button
                  type="button"
                  className={`bingo-amount-btn${isComplete ? ' bingo-amount-btn--selected' : ''}`}
                  onClick={() => selectPreset(project.costToComplete)}
                >
                  Complete<br />
                  <span className="bingo-amount-btn-sub">${project.costToComplete.toLocaleString()}</span>
                </button>
              </div>
              <div className="bingo-amount-custom">
                <span className="bingo-amount-custom-prefix">$</span>
                <input
                  type="number"
                  className={`bingo-amount-custom-input${isCustom ? ' bingo-amount-custom-input--active' : ''}`}
                  placeholder="Custom amount"
                  min={1}
                  max={project.costToComplete}
                  value={customInput}
                  onChange={e => handleCustomChange(e.target.value)}
                  onFocus={() => setCustomInput(isCustom ? String(amount) : '')}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bingo-drawer-actions">
          <button
            className={`bingo-mark-btn${marked ? ' bingo-mark-btn--remove' : ''}`}
            onClick={() => onMark(amount)}
          >
            {marked
              ? '✓ Remove from Cart'
              : `Add $${amount.toLocaleString()} to Cart ✓`}
          </button>
          <button className="bingo-dc-link" onClick={() => setEssayOpen(true)}>
            Read full essay →
          </button>
          <a
            className="bingo-dc-link"
            href={project.proposalURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on DonorsChoose →
          </a>
        </div>
      </motion.div>

      <AnimatePresence>
        {essayOpen && (
          <EssayDrawer project={project} onClose={() => setEssayOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
