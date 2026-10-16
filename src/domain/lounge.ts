import type { Cigar, KnownLevel, LoungeEntry } from '../data/types'
import { fold } from './format'
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
    price: null,
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
  /** Lounge price at or under this many dollars. */
  maxPrice: number | null
  known: KnownLevel | null
}

export const EMPTY_LOUNGE_FILTER: LoungeFilter = {
  query: '',
  group: null,
  wrapper: null,
  flavor: null,
  priceTier: null,
  maxPrice: null,
  known: null,
}

export function isFiltered(filter: LoungeFilter): boolean {
  return (
    filter.query.trim() !== '' ||
    filter.group !== null ||
    filter.wrapper !== null ||
    filter.flavor !== null ||
    filter.priceTier !== null ||
    filter.maxPrice !== null ||
    filter.known !== null
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
    if (filter.maxPrice !== null) {
      if (cigar.lounge.price === null || cigar.lounge.price > filter.maxPrice) return false
    }
    const flavors = cigarFlavors(cigar)
    if (filter.flavor !== null && !flavors.includes(filter.flavor)) return false
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
