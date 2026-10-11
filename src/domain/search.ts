import type { Cigar, Smoke } from '../data/types'
import { effectiveTags } from './tags'

export interface SmokeRow {
  smoke: Smoke
  cigar: Cigar | undefined
  /** One lowercase blob per smoke: brand, line, size, notes, tags, pairing. */
  haystack: string
}

export function buildRows(smokes: Iterable<Smoke>, cigars: Map<string, Cigar>): SmokeRow[] {
  const rows: SmokeRow[] = []
  for (const smoke of smokes) {
    if (smoke.deletedAt) continue
    const cigar = cigars.get(smoke.cigarId)
    const parts = [
      cigar?.brand,
      cigar?.line,
      cigar?.vitola,
      cigar?.wrapperType,
      cigar?.country,
      smoke.summary,
      smoke.pairingType,
      smoke.pairingName,
      smoke.company,
      smoke.thirds.first.note,
      smoke.thirds.second.note,
      smoke.thirds.final.note,
      ...effectiveTags(smoke),
    ]
    rows.push({ smoke, cigar, haystack: parts.filter(Boolean).join(' ').toLowerCase() })
  }
  rows.sort((a, b) => (a.smoke.smokedAt < b.smoke.smokedAt ? 1 : -1))
  return rows
}

/** Every word in the query must appear somewhere in the row. */
export function searchRows(rows: SmokeRow[], query: string): SmokeRow[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return rows
  return rows.filter((row) => words.every((word) => row.haystack.includes(word)))
}

export function searchCigars(cigars: Iterable<Cigar>, query: string): Cigar[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const out: Cigar[] = []
  for (const cigar of cigars) {
    if (cigar.deletedAt) continue
    const haystack = `${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`.toLowerCase()
    if (words.every((word) => haystack.includes(word))) out.push(cigar)
  }
  return out.sort((a, b) =>
    `${a.brand} ${a.line}`.localeCompare(`${b.brand} ${b.line}`, 'en', { sensitivity: 'base' }),
  )
}
