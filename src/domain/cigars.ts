import type { Cigar, Smoke } from '../data/types'
import { fold } from './format'
import { LEVEL_LABELS, shownScore } from './scoring'

export interface CigarStats {
  /** Completed smokes of this cigar. */
  count: number
  /** Average shown score across the scored ones, or null. */
  average: number | null
  lastSmokedAt: string | null
}

export function statsByCigar(smokes: Iterable<Smoke>): Map<string, CigarStats> {
  const sums = new Map<string, { count: number; scored: number; total: number; last: string }>()
  for (const smoke of smokes) {
    if (smoke.deletedAt || smoke.status !== 'complete') continue
    const entry = sums.get(smoke.cigarId) ?? { count: 0, scored: 0, total: 0, last: '' }
    entry.count += 1
    if (smoke.score !== null) {
      entry.scored += 1
      entry.total += shownScore(smoke.score)
    }
    if (smoke.smokedAt > entry.last) entry.last = smoke.smokedAt
    sums.set(smoke.cigarId, entry)
  }
  const stats = new Map<string, CigarStats>()
  for (const [id, entry] of sums) {
    stats.set(id, {
      count: entry.count,
      average: entry.scored > 0 ? Math.round(entry.total / entry.scored) : null,
      lastSmokedAt: entry.last || null,
    })
  }
  return stats
}

export interface CigarFilter {
  query: string
  strength: number | null
  wrapper: string | null
  only: 'all' | 'smoked' | 'mine'
}

/**
 * Catalog cigars that match, sorted by brand and then line. In a search, cigars with every
 * word in their name come first, ahead of ones that only match in the details.
 */
export function filterCigars(
  cigars: Iterable<Cigar>,
  filter: CigarFilter,
  stats: Map<string, CigarStats>,
): Cigar[] {
  const words = fold(filter.query).split(/\s+/).filter(Boolean)
  const out: Cigar[] = []
  const byName = new Set<string>()
  for (const cigar of cigars) {
    if (cigar.deletedAt) continue
    if (filter.strength !== null && cigar.strength !== filter.strength) continue
    if (filter.wrapper !== null && cigar.wrapperType !== filter.wrapper) continue
    if (filter.only === 'smoked' && !stats.has(cigar.id)) continue
    if (filter.only === 'mine' && cigar.source !== 'manual') continue
    if (words.length > 0) {
      const haystack = [
        cigar.brand,
        cigar.line,
        cigar.vitola,
        cigar.wrapperType,
        cigar.wrapperLeaf,
        cigar.wrapperOrigin,
        cigar.binder,
        cigar.filler,
        cigar.country,
        cigar.factory,
        cigar.about,
        cigar.strength ? LEVEL_LABELS[cigar.strength - 1] : null,
        ...cigar.flavors,
        ...cigar.sizes.map((size) => size.name),
      ]
        .filter(Boolean)
        .join(' ')
      const folded = fold(haystack)
      if (!words.every((word) => folded.includes(word))) continue
      const name = fold(`${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`)
      if (words.every((word) => name.includes(word))) byName.add(cigar.id)
    }
    out.push(cigar)
  }
  const compare = new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare
  return out.sort(
    (a, b) =>
      Number(byName.has(b.id)) - Number(byName.has(a.id)) ||
      compare(a.brand, b.brand) ||
      compare(a.line, b.line),
  )
}

export function wrapperOptions(cigars: Iterable<Cigar>): string[] {
  const set = new Set<string>()
  for (const cigar of cigars) {
    if (!cigar.deletedAt && cigar.wrapperType) set.add(cigar.wrapperType)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'en'))
}

/** How many catalog cigars sit at each strength, 1 to 5. */
export function strengthCounts(cigars: Iterable<Cigar>): number[] {
  const counts = [0, 0, 0, 0, 0]
  for (const cigar of cigars) {
    if (cigar.deletedAt || !cigar.strength) continue
    counts[cigar.strength - 1] = (counts[cigar.strength - 1] ?? 0) + 1
  }
  return counts
}

export function priceLabel(tier: number | null): string {
  return tier ? '$'.repeat(tier) : ''
}

/**
 * The wrapper in one line: the maker's leaf description with its origin, or the plain type.
 * The leaf description often already names the country, so it is not said twice.
 */
export function wrapperText(cigar: Pick<Cigar, 'wrapperLeaf' | 'wrapperType' | 'wrapperOrigin'>) {
  const leaf = cigar.wrapperLeaf ?? cigar.wrapperType
  if (cigar.wrapperLeaf && cigar.wrapperOrigin && cigar.wrapperLeaf.includes(cigar.wrapperOrigin)) {
    return cigar.wrapperLeaf
  }
  return [leaf, cigar.wrapperOrigin]
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(', ')
}
