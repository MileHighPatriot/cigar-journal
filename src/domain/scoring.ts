import type { BuyAgain, Marks, RatingKey, Ratings, Smoke } from '../data/types'

/** New smokes are scored on the scoresheet. */
export const RUBRIC_VERSION = 2 as const

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
 * score = 50 + 5 x sum(rating x weight), with weights in hundredths. A rating is a whole or
 * half point on a smoke scored the old way, and a figure to two decimals when it comes off
 * the scoresheet. The exact score is kept to 3 decimals.
 */
export function computeScore(ratings: Ratings): Score | null {
  let n = 0
  for (const category of RUBRIC) {
    const rating = ratings[category.key]
    if (rating === null) return null
    // Whole hundredths of a point, so the sum has no float drift.
    n += Math.round(rating * 100) * category.weight
  }
  const exact = Math.round((50 + n / 2000) * 1000) / 1000
  return { exact, shown: shownScore(exact) }
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

// ---------- The scoresheet ----------
//
// Ten things you can actually observe, each answered by tapping the line that fits. The
// answers work out the same four ratings the old 1 to 10 scales asked for, so a smoke
// scored either way lands on the same 100-point scale and the same verdict cutoffs.

export interface SheetLevel {
  label: string
  /** 0 to 100: how much of this item's share the answer earns. */
  points: number
}

export interface SheetItem {
  key: string
  category: RatingKey
  label: string
  /** What to look at, in a few words. */
  ask: string
  /** Its share within its category. */
  weight: number
  /** Worst to best. */
  levels: SheetLevel[]
}

const levels = (...pairs: [string, number][]): SheetLevel[] =>
  pairs.map(([label, points]) => ({ label, points }))

export const SHEET: SheetItem[] = [
  {
    key: 'wrapper',
    category: 'appearance',
    label: 'Wrapper',
    ask: 'Color, oil, veins, seams',
    weight: 3,
    levels: levels(
      ['Damaged', 0],
      ['Rough', 28],
      ['Average', 50],
      ['Clean', 72],
      ['Flawless', 100],
    ),
  },
  {
    key: 'build',
    category: 'appearance',
    label: 'Feel in the hand',
    ask: 'Squeeze it from foot to cap',
    weight: 2,
    levels: levels(
      ['Hard or soft spots', 15],
      ['A little uneven', 48],
      ['Firm', 74],
      ['Packed perfectly', 100],
    ),
  },
  {
    key: 'draw',
    category: 'smoking',
    label: 'Draw',
    ask: 'How it pulled, start to finish',
    weight: 4,
    levels: levels(
      ['Plugged or wide open', 0],
      ['Fought it', 28],
      ['A bit off', 52],
      ['Good', 74],
      ['Ideal', 100],
    ),
  },
  {
    key: 'burn',
    category: 'smoking',
    label: 'Burn',
    ask: 'The burn line and the lighter',
    weight: 4,
    levels: levels(
      ['Kept going out', 0],
      ['Several touch-ups', 28],
      ['One touch-up', 52],
      ['Wavy, fixed itself', 74],
      ['Razor sharp', 100],
    ),
  },
  {
    key: 'smoke',
    category: 'smoking',
    label: 'Smoke and ash',
    ask: 'How much smoke, how the ash held',
    weight: 2,
    levels: levels(['Thin and flaky', 20], ['Fine', 50], ['Good', 74], ['Thick and solid', 100]),
  },
  {
    key: 'richness',
    category: 'flavor',
    label: 'How much flavor',
    ask: 'Flat to full of it',
    weight: 3,
    levels: levels(['Flat', 0], ['Thin', 28], ['Pleasant', 52], ['Rich', 74], ['Stunning', 100]),
  },
  {
    key: 'complexity',
    category: 'flavor',
    label: 'Did it change',
    ask: 'From the first puff to the nub',
    weight: 2,
    levels: levels(
      ['One note', 22],
      ['A little', 50],
      ['Each third differed', 76],
      ['Kept surprising', 100],
    ),
  },
  {
    key: 'smooth',
    category: 'flavor',
    label: 'Smoothness',
    ask: 'Any bite, bitterness, or heat',
    weight: 3,
    levels: levels(
      ['Harsh all the way', 0],
      ['Harsh at times', 30],
      ['Mostly smooth', 54],
      ['Smooth', 76],
      ['Silky', 100],
    ),
  },
  {
    key: 'finish',
    category: 'flavor',
    label: 'Finish',
    ask: 'What it left behind',
    weight: 2,
    levels: levels(['Bitter', 10], ['Short', 45], ['Pleasant', 74], ['Long and clean', 100]),
  },
  {
    key: 'call',
    category: 'overall',
    label: 'The call',
    ask: 'If it were your money',
    weight: 1,
    levels: levels(
      ['Put it down', 0],
      ['Would not buy', 30],
      ['Worth a single', 50],
      ['Buy a few', 65],
      ['Buy a box', 82],
      ['All-time great', 100],
    ),
  },
]

export function sheetItems(category: RatingKey): SheetItem[] {
  return SHEET.filter((item) => item.category === category)
}

function answered(item: SheetItem, marks: Marks): SheetLevel | undefined {
  const index = marks[item.key]
  return index === undefined ? undefined : item.levels[index]
}

/** A category's 1 to 10 rating from its items, or null until every one is answered. */
export function categoryRating(category: RatingKey, marks: Marks): number | null {
  let earned = 0
  let possible = 0
  for (const item of sheetItems(category)) {
    const level = answered(item, marks)
    if (!level) return null
    earned += level.points * item.weight
    possible += 100 * item.weight
  }
  if (possible === 0) return null
  return Math.round((1 + (9 * earned) / possible) * 100) / 100
}

/**
 * The ratings after the sheet is filled in. A category with every item answered takes its
 * rating from the sheet. One that is only partly answered keeps the rating it had, so
 * opening an old smoke never wipes the score it was given.
 */
export function ratingsFromMarks(current: Ratings, marks: Marks): Ratings {
  const next = { ...current }
  for (const category of RUBRIC) {
    const rating = categoryRating(category.key, marks)
    if (rating !== null) next[category.key] = rating
  }
  return next
}

export function sheetProgress(marks: Marks): { done: number; total: number } {
  return {
    done: SHEET.filter((item) => answered(item, marks)).length,
    total: SHEET.length,
  }
}

/** "The call" already says whether to buy it again. */
export function buyAgainFromMarks(marks: Marks): BuyAgain | null {
  const call = marks.call
  if (call === undefined) return null
  if (call <= 1) return 'no'
  if (call === 2) return 'single'
  if (call === 3) return 'few'
  return 'box'
}

// ---------- Bringing old scores onto the sheet ----------

/** How far off the closest answers may be before a more even set of answers is preferred. */
const CLOSE_ENOUGH = 0.15

/**
 * The sheet answers that come closest to a 1 to 10 rating given the old way. Among sets of
 * answers that land about equally close, the most even one wins, so an old "8" reads as
 * good across the board rather than one perfect item and one poor one.
 */
export function marksForRating(category: RatingKey, rating: number): Marks {
  const items = sheetItems(category)
  const possible = items.reduce((sum, item) => sum + 100 * item.weight, 0)
  let best: { marks: Marks; gap: number; spread: number } | null = null
  const walk = (index: number, picked: number[]) => {
    const item = items[index]
    if (!item) {
      const points = picked.map((level, i) => items[i]?.levels[level]?.points ?? 0)
      const earned = points.reduce((sum, value, i) => sum + value * (items[i]?.weight ?? 0), 0)
      const gap = Math.abs(1 + (9 * earned) / possible - rating)
      const spread = Math.max(...points) - Math.min(...points)
      const closer = !best || gap < best.gap - CLOSE_ENOUGH
      const asCloseAndMoreEven =
        best !== null &&
        gap <= best.gap + CLOSE_ENOUGH &&
        (spread < best.spread || (spread === best.spread && gap < best.gap))
      if (closer || asCloseAndMoreEven) {
        best = {
          marks: Object.fromEntries(picked.map((level, i) => [items[i]?.key ?? '', level])),
          gap,
          spread,
        }
      }
      return
    }
    for (let level = 0; level < item.levels.length; level++) walk(index + 1, [...picked, level])
  }
  walk(0, [])
  return (best as { marks: Marks } | null)?.marks ?? {}
}

/**
 * What to save to bring a smoke scored on the old 1 to 10 scales onto the scoresheet, or
 * null when it should be left alone: not scored, already on the sheet, or put back on
 * purpose. The old ratings and score are kept on the record so this can be undone.
 */
export function convertOldScore(smoke: Smoke): Partial<Smoke> | null {
  if (smoke.rubricVersion !== 1 || smoke.scoreKept || smoke.deletedAt) return null
  if (smoke.score === null || Object.keys(smoke.marks).length > 0) return null
  const marks: Marks = {}
  for (const category of RUBRIC) {
    const rating = smoke.ratings[category.key]
    if (rating === null) return null
    Object.assign(marks, marksForRating(category.key, rating))
  }
  const ratings = ratingsFromMarks(smoke.ratings, marks)
  return {
    marks,
    ratings,
    score: computeScore(ratings)?.exact ?? smoke.score,
    rubricVersion: 2,
    oldRatings: { ...smoke.ratings },
    oldScore: smoke.score,
  }
}

/** Puts a converted smoke back exactly as it was scored, and marks it to stay that way. */
export function restoreOldScore(smoke: Smoke): Partial<Smoke> | null {
  if (!smoke.oldRatings || smoke.oldScore === null) return null
  return {
    marks: {},
    ratings: { ...smoke.oldRatings },
    score: smoke.oldScore,
    rubricVersion: 1,
    oldRatings: null,
    oldScore: null,
    scoreKept: true,
  }
}
