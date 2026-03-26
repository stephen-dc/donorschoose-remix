import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IMPACT_TIERS = [
  { amount: 25, emoji: '✏️', label: 'Supplies for 1 student' },
  { amount: 50, emoji: '📚', label: 'Books for a classroom' },
  { amount: 100, emoji: '🎨', label: 'A week of art supplies' },
  { amount: 250, emoji: '💻', label: 'Technology for a class' },
]

interface DonateDrawerProps {
  open: boolean
  schoolName: string
  suggestedAmount?: number | null
  onClose: () => void
  onDonate: (amount: number, name: string, message: string) => void
}

export default function DonateDrawer({ open, schoolName, suggestedAmount, onClose, onDonate }: DonateDrawerProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [appliedSuggestion, setAppliedSuggestion] = useState<number | null>(null)

  // When a new suggested amount comes in (from milestone click), apply it
  if (suggestedAmount && suggestedAmount !== appliedSuggestion) {
    setAppliedSuggestion(suggestedAmount)
    const matchingTier = IMPACT_TIERS.find(t => t.amount === suggestedAmount)
    if (matchingTier) {
      setSelectedPreset(matchingTier.amount)
      setCustomAmount('')
    } else {
      setSelectedPreset(null)
      setCustomAmount(String(suggestedAmount))
    }
  }
  const [donorName, setDonorName] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const amount = selectedPreset ?? (parseInt(customAmount) || 0)

  const handlePreset = (value: number) => {
    setSelectedPreset(value)
    setCustomAmount('')
  }

  const handleCustom = (value: string) => {
    setCustomAmount(value)
    setSelectedPreset(null)
  }

  const handleSubmit = () => {
    if (amount <= 0) return
    onDonate(amount, donorName || 'Anonymous', message)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedPreset(50)
      setCustomAmount('')
      setDonorName('')
      setMessage('')
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="donate-drawer__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="donate-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="donate-drawer__handle" />

            {success ? (
              <div className="donate-drawer__success">
                <div className="donate-drawer__success-icon">🎉</div>
                <div className="donate-drawer__success-text">Thank you!</div>
                <div className="donate-drawer__success-sub">
                  Your ${amount} donation to {schoolName} has been recorded.
                </div>
              </div>
            ) : (
              <>
                <h2 className="donate-drawer__title">
                  Donate to {schoolName}
                </h2>

                <div className="donate-drawer__impacts">
                  {IMPACT_TIERS.map((tier) => (
                    <button
                      key={tier.amount}
                      className={`donate-drawer__impact${selectedPreset === tier.amount ? ' donate-drawer__impact--selected' : ''}`}
                      onClick={() => handlePreset(tier.amount)}
                    >
                      <span className="donate-drawer__impact-emoji">{tier.emoji}</span>
                      <span className="donate-drawer__impact-amount">${tier.amount}</span>
                      <span className="donate-drawer__impact-label">{tier.label}</span>
                    </button>
                  ))}
                </div>

                <div className="donate-drawer__custom">
                  <label className="donate-drawer__custom-label">Other amount</label>
                  <input
                    className="donate-drawer__custom-input"
                    type="number"
                    min={1}
                    placeholder="$0"
                    value={customAmount}
                    onChange={(e) => handleCustom(e.target.value)}
                  />
                </div>

                <input
                  className="donate-drawer__message-input"
                  placeholder="Your name (optional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />

                <input
                  className="donate-drawer__message-input"
                  placeholder="Leave a message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button
                  className="donate-drawer__submit"
                  onClick={handleSubmit}
                  disabled={amount <= 0}
                >
                  Donate ${amount > 0 ? amount.toLocaleString() : '...'}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
