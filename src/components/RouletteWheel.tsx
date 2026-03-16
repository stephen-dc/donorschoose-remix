import { useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import type { Project } from '../types'

interface Props {
  projects: Project[]
  locationLabel: string
  cartCount: number
  onSpinComplete: (index: number) => void
  onBack: () => void
  onOpenCart: () => void
  onHome: () => void
}

const SEGMENT_COLORS = [
  '#fd267a', '#ff6036', '#7c3aed', '#2563eb',
  '#059669', '#d97706', '#db2777', '#0891b2',
  '#dc2626', '#65a30d', '#1d4ed8', '#9333ea',
]

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export default function RouletteWheel({
  projects,
  locationLabel,
  cartCount,
  onSpinComplete,
  onBack,
  onOpenCart,
  onHome,
}: Props) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)

  const wheelData = projects.map(p => ({
    option: truncate(p.title, 20),
  }))

  function handleSpin() {
    if (mustSpin) return
    const idx = Math.floor(Math.random() * projects.length)
    setPrizeNumber(idx)
    setMustSpin(true)
  }

  function handleStopSpinning() {
    setMustSpin(false)
    onSpinComplete(prizeNumber)
  }

  return (
    <div className="roulette-screen">
      <header className="roulette-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>DC Roulette</h2>
        <div className="swipe-header-right">
          <button className="home-btn" onClick={onHome} aria-label="Home">
            🏠
          </button>
          <button className="cart-btn" onClick={onOpenCart} aria-label="Open cart">
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="wheel-area">
        <div className="wheel-wrapper">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            backgroundColors={SEGMENT_COLORS}
            textColors={['#ffffff']}
            outerBorderColor="rgba(255,255,255,0.15)"
            outerBorderWidth={3}
            innerRadius={20}
            radiusLineColor="rgba(255,255,255,0.1)"
            radiusLineWidth={1}
            fontSize={13}
            spinDuration={0.8}
            disableInitialAnimation={true}
            onStopSpinning={handleStopSpinning}
          />
        </div>

        <button
          className="spin-btn"
          onClick={handleSpin}
          disabled={mustSpin}
        >
          {mustSpin ? 'Spinning…' : 'Spin! 🎰'}
        </button>

        <p className="wheel-caption">
          {projects.length} classroom{projects.length !== 1 ? 's' : ''} near {locationLabel}
        </p>
      </div>
    </div>
  )
}
