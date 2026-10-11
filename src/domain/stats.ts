import type { Cigar, Level, Lot, Smoke } from '../data/types'
import { LEVEL_LABELS, shownScore } from './scoring'
import { effectiveTags } from './tags'

export interface ScoredRow {
  smoke: Smoke
  cigar: Cigar | undefined
  /** Shown (rounded) score. */
  score: number
}

/** Completed smokes that are not deleted, newest first, with their cigar. */
export function completedRows(
  smokes: Iterable<Smoke>,
  cigars: Map<string, Cigar>,
): { smoke: Smoke; cigar: Cigar | undefined }[] {
  return [...smokes]
    .filter((smoke) => !smoke.deletedAt && smoke.status === 'complete')
    .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1))
    .map((smoke) => ({ smoke, cigar: cigars.get(smoke.cigarId) }))
}

export function scoredRows(rows: { smoke: Smoke; cigar: Cigar | undefined }[]): ScoredRow[] {
  return rows.flatMap((row) =>
    row.smoke.score === null ? [] : [{ ...row, score: shownScore(row.smoke.score) }],
  )
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/** The smoke's own strength, else the rounded mean of its thirds, else the cigar's. */
export function effectiveStrength(smoke: Smoke, cigar: Cigar | undefined): Level | null {
  if (smoke.strength) return smoke.strength
  const thirds = [smoke.thirds.first, smoke.thirds.second, smoke.thirds.final]
    .map((third) => third.strength)
    .filter((level): level is Level => level !== null)
  if (thirds.length > 0) return Math.round(average(thirds) ?? 0) as Level
  return cigar?.strength ?? null
}

export interface ScoreBin {
  label: string
  /** Read aloud and shown on hover, for example "88 to 89". */
  range: string
  count: number
}

/** Two-point bins from 80 to 95, with everything under 80 and 96 and up at the ends. */
export function scoreBins(scores: number[]): ScoreBin[] {
  const bins: (ScoreBin & { from: number; to: number })[] = [
    { label: '<80', range: 'Under 80', from: 0, to: 79, count: 0 },
  ]
  for (let from = 80; from <= 94; from += 2) {
    bins.push({
      label: String(from),
      range: `${from} to ${from + 1}`,
      from,
      to: from + 1,
      count: 0,
    })
  }
  bins.push({ label: '96+', range: '96 and up', from: 96, to: 100, count: 0 })
  for (const score of scores) {
    const bin = bins.find((b) => score >= b.from && score <= b.to)
    if (bin) bin.count += 1
  }
  return bins.map(({ label, range, count }) => ({ label, range, count }))
}

export type GroupKey = 'wrapper' | 'country' | 'strength' | 'brand'

export interface GroupAverage {
  label: string
  average: number
  count: number
}

/** Average score per group. Only groups with 2 or more scored smokes are kept. */
export function averageBy(rows: ScoredRow[], key: GroupKey): GroupAverage[] {
  const groups = new Map<string, number[]>()
  for (const row of rows) {
    const strength = effectiveStrength(row.smoke, row.cigar)
    const label =
      key === 'wrapper'
        ? row.cigar?.wrapperType
        : key === 'country'
          ? row.cigar?.country
          : key === 'brand'
            ? row.cigar?.brand
            : strength
              ? LEVEL_LABELS[strength - 1]
              : null
    if (!label) continue
    groups.set(label, [...(groups.get(label) ?? []), row.score])
  }
  return [...groups]
    .filter(([, scores]) => scores.length >= 2)
    .map(([label, scores]) => ({
      label,
      average: Math.round((average(scores) ?? 0) * 10) / 10,
      count: scores.length,
    }))
    .sort((a, b) => b.average - a.average || b.count - a.count)
}

export function topTags(smokes: Iterable<Smoke>, limit = 10): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const smoke of smokes) {
    for (const tag of effectiveTags(smoke)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

export function totalMinutes(smokes: Iterable<Smoke>): number {
  let total = 0
  for (const smoke of smokes) total += smoke.durationMin ?? 0
  return total
}

export interface MonthSpend {
  /** "2026-10" */
  month: string
  /** "Oct" */
  label: string
  total: number
}

const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short' })

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Money out per month: humidor purchases by purchase date, plus the price paid for
 * smokes that did not come from the humidor, by smoke date.
 */
export function spendByMonth(
  smokes: Iterable<Smoke>,
  lots: Iterable<Lot>,
  months = 12,
  now = new Date(),
): MonthSpend[] {
  const totals = new Map<string, number>()
  for (const lot of lots) {
    if (lot.deletedAt || lot.priceEach === null) continue
    const key = lot.purchaseDate.slice(0, 7)
    totals.set(key, (totals.get(key) ?? 0) + lot.quantityPurchased * lot.priceEach)
  }
  for (const smoke of smokes) {
    if (smoke.deletedAt || smoke.pricePaid === null || smoke.lotId) continue
    const key = monthKey(new Date(smoke.smokedAt))
    totals.set(key, (totals.get(key) ?? 0) + smoke.pricePaid)
  }
  const out: MonthSpend[] = []
  for (let back = months - 1; back >= 0; back--) {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 1)
    const key = monthKey(date)
    out.push({ month: key, label: monthLabel.format(date), total: totals.get(key) ?? 0 })
  }
  return out
}

/** A round number at or above the largest value, for the top of a chart's scale. */
export function niceMax(value: number): number {
  if (value <= 4) return 4
  const power = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * power) return step * power
  }
  return 10 * power
}
