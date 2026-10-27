import type { Cigar } from '../data/types'
import { fold } from './format'

/**
 * Where a leaf was grown, read out of the blend text the catalog already stores.
 * "Ecuadorian Connecticut" is Ecuador (the seed is Connecticut, the farm is not).
 * "Cuban-seed Nicaraguan" is Nicaragua. Connecticut or Pennsylvania with no other
 * country is the United States. A bare "Sumatra" is a leaf, not a country.
 */
const RULES: { country: string; pattern: RegExp }[] = [
  { country: 'Dominican Republic', pattern: /\bdominican(?:\s+republic)?\b/ },
  {
    country: 'United States',
    pattern: /\b(?:united states|usa)\b|\bu\.s\.a\.(?!\w)|\bu\.s\.(?!\w)/,
  },
  { country: 'Nicaragua', pattern: /\bnicaragua(?:n)?\b/ },
  { country: 'Honduras', pattern: /\bhonduras\b|\bhonduran\b/ },
  { country: 'Ecuador', pattern: /\becuador(?:ian)?\b/ },
  { country: 'Mexico', pattern: /\bmexico\b|\bmexican\b/ },
  { country: 'Brazil', pattern: /\bbrazil(?:ian)?\b/ },
  { country: 'Cameroon', pattern: /\bcameroon\b/ },
  { country: 'Cuba', pattern: /\bcuba(?:n)?\b/ },
  { country: 'Indonesia', pattern: /\bindonesia(?:n)?\b|\bjember\b/ },
  { country: 'Peru', pattern: /\bperu(?:vian)?\b/ },
  { country: 'Colombia', pattern: /\bcolombia(?:n)?\b/ },
]

const US_PLACE = /\b(?:connecticut|pennsylvania)\b/

export function countriesIn(value: string | null | undefined): string[] {
  if (!value) return []
  const seen: string[] = []
  for (const segment of segments(value)) {
    for (const country of countriesInSegment(segment)) {
      if (!seen.includes(country)) seen.push(country)
    }
  }
  return seen
}

function segments(value: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(') depth += 1
    else if (ch === ')') depth = Math.max(0, depth - 1)
    else if (depth === 0 && (ch === ',' || ch === '+' || ch === ';')) {
      parts.push(value.slice(start, i))
      start = i + 1
    } else if (depth === 0 && fold(value.slice(i, i + 4)) === ' or ') {
      parts.push(value.slice(start, i))
      start = i + 4
      i += 3
    }
  }
  parts.push(value.slice(start))
  return parts.map((part) => part.trim()).filter(Boolean)
}

function countriesInSegment(raw: string): string[] {
  const text = fold(raw)
    .replace(/cuban[-\s]+seed/g, ' ')
    .replace(/connecticut[-\s]+seed/g, ' ')
  const found: string[] = []
  for (const rule of RULES) {
    if (rule.pattern.test(text)) found.push(rule.country)
  }
  // A variety name, not a farm, once some other country is already in the phrase.
  if (found.length === 0 && US_PLACE.test(text)) found.push('United States')
  return found
}

function unique(countries: string[]): string[] {
  return [...new Set(countries)]
}

export function wrapperCountries(cigar: Pick<Cigar, 'wrapperOrigin' | 'wrapperLeaf'>): string[] {
  return unique([...countriesIn(cigar.wrapperOrigin), ...countriesIn(cigar.wrapperLeaf)])
}

export function binderCountries(cigar: Pick<Cigar, 'binder'>): string[] {
  return countriesIn(cigar.binder)
}

export function fillerCountries(cigar: Pick<Cigar, 'filler'>): string[] {
  return countriesIn(cigar.filler)
}

export type LeafPart = 'wrapper' | 'binder' | 'filler'

const compare = new Intl.Collator('en', { sensitivity: 'base' }).compare

/** Countries that show up on this part of the blend, most common first. */
export function countryOptions(
  cigars: Iterable<Pick<Cigar, 'wrapperOrigin' | 'wrapperLeaf' | 'binder' | 'filler'>>,
  part: LeafPart,
): { country: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const cigar of cigars) {
    const list =
      part === 'wrapper'
        ? wrapperCountries(cigar)
        : part === 'binder'
          ? binderCountries(cigar)
          : fillerCountries(cigar)
    for (const country of list) counts.set(country, (counts.get(country) ?? 0) + 1)
  }
  return [...counts]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || compare(a.country, b.country))
}
