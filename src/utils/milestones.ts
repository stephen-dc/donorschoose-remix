/** Default used by production callers (e.g. Feed). */
export const DEFAULT_MILESTONE_COUNT = 2

export interface Milestone {
  position: number // 0–100 percentage along the bar
  label: string
}

const STEP_LABELS = [
  'Kickoff boost',
  'Halfway there',
  'Almost there!',
  'Almost funded',
] as const

/**
 * Evenly spaced milestones from `firstMilestonePct` through 100%.
 * With default `firstMilestonePct` (50) and `DEFAULT_MILESTONE_COUNT` (2), positions are 50%, 100%.
 * With `count === 1`, only a single milestone at 100%.
 * Dollar hints in labels use `totalPrice` for display only. `displayDollarMultiplier`
 * scales those dollar figures (e.g. match campaign) without changing milestone positions.
 */
export function buildMilestones(
  totalPrice: number,
  firstMilestonePct = 50,
  count = DEFAULT_MILESTONE_COUNT,
  options?: { displayDollarMultiplier?: number }
): Milestone[] {
  const n = Math.max(1, Math.floor(count))
  const dollarMult = options?.displayDollarMultiplier ?? 1

  if (n === 1) {
    return [{ position: 100, label: 'Fully funded!' }]
  }

  const start = Math.min(90, Math.max(0, firstMilestonePct))
  return Array.from({ length: n }, (_, i) => {
    const position = start + (i / (n - 1)) * (100 - start)
    const clamped = Math.min(100, Math.round(position * 1000) / 1000)
    let label: string
    if (i === n - 1) {
      label = 'Fully funded!'
    } else if (i === 0) {
      label = STEP_LABELS[0] ?? 'Kickoff boost'
    } else {
      const dollarsAt = Math.round((clamped / 100) * totalPrice * dollarMult)
      label = `${STEP_LABELS[i] ?? `Milestone ${i + 1}`} · $${dollarsAt.toLocaleString()}`
    }
    return { position: clamped, label }
  })
}
