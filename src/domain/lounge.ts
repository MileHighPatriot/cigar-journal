import type { Cigar, KnownLevel, LoungeEntry } from '../data/types'
import { fold } from './format'
import { binderCountries, fillerCountries, wrapperCountries } from './origins'
import { LEVEL_LABELS } from './scoring'
import { normalizeTag } from './tags'

/** The lounge list is split by strength, not by maker: three groups plus one for unknowns. */
export type GroupKey = 'mild' | 'medium' | 'full' | 'unknown'

export interface StrengthGroup {
  key: GroupKey
  label: string
  /** The 1 to 5 levels that land here. Empty for unknown. */
  levels: number[]
}

export const STRENGTH_GROUPS: StrengthGroup[] = [
  { key: 'mild', label: 'Mild', levels: [1, 2] },
  { key: 'medium', label: 'Medium', levels: [3] },
  { key: 'full', label: 'Full', levels: [4, 5] },
  { key: 'unknown', label: 'No strength on file', levels: [] },
]

export function groupOf(strength: number | null): GroupKey {
  if (strength === null) return 'unknown'
  return STRENGTH_GROUPS.find((group) => group.levels.includes(strength))?.key ?? 'unknown'
}

export const KNOWN_LABELS: Record<KnownLevel, string> = {
  new: 'New',
  learning: 'Learning',
  known: 'Know it',
}

const KNOWN_ORDER: KnownLevel[] = ['new', 'learning', 'known']

/** One tap on the row moves to the next level and wraps around. */
export function nextKnown(level: KnownLevel): KnownLevel {
  const index = KNOWN_ORDER.indexOf(level)
  return KNOWN_ORDER[(index + 1) % KNOWN_ORDER.length] ?? 'new'
}

export function newLoungeEntry(fields: Partial<LoungeEntry> = {}, now = new Date()): LoungeEntry {
  return {
    addedAt: now.toISOString(),
    shelf: '',
    note: '',
    known: 'new',
    studiedAt: null,
    ...fields,
  }
}

/** A cigar with its lounge entry present, so callers need no null checks. */
export type LoungeCigar = Cigar & { lounge: LoungeEntry }

export function loungeCigars(cigars: Iterable<Cigar>): LoungeCigar[] {
  const out: LoungeCigar[] = []
  for (const cigar of cigars) {
    if (!cigar.deletedAt && cigar.lounge) out.push(cigar as LoungeCigar)
  }
  return out
}

const compare = new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare

export function sortByName<T extends Cigar>(cigars: T[]): T[] {
  return [...cigars].sort((a, b) => compare(a.brand, b.brand) || compare(a.line, b.line))
}

export interface GroupedLounge {
  group: StrengthGroup
  cigars: LoungeCigar[]
}

/** Every group in order, Mild to Full then unknown, each sorted by brand and line. Empty groups are left out. */
export function groupByStrength(cigars: LoungeCigar[]): GroupedLounge[] {
  const sorted = sortByName(cigars)
  return STRENGTH_GROUPS.map((group) => ({
    group,
    cigars: sorted.filter((cigar) => groupOf(cigar.strength) === group.key),
  })).filter((entry) => entry.cigars.length > 0)
}

export interface LoungeFilter {
  query: string
  group: GroupKey | null
  wrapper: string | null
  flavor: string | null
  priceTier: number | null
  known: KnownLevel | null
  /** Country the wrapper was grown in. */
  wrapperCountry: string | null
  /** Country the binder was grown in. A blend matches when any of its countries is this one. */
  binderCountry: string | null
  /** Country the filler was grown in. A blend matches when any of its countries is this one. */
  fillerCountry: string | null
}

export const EMPTY_LOUNGE_FILTER: LoungeFilter = {
  query: '',
  group: null,
  wrapper: null,
  flavor: null,
  priceTier: null,
  known: null,
  wrapperCountry: null,
  binderCountry: null,
  fillerCountry: null,
}

export function isFiltered(filter: LoungeFilter): boolean {
  return (
    filter.query.trim() !== '' ||
    filter.group !== null ||
    filter.wrapper !== null ||
    filter.flavor !== null ||
    filter.priceTier !== null ||
    filter.known !== null ||
    filter.wrapperCountry !== null ||
    filter.binderCountry !== null ||
    filter.fillerCountry !== null
  )
}

/** The published notes, else the lounge sheet's, in the app's own spellings. */
export function cigarFlavors(cigar: Cigar): string[] {
  const source = cigar.flavors.length > 0 ? cigar.flavors : cigar.sheetFlavors
  return [...new Set(source.map(normalizeTag))]
}

/** "Help me pick": the lounge sticks that fit what a guest asked for. */
export function filterLounge(cigars: LoungeCigar[], filter: LoungeFilter): LoungeCigar[] {
  const words = fold(filter.query).split(/\s+/).filter(Boolean)
  return cigars.filter((cigar) => {
    if (filter.group !== null && groupOf(cigar.strength) !== filter.group) return false
    if (filter.wrapper !== null && cigar.wrapperType !== filter.wrapper) return false
    if (filter.priceTier !== null && cigar.priceTier !== filter.priceTier) return false
    if (filter.known !== null && cigar.lounge.known !== filter.known) return false
    const flavors = cigarFlavors(cigar)
    if (filter.flavor !== null && !flavors.includes(filter.flavor)) return false
    const wrapCountries = wrapperCountries(cigar)
    const bindCountries = binderCountries(cigar)
    const fillCountries = fillerCountries(cigar)
    if (filter.wrapperCountry !== null && !wrapCountries.includes(filter.wrapperCountry)) {
      return false
    }
    if (filter.binderCountry !== null && !bindCountries.includes(filter.binderCountry)) {
      return false
    }
    if (filter.fillerCountry !== null && !fillCountries.includes(filter.fillerCountry)) {
      return false
    }
    if (words.length > 0) {
      const haystack = fold(
        [
          cigar.brand,
          cigar.line,
          cigar.wrapperType,
          cigar.wrapperLeaf,
          cigar.wrapperOrigin,
          cigar.binder,
          cigar.filler,
          cigar.country,
          ...wrapCountries,
          ...bindCountries,
          ...fillCountries,
          cigar.factory,
          cigar.about,
          cigar.strength ? LEVEL_LABELS[cigar.strength - 1] : null,
          cigar.lounge.shelf,
          cigar.lounge.note,
          ...flavors,
        ]
          .filter(Boolean)
          .join(' '),
      )
      if (!words.every((word) => haystack.includes(word))) return false
    }
    return true
  })
}

/** Flavors that appear across the lounge, most common first, for the finder's list. */
export function flavorOptions(cigars: LoungeCigar[]): { flavor: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const cigar of cigars) {
    for (const flavor of cigarFlavors(cigar)) counts.set(flavor, (counts.get(flavor) ?? 0) + 1)
  }
  return [...counts]
    .map(([flavor, count]) => ({ flavor, count }))
    .sort((a, b) => b.count - a.count || compare(a.flavor, b.flavor))
}

export function wrapperOptionsOf(cigars: LoungeCigar[]): string[] {
  const set = new Set<string>()
  for (const cigar of cigars) if (cigar.wrapperType) set.add(cigar.wrapperType)
  return [...set].sort(compare)
}

/** The lounge sheet's cigars that are not on the lounge list yet, for the one-tap add. */
export function sheetNotListed(cigars: Iterable<Cigar>, sheetIds: Iterable<string>): Cigar[] {
  const wanted = new Set(sheetIds)
  const out: Cigar[] = []
  for (const cigar of cigars) {
    if (wanted.has(cigar.id) && !cigar.deletedAt && !cigar.lounge) out.push(cigar)
  }
  return sortByName(out)
}

/** The sheet's "If they like this, suggest" names, one per entry. */
export function similarNames(cigar: Cigar): string[] {
  return (cigar.similarCigars ?? '')
    .split(/[;,]/)
    .map((name) => name.trim())
    .filter(Boolean)
}

const squash = (text: string) => fold(text).replace(/[^a-z0-9]/g, '')

/**
 * Finds the catalog cigar a sheet name points at. The sheet writes "Ashton VSG" for the
 * line "Virgin Sun Grown (VSG)" and "Padron 3000" for "Series 3000", so after an exact
 * match it accepts the brand plus a word of the line, shortest line first.
 */
export function cigarNamed<T extends Cigar>(name: string, cigars: T[]): T | undefined {
  const wanted = squash(name)
  if (!wanted) return undefined
  let loose: T | undefined
  for (const cigar of cigars) {
    const brand = squash(cigar.brand)
    const line = squash(cigar.line)
    if (wanted === brand + line) return cigar
    if (!brand || !wanted.startsWith(brand)) continue
    const rest = wanted.slice(brand.length)
    if (!rest || !line) continue
    if (line.includes(rest) || rest.includes(line)) {
      if (!loose || cigar.line.length < loose.line.length) loose = cigar
    }
  }
  return loose
}

export interface SimilarInLounge {
  /** The sheet's suggestions that are on the lounge list. */
  named: LoungeCigar[]
  /** The sheet's suggestions the lounge does not carry, by name. */
  notStocked: string[]
  /** Other lounge sticks in the same strength group, nearest in wrapper and flavors first. */
  close: LoungeCigar[]
}

/**
 * What to offer when a guest has already tried this one: the sheet's own suggestions when
 * the lounge has them, then the nearest lounge sticks of the same strength.
 */
export function similarInLounge(cigar: Cigar, stocked: LoungeCigar[], limit = 5): SimilarInLounge {
  const others = stocked.filter((other) => other.id !== cigar.id)
  const named: LoungeCigar[] = []
  const notStocked: string[] = []
  for (const name of similarNames(cigar)) {
    const found = cigarNamed(name, others)
    if (found) {
      if (!named.includes(found)) named.push(found)
    } else notStocked.push(name)
  }
  const group = groupOf(cigar.strength)
  const flavors = new Set(cigarFlavors(cigar))
  const scored = others
    .filter((other) => !named.includes(other) && groupOf(other.strength) === group)
    .map((other) => {
      let score = 0
      if (cigar.wrapperType && other.wrapperType === cigar.wrapperType) score += 3
      if (cigar.strength !== null && other.strength === cigar.strength) score += 2
      if (cigar.country && other.country === cigar.country) score += 1
      if (cigar.priceTier && other.priceTier === cigar.priceTier) score += 1
      for (const flavor of cigarFlavors(other)) if (flavors.has(flavor)) score += 1
      return { other, score }
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        compare(a.other.brand, b.other.brand) ||
        compare(a.other.line, b.other.line),
    )
  return { named, notStocked, close: scored.slice(0, limit).map((entry) => entry.other) }
}

export interface LoungeTotals {
  total: number
  known: number
  learning: number
  fresh: number
}

export function loungeTotals(cigars: LoungeCigar[]): LoungeTotals {
  const totals: LoungeTotals = { total: cigars.length, known: 0, learning: 0, fresh: 0 }
  for (const cigar of cigars) {
    if (cigar.lounge.known === 'known') totals.known += 1
    else if (cigar.lounge.known === 'learning') totals.learning += 1
    else totals.fresh += 1
  }
  return totals
}

/** Flashcards: the ones he knows least come first, and within a level the one studied longest ago. */
export function studyDeck(cigars: LoungeCigar[]): LoungeCigar[] {
  return [...cigars].sort(
    (a, b) =>
      KNOWN_ORDER.indexOf(a.lounge.known) - KNOWN_ORDER.indexOf(b.lounge.known) ||
      (a.lounge.studiedAt ?? '').localeCompare(b.lounge.studiedAt ?? '') ||
      compare(a.brand, b.brand) ||
      compare(a.line, b.line),
  )
}

/** Right moves a stick up one level; wrong drops a known one back to learning. */
export function answerCard(entry: LoungeEntry, right: boolean, now = new Date()): LoungeEntry {
  let known = entry.known
  if (right) known = entry.known === 'new' ? 'learning' : 'known'
  else if (entry.known === 'known') known = 'learning'
  return { ...entry, known, studiedAt: now.toISOString() }
}
