import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DonationProgressBar from './DonationProgressBar'
import { buildMilestones } from '../utils/milestones'
import {
  DEMO_MILESTONE_COUNT_MAX,
  milestoneCountFromProjectTotal,
} from '../utils/milestoneCountFromProject'
import {
  MATCH_MULTIPLIERS,
  PROGRESS_BAR_DEMO_DEFAULTS,
  parseProgressBarDemoSearchParams,
  buildProgressBarDemoSearchParams,
  progressBarDemoUrlEquals,
  getProgressBarDemoPermalink,
} from '../utils/progressBarDemoUrl'
import '../styles/progress-bar.css'

const PRESETS = {
  early: { totalPrice: 868, fundedAmount: 85, label: 'Early (10%)' },
  midway: { totalPrice: 868, fundedAmount: 325, label: 'Midway (37%)' },
  almost: { totalPrice: 868, fundedAmount: 780, label: 'Almost there (90%)' },
  full: { totalPrice: 868, fundedAmount: 868, label: 'Fully funded' },
}

export default function ProgressBarDemo() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [totalPrice, setTotalPrice] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).totalPrice
  )
  const [fundedAmount, setFundedAmount] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).fundedAmount
  )
  const [matchedEnabled, setMatchedEnabled] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).matchedEnabled
  )
  const [matchMultiplier, setMatchMultiplier] = useState<number>(
    () => parseProgressBarDemoSearchParams(searchParams).matchMultiplier
  )
  const [mobileMode, setMobileMode] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).mobileMode
  )
  const [mobileWidth, setMobileWidth] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).mobileWidth
  )
  /** First milestone position (% along bar); remaining spread evenly to 100% */
  const [milestoneFirstPct, setMilestoneFirstPct] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).milestoneFirstPct
  )
  const [milestoneCount, setMilestoneCount] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).milestoneCount
  )
  const [autoMilestoneCountByPrice, setAutoMilestoneCountByPrice] = useState(
    () => parseProgressBarDemoSearchParams(searchParams).autoMilestoneCountByPrice
  )

  const [permalinkCopied, setPermalinkCopied] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [debugOpen, setDebugOpen] = useState(false)

  /** Browser back/forward and external URL edits */
  useEffect(() => {
    const h = parseProgressBarDemoSearchParams(searchParams)
    setTotalPrice(h.totalPrice)
    setFundedAmount(h.fundedAmount)
    setMatchedEnabled(h.matchedEnabled)
    setMatchMultiplier(h.matchMultiplier)
    setMilestoneCount(h.milestoneCount)
    setMilestoneFirstPct(h.milestoneFirstPct)
    setAutoMilestoneCountByPrice(h.autoMilestoneCountByPrice)
    setMobileMode(h.mobileMode)
    setMobileWidth(h.mobileWidth)
  }, [searchParams])

  /** When enabled, milestone count follows total project $ (tiers); match is ignored. */
  useEffect(() => {
    if (!autoMilestoneCountByPrice) return
    setMilestoneCount(milestoneCountFromProjectTotal(totalPrice))
  }, [totalPrice, autoMilestoneCountByPrice])

  /** Keep the query string in sync with debugger state */
  useEffect(() => {
    const next = buildProgressBarDemoSearchParams({
      totalPrice,
      fundedAmount: Math.min(fundedAmount, totalPrice),
      matchedEnabled,
      matchMultiplier,
      milestoneCount,
      milestoneFirstPct,
      autoMilestoneCountByPrice,
      mobileMode,
      mobileWidth,
    })
    if (progressBarDemoUrlEquals(next, searchParams)) return
    setSearchParams(next, { replace: true })
  }, [
    totalPrice,
    fundedAmount,
    matchedEnabled,
    matchMultiplier,
    milestoneCount,
    milestoneFirstPct,
    autoMilestoneCountByPrice,
    mobileMode,
    mobileWidth,
    searchParams,
    setSearchParams,
  ])

  const permalink = useMemo(
    () =>
      getProgressBarDemoPermalink({
        totalPrice,
        fundedAmount: Math.min(fundedAmount, totalPrice),
        matchedEnabled,
        matchMultiplier,
        milestoneCount,
        milestoneFirstPct,
        autoMilestoneCountByPrice,
        mobileMode,
        mobileWidth,
      }),
    [
      totalPrice,
      fundedAmount,
      matchedEnabled,
      matchMultiplier,
      milestoneCount,
      milestoneFirstPct,
      autoMilestoneCountByPrice,
      mobileMode,
      mobileWidth,
    ]
  )

  const copyPermalink = useCallback(() => {
    void navigator.clipboard.writeText(permalink).then(() => {
      setPermalinkCopied(true)
      window.setTimeout(() => setPermalinkCopied(false), 2000)
    })
  }, [permalink])

  const resetDebugger = useCallback(() => {
    const d = PROGRESS_BAR_DEMO_DEFAULTS
    setTotalPrice(d.totalPrice)
    setFundedAmount(d.fundedAmount)
    setMatchedEnabled(d.matchedEnabled)
    setMatchMultiplier(d.matchMultiplier)
    setMilestoneCount(d.milestoneCount)
    setMilestoneFirstPct(d.milestoneFirstPct)
    setAutoMilestoneCountByPrice(d.autoMilestoneCountByPrice)
    setMobileMode(d.mobileMode)
    setMobileWidth(d.mobileWidth)
    setResetKey(k => k + 1)
  }, [])

  const safeFunded = Math.min(fundedAmount, totalPrice)

  const demoMilestones = useMemo(
    () => buildMilestones(totalPrice, milestoneFirstPct, milestoneCount),
    [totalPrice, milestoneFirstPct, milestoneCount]
  )

  return (
    <div className="pb-demo-page">
      <div className="pb-demo-layout">
        {/* Mobile toggle button */}
        <button
          type="button"
          className="pb-debug-mobile-toggle"
          onClick={() => setDebugOpen(o => !o)}
          aria-label={debugOpen ? 'Close debugger' : 'Open debugger'}
        >
          {debugOpen ? '✕' : '⚙'}
        </button>

        {/* Backdrop for mobile */}
        {debugOpen && (
          <div
            className="pb-debug-backdrop"
            onClick={() => setDebugOpen(false)}
          />
        )}

        {/* Debug Panel */}
        <div className={`pb-debug-panel ${debugOpen ? 'pb-debug-panel--open' : ''}`}>
          <div className="pb-debug-header">
            <div className="pb-debug-title">Debugger</div>
            <button
              type="button"
              className="pb-debug-preset-btn pb-debug-reset-btn"
              onClick={resetDebugger}
            >
              Reset
            </button>
          </div>

          <section className="pb-debug-section">
            <div className="pb-debug-label">
              Share permalink
              {permalinkCopied && (
                <span className="pb-debug-value" style={{ marginLeft: '0.5rem' }}>
                  Copied!
                </span>
              )}
            </div>
            <input
              type="text"
              readOnly
              className="pb-debug-permalink-input"
              value={permalink}
              aria-label="Permalink URL"
              onFocus={e => e.target.select()}
              onClick={e => e.currentTarget.select()}
            />
            <button type="button" className="pb-debug-preset-btn" onClick={copyPermalink}>
              Copy link
            </button>
          </section>

          <hr className="pb-debug-divider" />

          {/* Funded amount slider */}
          <section className="pb-debug-section">
            <div className="pb-debug-label">
              Funded amount
              <span className="pb-debug-value">${safeFunded.toLocaleString()} / ${totalPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              className="pb-debug-range"
              min={0}
              max={totalPrice}
              step={1}
              value={safeFunded}
              onChange={e => setFundedAmount(Number(e.target.value))}
            />
            <div className="pb-debug-range-labels">
              <span>$0</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </section>

          {/* Total price */}
          <section className="pb-debug-section">
            <div className="pb-debug-label">
              Total price
              <span className="pb-debug-value">${totalPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              className="pb-debug-range"
              min={100}
              max={5000}
              step={50}
              value={totalPrice}
              onChange={e => {
                const v = Number(e.target.value)
                setTotalPrice(v)
                if (fundedAmount > v) setFundedAmount(v)
              }}
            />
          </section>

          {/* Presets */}
          <section className="pb-debug-section">
            <div className="pb-debug-label">Presets</div>
            <div className="pb-debug-presets">
              {Object.entries(PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  className="pb-debug-preset-btn"
                  onClick={() => {
                    setTotalPrice(p.totalPrice)
                    setFundedAmount(p.fundedAmount)
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Milestone layout */}
          <section className="pb-debug-section">
            <label className="pb-debug-checkbox-row">
              <input
                type="checkbox"
                className="pb-debug-checkbox"
                checked={autoMilestoneCountByPrice}
                onChange={e => {
                  const on = e.target.checked
                  setAutoMilestoneCountByPrice(on)
                  if (on) {
                    setMilestoneCount(milestoneCountFromProjectTotal(totalPrice))
                  }
                }}
              />
              <span className="pb-debug-checkbox-copy">
                Auto milestone count from total project cost (ignores match). Under $900 → 5; $900–$1,500 → 6;
                above $1,500 → +1 per $600 (max {DEMO_MILESTONE_COUNT_MAX}). Drag the slider below to override.
              </span>
            </label>
            <div className="pb-debug-label" style={{ marginTop: '0.65rem' }}>
              Milestone count
              <span className="pb-debug-value">{milestoneCount}</span>
            </div>
            <input
              type="range"
              className="pb-debug-range"
              min={1}
              max={DEMO_MILESTONE_COUNT_MAX}
              step={1}
              value={milestoneCount}
              onChange={e => {
                setAutoMilestoneCountByPrice(false)
                setMilestoneCount(Number(e.target.value))
              }}
            />
            <div className="pb-debug-range-labels">
              <span>1</span>
              <span>{DEMO_MILESTONE_COUNT_MAX}</span>
            </div>
          </section>

          <section className="pb-debug-section">
            <div className="pb-debug-label">
              First milestone position
              <span className="pb-debug-value">{milestoneFirstPct}%</span>
            </div>
            <input
              type="range"
              className="pb-debug-range"
              min={0}
              max={50}
              step={1}
              value={milestoneFirstPct}
              onChange={e => setMilestoneFirstPct(Number(e.target.value))}
            />
            <div className="pb-debug-range-labels">
              <span>0%</span>
              <span>50%</span>
            </div>
            <div
              className="pb-debug-milestone-hint"
              title={demoMilestones.map(m => m.label).join(' → ')}
            >
              {demoMilestones.map(m => m.position.toFixed(1)).join(' · ')}%
            </div>
          </section>

          <hr className="pb-debug-divider" />

          {/* Matched projects mode */}
          <section className="pb-debug-section">
            <label className="pb-debug-toggle-row">
              <span className="pb-debug-label" style={{ marginBottom: 0 }}>Matched donation</span>
              <div
                className={`pb-debug-switch ${matchedEnabled ? 'pb-debug-switch--on' : ''}`}
                onClick={() => setMatchedEnabled(!matchedEnabled)}
              >
                <div className="pb-debug-switch-thumb" />
              </div>
            </label>
            {matchedEnabled && (
              <div className="pb-debug-presets" style={{ marginTop: '0.5rem' }}>
                {MATCH_MULTIPLIERS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`pb-debug-preset-btn ${matchMultiplier === m ? 'pb-debug-preset-btn--active' : ''}`}
                    onClick={() => setMatchMultiplier(m)}
                  >
                    {m === 1.5 ? '1.5×' : `${m}×`}
                  </button>
                ))}
              </div>
            )}
          </section>

          <hr className="pb-debug-divider" />

          {/* Mobile mode */}
          <section className="pb-debug-section">
            <label className="pb-debug-toggle-row">
              <span className="pb-debug-label" style={{ marginBottom: 0 }}>Mobile viewport</span>
              <div
                className={`pb-debug-switch ${mobileMode ? 'pb-debug-switch--on' : ''}`}
                onClick={() => setMobileMode(!mobileMode)}
              >
                <div className="pb-debug-switch-thumb" />
              </div>
            </label>
            {mobileMode && (
              <>
                <div className="pb-debug-label" style={{ marginTop: '0.5rem' }}>
                  Width
                  <span className="pb-debug-value">{mobileWidth}px</span>
                </div>
                <input
                  type="range"
                  className="pb-debug-range"
                  min={280}
                  max={480}
                  step={5}
                  value={mobileWidth}
                  onChange={e => setMobileWidth(Number(e.target.value))}
                />
                <div className="pb-debug-device-presets">
                  {[
                    { w: 320, label: 'SE' },
                    { w: 375, label: 'iPhone' },
                    { w: 390, label: '14 Pro' },
                    { w: 430, label: '15 Max' },
                  ].map(d => (
                    <button
                      key={d.w}
                      className={`pb-debug-preset-btn ${mobileWidth === d.w ? 'pb-debug-preset-btn--active' : ''}`}
                      onClick={() => setMobileWidth(d.w)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Preview area */}
        <div className="pb-demo-preview">
          <div
            className={`pb-demo-container ${mobileMode ? 'pb-demo-container--mobile' : ''}`}
            style={mobileMode ? { maxWidth: mobileWidth } : undefined}
          >
            {mobileMode && (
              <div className="pb-demo-mobile-chrome">
                <div className="pb-demo-mobile-notch" />
              </div>
            )}
            <DonationProgressBar
              key={resetKey}
              totalPrice={totalPrice}
              fundedAmount={safeFunded}
              matchMultiplier={matchedEnabled ? matchMultiplier : undefined}
              milestones={demoMilestones}
              onGiveToClassroom={donorPay => {
                const mult = matchedEnabled ? matchMultiplier : 0
                const projectDelta =
                  mult > 0 ? Math.round(donorPay * mult) : Math.round(donorPay)
                setFundedAmount(prev => Math.min(totalPrice, prev + projectDelta))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
