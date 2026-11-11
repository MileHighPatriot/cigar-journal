import type { Cigar, Smoke } from '../data/types'
import { shownScore } from './scoring'

/**
 * Where a scored smoke sits in the journal: its rank, how it did against the same brand
 * and wrapper, and against the last time this cigar was smoked. Plain lines, most telling
 * first. Empty when the smoke has no score.
 */
export function standing(
  smoke: Smoke,
  smokes: Iterable<Smoke>,
  cigars: Map<string, Cigar>,
): string[] {
  if (smoke.score === null) return []
  const mine = shownScore(smoke.score)
  const cigar = cigars.get(smoke.cigarId)
  const others: { smoke: Smoke; cigar: Cigar | undefined; shown: number }[] = []
  for (const other of smokes) {
    if (other.id === smoke.id || other.deletedAt || other.status !== 'complete') continue
    if (other.score === null) continue
    others.push({ smoke: other, cigar: cigars.get(other.cigarId), shown: shownScore(other.score) })
  }

  const lines: string[] = []
  if (others.length === 0) {
    lines.push('Your first scored smoke')
    return lines
  }

  const total = others.length + 1
  const rank =
    1 +
    others.filter((other) => other.smoke.score !== null && other.smoke.score > (smoke.score ?? 0))
      .length
  lines.push(
    rank === 1 && total >= 3
      ? `Your best yet, #1 of ${total} smokes`
      : `#${rank} of ${total} smokes`,
  )

  const average = (rows: typeof others) =>
    Math.round(rows.reduce((sum, row) => sum + row.shown, 0) / rows.length)
  const against = (label: string, rows: typeof others): string => {
    const gap = mine - average(rows)
    if (gap === 0) return `Right at your ${label} average`
    return `${Math.abs(gap)} ${gap > 0 ? 'over' : 'under'} your ${label} average`
  }

  const brand = cigar?.brand
  if (brand) {
    const same = others.filter((other) => other.cigar?.brand === brand)
    if (same.length > 0) {
      if (same.every((other) => mine > other.shown)) lines.push(`Best ${brand} you have logged`)
      else if (same.length >= 2) lines.push(against(brand, same))
    }
  }

  const wrapper = cigar?.wrapperType
  if (wrapper) {
    const same = others.filter((other) => other.cigar?.wrapperType === wrapper)
    if (same.length >= 2) lines.push(against(wrapper, same))
  }

  let last: (typeof others)[number] | null = null
  for (const other of others) {
    if (other.smoke.cigarId !== smoke.cigarId || other.smoke.smokedAt >= smoke.smokedAt) continue
    if (!last || other.smoke.smokedAt > last.smoke.smokedAt) last = other
  }
  if (last) {
    const gap = mine - last.shown
    lines.push(
      gap === 0
        ? 'Same score as the last time you smoked it'
        : `${Math.abs(gap)} ${gap > 0 ? 'better' : 'lower'} than the last time you smoked it`,
    )
  }
  return lines
}
