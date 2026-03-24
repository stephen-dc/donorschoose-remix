/** Max milestone count allowed by the demo slider (must match ProgressBarDemo range input). */
export const DEMO_MILESTONE_COUNT_MAX = 12

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/**
 * Tiered milestone count from total project cost (raw dollars, not match-adjusted).
 * Under $900 → 5; $900–$1,500 → 6; above $1,500 → +1 per $600 (capped at {@link DEMO_MILESTONE_COUNT_MAX}).
 */
export function milestoneCountFromProjectTotal(totalPrice: number): number {
  const t = Math.max(100, totalPrice)
  if (t < 900) return clamp(5, 1, DEMO_MILESTONE_COUNT_MAX)
  if (t <= 1500) return clamp(6, 1, DEMO_MILESTONE_COUNT_MAX)
  return clamp(
    6 + Math.ceil((t - 1500) / 600),
    1,
    DEMO_MILESTONE_COUNT_MAX
  )
}
