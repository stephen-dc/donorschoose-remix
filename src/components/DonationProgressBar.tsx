import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from 'react'
import type { Milestone } from '../utils/milestones'

const DONATION_SNAP_INCREMENT = 25
/** Cursor within this many px of a milestone center uses that milestone’s exact $ amount (not $25 snap) */
const MILESTONE_SNAP_DISTANCE_PX = 24

function snapDonationToIncrement(
  donation: number,
  maxDonation: number,
  increment = DONATION_SNAP_INCREMENT
): number {
  if (donation <= 0) return 0
  let rounded = Math.round(donation / increment) * increment
  if (rounded === 0) rounded = increment
  return Math.min(maxDonation, rounded)
}

/** Milestone labels may include " · $N" — tooltip only shows dollars on the Give line */
function milestoneTooltipHeadline(label: string): string {
  const cut = label.indexOf(' · $')
  if (cut === -1) return label
  return label.slice(0, cut).trim()
}

const MILESTONE_CELEBRATIONS = [
  "We've passed the kickoff — great start!",
  "We're building momentum — thank you!",
  "We're halfway there — amazing!",
  "We're almost there — incredible support!",
] as const

/** Short celebration for the highest milestone the bar has reached (not the next goal). */
function getMilestoneCelebration(
  milestones: Milestone[],
  fundedPct: number,
  costToComplete: number
): string | null {
  if (milestones.length === 0) return null
  if (costToComplete <= 0 || fundedPct >= 100) {
    return 'We fully funded this classroom!'
  }
  let achieved = -1
  for (let i = 0; i < milestones.length; i++) {
    if (fundedPct >= milestones[i].position) achieved = i
  }
  if (achieved < 0) {
    return "Let's get this project started!"
  }
  const lastIdx = milestones.length - 1
  if (achieved === lastIdx) {
    return 'We fully funded this classroom!'
  }
  return MILESTONE_CELEBRATIONS[achieved] ?? "We've hit a milestone — thank you for your support!"
}

const MILESTONE_ENCOURAGEMENT_MESSAGES = [
  "You're clearing the next milestone!",
  'Yes! That amount crosses a milestone!',
  "Great — you're powering past a milestone!",
  'Nice — that puts a milestone within reach!',
  "That's going to clear a milestone — thank you!",
  'Milestone territory — love it!',
  "You're helping unlock the next milestone!",
  'Awesome — a milestone is about to fall!',
] as const

const FULL_FUND_ENCOURAGEMENT_MESSAGES = [
  "You're fully funding this classroom — incredible!",
  "That brings this project all the way — thank you!",
  "Full funding — you're making this happen!",
  "You're closing the gap and funding this project completely!",
  "Amazing — this amount fully funds the classroom!",
  "You're taking this project across the finish line!",
  "Full funding unlocked — what a gift to these students!",
  "That's enough to fully fund this project — thank you!",
] as const

function donationClearsAMilestone(
  fundedAmount: number,
  totalPrice: number,
  donation: number,
  milestones: Milestone[]
): boolean {
  if (donation <= 0 || totalPrice <= 0 || milestones.length === 0) return false
  const after = Math.min(fundedAmount + donation, totalPrice)
  for (const ms of milestones) {
    const target = Math.round((ms.position / 100) * totalPrice)
    if (fundedAmount < target && after >= target) return true
  }
  return false
}

/** True when this donation crosses the final milestone (typically full project funding). */
function donationClearsLastMilestone(
  fundedAmount: number,
  totalPrice: number,
  donation: number,
  milestones: Milestone[]
): boolean {
  if (donation <= 0 || totalPrice <= 0 || milestones.length === 0) return false
  const last = milestones[milestones.length - 1]
  const target = Math.round((last.position / 100) * totalPrice)
  const after = Math.min(fundedAmount + donation, totalPrice)
  return fundedAmount < target && after >= target
}

/** Word inside “Donations are <strong>…</strong> for a limited time!” */
function matchStrongPhrase(multiplier: number): string {
  if (multiplier === 2) return 'doubled'
  if (multiplier === 3) return 'tripled'
  if (multiplier === 1.5) return '1.5× matched'
  if (multiplier === 5) return '5× matched'
  if (multiplier === 10) return '10× matched'
  return `${multiplier}× matched`
}

interface DonationProgressBarProps {
  /** Total project cost in dollars */
  totalPrice: number
  /** Amount already funded in dollars */
  fundedAmount: number
  /**
   * When set (e.g. 1.5, 2, 3, 5, 10), match campaign UI: purple theme, scaled display dollars,
   * no extra bar segment. Actual funded/total and bar geometry still use real dollars.
   */
  matchMultiplier?: number
  /** Milestone dots to show on the bar */
  milestones?: Milestone[]
  /** Called when user clicks on the bar to set a donation amount */
  onDonationSelect?: (amount: number) => void
  /**
   * Called when user clicks “Give to this classroom” with the current donor pay amount (capped).
   * Use this for actions that should run only on submit (not on every keystroke; see `onDonationSelect`).
   */
  onGiveToClassroom?: (donorPayAmount: number) => void
}

export default function DonationProgressBar({
  totalPrice,
  fundedAmount,
  matchMultiplier: matchMultiplierProp,
  milestones = [],
  onDonationSelect,
  onGiveToClassroom,
}: DonationProgressBarProps) {
  const matchMultiplier = matchMultiplierProp ?? 0
  const trackRef = useRef<HTMLDivElement>(null)
  const [hoverState, setHoverState] = useState<{
    active: boolean
    x: number // pixel position within track
    pct: number // percentage position
    amount: number // dollar amount to reach this point
    snappedMilestone: Milestone | null
    /** True when preview came from label copy — hide floating tooltips */
    suppressHoverTooltips: boolean
  }>({
    active: false,
    x: 0,
    pct: 0,
    amount: 0,
    snappedMilestone: null,
    suppressHoverTooltips: false,
  })

  const [inputAmount, setInputAmount] = useState<string>('')
  const [encouragementLine, setEncouragementLine] = useState<string | null>(null)
  const costToComplete = Math.max(0, totalPrice - fundedAmount)
  const remainingToComplete = Math.max(0, costToComplete)
  const fundedPct = Math.min(100, (fundedAmount / totalPrice) * 100)
  /** Max value in the donation input: project gap, or donor pay cap when a match divides the gap. */
  const maxDonationInput = useMemo(
    () =>
      matchMultiplier > 0
        ? Math.max(0, Math.round(costToComplete / matchMultiplier))
        : costToComplete,
    [costToComplete, matchMultiplier]
  )
  /** With a match (e.g. 2×), show donor pay ($200 gap ÷ 2× → $100). */
  const displayDonorPayAmount = useCallback(
    (fundingGapOrDonationDollars: number) =>
      matchMultiplier > 0
        ? Math.round(fundingGapOrDonationDollars / matchMultiplier)
        : fundingGapOrDonationDollars,
    [matchMultiplier]
  )
  /** Emphasize “$X to complete” only in the final stretch (toward the last milestone, not mid-campaign). */
  const towardFinalMilestone =
    milestones.length === 0
      ? false
      : milestones.length === 1
        ? true
        : fundedPct >= milestones[milestones.length - 2].position

  const parsedDonorInput = useMemo(() => {
    const raw = inputAmount.replace(/[^0-9]/g, '')
    const parsed = parseInt(raw || '0', 10)
    return Math.min(Number.isFinite(parsed) ? parsed : 0, maxDonationInput)
  }, [inputAmount, maxDonationInput])

  /** Project funding implied by the input (donor × multiplier when matched). */
  const effectiveProjectDonationFromInput = useMemo(
    () =>
      matchMultiplier > 0
        ? parsedDonorInput * matchMultiplier
        : parsedDonorInput,
    [parsedDonorInput, matchMultiplier]
  )

  const inputPct = inputAmount
    ? Math.min(
        100,
        ((fundedAmount + effectiveProjectDonationFromInput) / totalPrice) * 100
      )
    : 0

  const nextMilestone = milestones.find(ms => fundedPct < ms.position) ?? null
  const amountToNextMilestone = nextMilestone
    ? Math.max(0, Math.round((nextMilestone.position / 100) * totalPrice - fundedAmount))
    : 0
  /** Match campaign active — purple theme + scaled display dollars; no extra bar segment */
  const isMatchVariant = matchMultiplier > 0

  /** Hide below-bar amount when nothing’s left to fund or the input already covers the full gap (match + non-match) */
  const showBelowBarAmountLine =
    remainingToComplete > 0 &&
    effectiveProjectDonationFromInput < costToComplete

  const lastMilestone = milestones.length > 0 ? milestones[milestones.length - 1] : null

  /** Hide next-milestone copy when the only remaining goal is the final bar milestone (redundant with “to complete”). */
  const showNextMilestoneCopy =
    !isMatchVariant &&
    Boolean(nextMilestone) &&
    lastMilestone != null &&
    nextMilestone !== lastMilestone &&
    amountToNextMilestone > 0 &&
    costToComplete > 0

  const milestoneCelebration = getMilestoneCelebration(milestones, fundedPct, costToComplete)

  const milestonePositionsKey = milestones.map(m => m.position).join(':')

  /** Green “fully funding” look — not used when a match pool is active (purple theme instead) */
  const isFullyFundingStyle =
    !isMatchVariant &&
    (costToComplete <= 0 ||
      (effectiveProjectDonationFromInput > 0 &&
        donationClearsLastMilestone(
          fundedAmount,
          totalPrice,
          effectiveProjectDonationFromInput,
          milestones
        )))

  const getTrackMetrics = useCallback(() => {
    if (!trackRef.current) return null
    const rect = trackRef.current.getBoundingClientRect()
    return { left: rect.left, width: rect.width }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const metrics = getTrackMetrics()
      if (!metrics || metrics.width === 0) return

      const x = e.clientX - metrics.left
      const rawPct = (x / metrics.width) * 100

      // No hover effect to the left of the funded area
      if (rawPct <= fundedPct) {
        setHoverState(prev => (prev.active ? { ...prev, active: false } : prev))
        return
      }

      // Nearest milestone under the cursor (pixel proximity) — exact $ to that dot, no $25 rounding
      let nearMilestone: Milestone | null = null
      let bestPxDist = Infinity
      for (const ms of milestones) {
        if (ms.position <= fundedPct) continue
        const msPx = (ms.position / 100) * metrics.width
        const dist = Math.abs(x - msPx)
        if (dist < MILESTONE_SNAP_DISTANCE_PX && dist < bestPxDist) {
          bestPxDist = dist
          nearMilestone = ms
        }
      }

      let donationNeeded: number
      let effectivePct: number

      if (nearMilestone) {
        const dollarAtMilestone = (nearMilestone.position / 100) * totalPrice
        const exactDonation = dollarAtMilestone - fundedAmount
        donationNeeded = Math.min(costToComplete, Math.max(0, Math.round(exactDonation)))
        effectivePct = nearMilestone.position
      } else {
        const dollarAtPoint = (rawPct / 100) * totalPrice
        const rawDonation = dollarAtPoint - fundedAmount
        donationNeeded = snapDonationToIncrement(rawDonation, costToComplete)
        const totalAfter = fundedAmount + donationNeeded
        effectivePct = Math.min(100, (totalAfter / totalPrice) * 100)
      }

      setHoverState({
        active: true,
        x: (effectivePct / 100) * metrics.width,
        pct: effectivePct,
        amount: donationNeeded,
        snappedMilestone: nearMilestone,
        suppressHoverTooltips: false,
      })
    },
    [fundedPct, milestones, totalPrice, fundedAmount, costToComplete, getTrackMetrics]
  )

  const handleMouseLeave = useCallback(() => {
    setHoverState(prev => (prev.active ? { ...prev, active: false } : prev))
  }, [])

  /** Show the same bar hover / milestone snap as hovering the next dot on the track */
  const handleNextMilestoneCopyEnter = useCallback(() => {
    if (!nextMilestone || amountToNextMilestone <= 0) return
    const metrics = getTrackMetrics()
    if (!metrics || metrics.width === 0) return
    const effectivePct = nextMilestone.position
    setHoverState({
      active: true,
      x: (effectivePct / 100) * metrics.width,
      pct: effectivePct,
      amount: amountToNextMilestone,
      snappedMilestone: nextMilestone,
      suppressHoverTooltips: true,
    })
  }, [nextMilestone, amountToNextMilestone, getTrackMetrics])

  /** Same bar hover as the final milestone dot (fully funded) */
  const handleCompleteCopyEnter = useCallback(() => {
    if (remainingToComplete <= 0) return
    const metrics = getTrackMetrics()
    if (!metrics || metrics.width === 0) return
    const effectivePct = lastMilestone?.position ?? 100
    const dollarAtEnd = (effectivePct / 100) * totalPrice
    const donationNeeded = Math.min(costToComplete, Math.max(0, Math.round(dollarAtEnd - fundedAmount)))
    setHoverState({
      active: true,
      x: (effectivePct / 100) * metrics.width,
      pct: effectivePct,
      amount: donationNeeded,
      snappedMilestone: lastMilestone,
      suppressHoverTooltips: true,
    })
  }, [
    remainingToComplete,
    costToComplete,
    getTrackMetrics,
    totalPrice,
    fundedAmount,
    lastMilestone,
  ])

  const handleClick = useCallback(() => {
    if (!hoverState.active) return
    const toInput = displayDonorPayAmount(hoverState.amount)
    setInputAmount(String(toInput))
    onDonationSelect?.(toInput)
  }, [hoverState, onDonationSelect, displayDonorPayAmount])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setInputAmount(val)
      if (val && onDonationSelect) {
        onDonationSelect(Math.min(Number(val), maxDonationInput))
      }
    },
    [onDonationSelect, maxDonationInput]
  )

  const applyAmountToInput = useCallback(
    (amount: number) => {
      if (amount <= 0) return
      const capped = Math.min(Math.round(amount), maxDonationInput)
      if (capped <= 0) return
      setInputAmount(String(capped))
      onDonationSelect?.(capped)
    },
    [maxDonationInput, onDonationSelect]
  )

  const handleGiveSubmit = useCallback(() => {
    if (parsedDonorInput <= 0) return
    onGiveToClassroom?.(parsedDonorInput)
    onDonationSelect?.(parsedDonorInput)
  }, [parsedDonorInput, onGiveToClassroom, onDonationSelect])

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      handleGiveSubmit()
    },
    [handleGiveSubmit]
  )

  // Recalculate hover pixel position on resize
  useEffect(() => {
    const onResize = () => {
      setHoverState(prev => (prev.active ? { ...prev, active: false } : prev))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /** Encouragement: match pool uses fixed copy; otherwise random milestone / full-fund lines */
  useEffect(() => {
    const donation = effectiveProjectDonationFromInput

    if (isMatchVariant) {
      if (donation <= 0) {
        setEncouragementLine(null)
        return
      }
      const fullFundsProject =
        donationClearsLastMilestone(fundedAmount, totalPrice, donation, milestones) ||
        (costToComplete > 0 && donation >= costToComplete)
      setEncouragementLine(
        fullFundsProject
          ? "You're completing this project thanks to a match!"
          : 'Your donation is being matched!'
      )
      return
    }

    if (
      donation <= 0 ||
      !donationClearsAMilestone(fundedAmount, totalPrice, donation, milestones)
    ) {
      setEncouragementLine(null)
      return
    }
    const pool = donationClearsLastMilestone(fundedAmount, totalPrice, donation, milestones)
      ? FULL_FUND_ENCOURAGEMENT_MESSAGES
      : MILESTONE_ENCOURAGEMENT_MESSAGES
    setEncouragementLine(pool[Math.floor(Math.random() * pool.length)])
  }, [
    effectiveProjectDonationFromInput,
    fundedAmount,
    totalPrice,
    costToComplete,
    milestonePositionsKey,
    isMatchVariant,
  ])

  /** When the below-bar row is hidden but next-milestone copy still applies, show it in meta on narrow screens */
  const showNextInMetaOnMobileOnly =
    !isMatchVariant && showNextMilestoneCopy && !showBelowBarAmountLine

  return (
    <div
      className={`dc-progress-widget${isFullyFundingStyle ? ' dc-progress-widget--fully-funding' : ''}${isMatchVariant ? ' dc-progress-widget--matched' : ''}${showNextInMetaOnMobileOnly ? ' dc-progress-widget--unmatched-bottom-row-hidden' : ''}`}
    >
      {/* Main bar area */}
      <div className="dc-progress-bar-row">
        <div className="dc-progress-track-area">
          <div className="dc-progress-hover-zone" onMouseLeave={handleMouseLeave}>
            {encouragementLine ? (
              <div className="dc-progress-encouragement">{encouragementLine}</div>
            ) : isMatchVariant ? (
              <div className="dc-progress-meta-row dc-progress-meta-row--match-only">
                <div className="dc-progress-match-callout">
                  Donations are <strong>{matchStrongPhrase(matchMultiplier)}</strong> for a limited time!
                </div>
              </div>
            ) : (
              (showNextMilestoneCopy || milestoneCelebration) && (
                <div className="dc-progress-meta-row">
                  {milestoneCelebration && (
                    <div className="dc-progress-milestone-celebration">{milestoneCelebration}</div>
                  )}
                  {showNextMilestoneCopy && (
                    <div
                      className="dc-progress-next-milestone dc-progress-next-milestone--meta-desktop"
                      onMouseEnter={handleNextMilestoneCopyEnter}
                      onClick={() => applyAmountToInput(amountToNextMilestone)}
                    >
                      <strong>${amountToNextMilestone.toLocaleString()}</strong> 'til the next milestone
                    </div>
                  )}
                </div>
              )
            )}

            {/* Track */}
            <div
              ref={trackRef}
              className="dc-progress-track"
              onMouseMove={handleMouseMove}
              onClick={handleClick}
            >
            {/* Funded fill */}
            <div
              className="dc-progress-fill"
              style={{ width: `${fundedPct}%` }}
            />

            {/* Hover preview fill — persists when an amount is in the input */}
            {(hoverState.active || inputPct > fundedPct) && (
              <div
                className={`dc-progress-hover-fill${!hoverState.active && inputPct > fundedPct ? ' dc-progress-hover-fill--locked' : ''}`}
                style={{
                  left: `${fundedPct}%`,
                  width: `${(hoverState.active ? hoverState.pct : inputPct) - fundedPct}%`,
                }}
              />
            )}

            {/* Milestone dots */}
            {milestones.map((ms, i) => {
              const isLast = i === milestones.length - 1
              const isSnapped =
                hoverState.active && hoverState.snappedMilestone === ms
              const isFunded = ms.position <= fundedPct
              const wouldBeReachedByHover =
                !isFunded &&
                !isSnapped &&
                hoverState.active &&
                hoverState.pct >= ms.position
              const wouldBeReachedByInput =
                !isFunded &&
                inputPct >= ms.position
              const isHovered = isSnapped || wouldBeReachedByHover || wouldBeReachedByInput

              return (
                <div
                  key={i}
                  className={`dc-milestone-dot${isLast ? ' dc-milestone-dot--track-end' : ''}${isHovered ? ' dc-milestone-dot--hovered' : ''}${isFunded ? ' dc-milestone-dot--reached' : ''}`}
                  style={isLast ? undefined : { left: `${ms.position}%` }}
                >
                  {isSnapped && !hoverState.suppressHoverTooltips && (
                    <div className="dc-milestone-tooltip">
                      {milestoneTooltipHeadline(ms.label)}
                      <br />
                      <span className="dc-progress-tooltip-give">
                        Give ${displayDonorPayAmount(hoverState.amount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Hover tooltip (when not snapped to a milestone) */}
            {hoverState.active &&
              !hoverState.snappedMilestone &&
              !hoverState.suppressHoverTooltips && (
              <div
                className="dc-hover-tooltip"
                style={{ left: `${hoverState.pct}%` }}
              >
                Give ${displayDonorPayAmount(hoverState.amount).toLocaleString()}
              </div>
            )}
            </div>

            {/* Below-bar labels — wrapper always mounted so layout doesn’t jump when copy is hidden */}
            <div
              className={`dc-progress-labels${!isMatchVariant ? ' dc-progress-labels--unmatched-split' : ''}`}
            >
              {showBelowBarAmountLine ? (
                isMatchVariant ? (
                  <span
                    className={`dc-progress-complete-for${towardFinalMilestone ? ' dc-progress-complete-for--prominent' : ''}${remainingToComplete > 0 ? ' dc-progress-complete-for--hoverable' : ''}`}
                    onMouseEnter={handleCompleteCopyEnter}
                    onClick={() =>
                      applyAmountToInput(displayDonorPayAmount(remainingToComplete))
                    }
                  >
                    You can complete this project for{' '}
                    <strong className="dc-progress-complete-for__amount">
                      ${displayDonorPayAmount(remainingToComplete).toLocaleString()}
                    </strong>
                  </span>
                ) : (
                  <>
                    {showNextMilestoneCopy && (
                      <div
                        className="dc-progress-next-milestone dc-progress-next-milestone--mobile-bottom"
                        onMouseEnter={handleNextMilestoneCopyEnter}
                        onClick={() => applyAmountToInput(amountToNextMilestone)}
                      >
                        <strong>${amountToNextMilestone.toLocaleString()}</strong> 'til the next milestone
                      </div>
                    )}
                    <span
                      className={`dc-progress-remaining${towardFinalMilestone ? ' dc-progress-remaining--prominent' : ''}${remainingToComplete > 0 ? ' dc-progress-remaining--hoverable' : ''}`}
                      onMouseEnter={handleCompleteCopyEnter}
                      onClick={() => applyAmountToInput(remainingToComplete)}
                    >
                      ${remainingToComplete.toLocaleString()} to complete
                    </span>
                  </>
                )
              ) : (
                <span className="dc-progress-labels-spacer" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {/* Donation input + button */}
        <div className="dc-progress-input-area">
          <div className="dc-progress-input-wrap">
            <span className="dc-progress-input-prefix">$</span>
            <input
              type="text"
              className="dc-progress-input"
              value={inputAmount}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder=""
              inputMode="numeric"
            />
          </div>
          <button
            type="button"
            className="dc-progress-give-btn"
            onClick={handleGiveSubmit}
          >
            Give to this classroom
          </button>
        </div>
      </div>
    </div>
  )
}
