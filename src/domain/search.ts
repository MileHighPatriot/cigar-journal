import type { Cigar, Smoke } from '../data/types'
import { fold } from './format'
import { effectiveTags } from './tags'

export interface SmokeRow {
  smoke: Smoke
  cigar: Cigar | undefined
  /** One lowercase blob per smoke: brand, line, size, every note and flavor, pairing. */
  haystack: string
}

const THIRD_KEYS = ['first', 'second', 'final'] as const

export function buildRows(smokes: Iterable<Smoke>, cigars: Map<string, Cigar>): SmokeRow[] {
  const rows: SmokeRow[] = []
  for (const smoke of smokes) {
    if (smoke.deletedAt) continue
    const cigar = cigars.get(smoke.cigarId)
    const parts = [
      cigar?.brand,
      cigar?.line,
      cigar?.vitola,
      smoke.vitola,
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
      ...smoke.prelight.aromaTags,
      ...smoke.prelight.coldDrawTags,
      smoke.prelight.wrapperNotes,
      smoke.prelight.footAroma,
      smoke.prelight.coldDraw,
      smoke.prelight.note,
      ...THIRD_KEYS.flatMap((key) => [
        smoke.thirds[key].retrohale,
        ...smoke.thirds[key].retrohaleTags,
        ...smoke.thirds[key].offTags,
      ]),
      smoke.constructionNote,
      smoke.pairingNote,
      smoke.scoreNote,
    ]
    rows.push({ smoke, cigar, haystack: fold(parts.filter(Boolean).join(' ')) })
  }
  rows.sort((a, b) => (a.smoke.smokedAt < b.smoke.smokedAt ? 1 : -1))
  return rows
}

/** Every word in the query must appear somewhere in the row. */
export function searchRows(rows: SmokeRow[], query: string): SmokeRow[] {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return rows
  return rows.filter((row) => words.every((word) => row.haystack.includes(word)))
}

export function searchCigars(cigars: Iterable<Cigar>, query: string): Cigar[] {
  const words = fold(query).split(/\s+/).filter(Boolean)
  const out: Cigar[] = []
  for (const cigar of cigars) {
    if (cigar.deletedAt) continue
    const haystack = fold(`${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`)
    if (words.every((word) => haystack.includes(word))) out.push(cigar)
  }
  return out.sort((a, b) =>
    `${a.brand} ${a.line}`.localeCompare(`${b.brand} ${b.line}`, 'en', { sensitivity: 'base' }),
  )
}

const FILLER = new Set(['the', 'and', 'of', 'de', 'la', 'el', 'by', 'y'])

/** How many letters would have to change to turn one word into the other. */
function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) {
      const swap = (row[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      next.push(Math.min(swap, (row[j] ?? 0) + 1, (next[j - 1] ?? 0) + 1))
    }
    row = next
  }
  return row[b.length] ?? 0
}

/** True when the typed word is in the name, or is one slip away from a word in it. */
function near(word: string, haystack: string, tokens: string[]): boolean {
  if (haystack.includes(word)) return true
  if (word.length < 5) return false
  const slips = word.length >= 8 ? 2 : 1
  return tokens.some(
    (token) => Math.abs(token.length - word.length) <= slips && distance(word, token) <= slips,
  )
}

/**
 * For a search that found nothing: the cigars that match the most of what was typed, allowing
 * for a misspelling ("pravada") or an extra word ("flathead habano"). Brand then line order.
 */
export function closestCigars(cigars: Iterable<Cigar>, query: string, limit = 24): Cigar[] {
  const words = fold(query)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !FILLER.has(word))
  if (words.length === 0) return []
  let best = 0
  let out: Cigar[] = []
  for (const cigar of cigars) {
    if (cigar.deletedAt) continue
    const haystack = fold(`${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`)
    const tokens = haystack.split(/[^a-z0-9]+/).filter(Boolean)
    const hits = words.filter((word) => near(word, haystack, tokens)).length
    if (hits === 0 || hits < best) continue
    if (hits > best) {
      best = hits
      out = []
    }
    out.push(cigar)
  }
  // One matching word out of several is too loose to be worth showing.
  if (best < Math.min(2, words.length)) return []
  return out
    .sort((a, b) =>
      `${a.brand} ${a.line}`.localeCompare(`${b.brand} ${b.line}`, 'en', { sensitivity: 'base' }),
    )
    .slice(0, limit)
}
