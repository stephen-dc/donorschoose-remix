import { DEFAULT_MILESTONE_COUNT } from './milestones'

export const MATCH_MULTIPLIERS = [1.5, 2, 3, 5, 10] as const

export type ProgressBarDemoUrlState = {
  totalPrice: number
  fundedAmount: number
  matchedEnabled: boolean
  matchMultiplier: number
  milestoneCount: number
  milestoneFirstPct: number
  /** When true, milestone count tracks total price tiers until changed manually */
  autoMilestoneCountByPrice: boolean
  mobileMode: boolean
  mobileWidth: number
}

/** Default debugger / demo state (also used by URL parsing when params are missing). */
export const PROGRESS_BAR_DEMO_DEFAULTS: ProgressBarDemoUrlState = {
  totalPrice: 868,
  fundedAmount: 325,
  matchedEnabled: false,
  matchMultiplier: 2,
  milestoneCount: DEFAULT_MILESTONE_COUNT,
  milestoneFirstPct: 50,
  autoMilestoneCountByPrice: false,
  mobileMode: false,
  mobileWidth: 375,
}

const DEFAULTS = PROGRESS_BAR_DEMO_DEFAULTS

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function isAllowedMultiplier(m: number): boolean {
  return MATCH_MULTIPLIERS.some(x => Math.abs(x - m) < 1e-9)
}

export function parseProgressBarDemoSearchParams(
  sp: URLSearchParams
): ProgressBarDemoUrlState {
  const t = clamp(parseInt(sp.get('t') ?? '', 10) || DEFAULTS.totalPrice, 100, 5000)
  const fRaw = parseInt(sp.get('f') ?? '', 10)
  const f = Number.isFinite(fRaw) ? clamp(fRaw, 0, t) : clamp(DEFAULTS.fundedAmount, 0, t)

  const multStr = sp.get('mult')
  let matchedEnabled = false
  let matchMultiplier = DEFAULTS.matchMultiplier
  if (multStr !== null && multStr !== '' && multStr !== '0') {
    const m = parseFloat(multStr)
    if (Number.isFinite(m) && isAllowedMultiplier(m)) {
      matchedEnabled = true
      matchMultiplier = m
    }
  }

  const n = clamp(parseInt(sp.get('n') ?? '', 10) || DEFAULTS.milestoneCount, 1, 12)
  const p = clamp(parseInt(sp.get('p') ?? '', 10) || DEFAULTS.milestoneFirstPct, 0, 50)

  const vm = sp.get('vm') === '1'
  const vw = clamp(parseInt(sp.get('vw') ?? '', 10) || DEFAULTS.mobileWidth, 280, 480)
  const autoMilestoneCountByPrice = sp.get('am') === '1'

  return {
    totalPrice: t,
    fundedAmount: f,
    matchedEnabled,
    matchMultiplier,
    milestoneCount: n,
    milestoneFirstPct: p,
    autoMilestoneCountByPrice,
    mobileMode: vm,
    mobileWidth: vw,
  }
}

export function buildProgressBarDemoSearchParams(
  state: ProgressBarDemoUrlState
): URLSearchParams {
  const p = new URLSearchParams()
  p.set('t', String(state.totalPrice))
  p.set('f', String(Math.min(state.fundedAmount, state.totalPrice)))
  if (state.matchedEnabled && isAllowedMultiplier(state.matchMultiplier)) {
    p.set('mult', String(state.matchMultiplier))
  } else {
    p.set('mult', '0')
  }
  p.set('n', String(state.milestoneCount))
  p.set('p', String(state.milestoneFirstPct))
  p.set('am', state.autoMilestoneCountByPrice ? '1' : '0')
  p.set('vm', state.mobileMode ? '1' : '0')
  p.set('vw', String(state.mobileWidth))
  return p
}

/** True when serialized query strings match (same keys: t, f, mult, n, p, vm, vw). */
export function progressBarDemoUrlEquals(a: URLSearchParams, b: URLSearchParams): boolean {
  const keys = ['t', 'f', 'mult', 'n', 'p', 'am', 'vm', 'vw'] as const
  for (const k of keys) {
    if ((a.get(k) ?? '') !== (b.get(k) ?? '')) return false
  }
  return true
}

export function getProgressBarDemoPermalink(state: ProgressBarDemoUrlState): string {
  const q = buildProgressBarDemoSearchParams(state).toString()
  if (typeof window === 'undefined') return `/progress-bar?${q}`
  return `${window.location.origin}${window.location.pathname}?${q}`
}
