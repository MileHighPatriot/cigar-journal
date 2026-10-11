import type { RatingKey, Ratings } from '../data/types'

export const RUBRIC_VERSION = 1 as const

export interface RubricCategory {
  key: RatingKey
  label: string
  /** Weight in hundredths, so the math stays in whole numbers. */
  weight: number
  covers: string
  anchors: { low: string; mid: string; high: string }
}

export const RUBRIC: RubricCategory[] = [
  {
    key: 'appearance',
    label: 'Appearance & construction',
    weight: 15,
    covers: 'Wrapper, veins, firmness, cap',
    anchors: { low: 'Rough', mid: 'Average', high: 'Flawless' },
  },
  {
    key: 'smoking',
    label: 'Smoking characteristics',
    weight: 25,
    covers: 'Draw, burn, ash, smoke, relights',
    anchors: { low: 'Fought it', mid: 'Decent', high: 'Effortless' },
  },
  {
    key: 'flavor',
    label: 'Flavor',
    weight: 25,
    covers: 'Richness, complexity, balance',
    anchors: { low: 'Harsh', mid: 'Pleasant', high: 'Stunning' },
  },
  {
    key: 'overall',
    label: 'Overall impression',
    weight: 35,
    covers: 'Would I reach for it again',
    anchors: { low: 'No thanks', mid: 'Fine', high: 'Top shelf' },
  },
]

export interface Score {
  /** Exact score, 3 decimals. This is what gets stored. */
  exact: number
  /** Whole number for display, rounded half up. */
  shown: number
}

/**
 * score = 50 + 5 x sum(rating x weight). With half points as whole numbers (h = rating x 2)
 * and weights in hundredths, n = sum(h x w) and score = 50 + n / 40, with no float drift.
 */
export function computeScore(ratings: Ratings): Score | null {
  let n = 0
  for (const category of RUBRIC) {
    const rating = ratings[category.key]
    if (rating === null) return null
    n += Math.round(rating * 2) * category.weight
  }
  return {
    exact: Math.round((50 + n / 40) * 1000) / 1000,
    shown: 50 + Math.floor((n + 20) / 40),
  }
}

/** Rounds a stored exact score the same way computeScore does. */
export function shownScore(exact: number): number {
  return Math.floor(exact + 0.5 + 1e-9)
}

export type Verdict = 'Box-worthy' | 'Buy a few' | 'Worth a single' | 'Pass'

/** Uses the shown (rounded) score so the number and the label never disagree. */
export function verdictFor(shown: number): Verdict {
  if (shown >= 88) return 'Box-worthy'
  if (shown >= 86) return 'Buy a few'
  if (shown >= 84) return 'Worth a single'
  return 'Pass'
}

export const LEVEL_LABELS = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'] as const

export function levelLabel(level: number | null): string {
  return level ? (LEVEL_LABELS[level - 1] ?? '') : ''
}

export function emptyRatings(): Ratings {
  return { appearance: null, smoking: null, flavor: null, overall: null }
}
