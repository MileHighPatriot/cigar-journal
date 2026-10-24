import type { Cigar, Smoke, ThirdKey } from '../data/types'
import { cigarFlavorTags, effectiveTags } from './tags'

const ORDER = ['first', 'second', 'final'] as const

const CARD_LABEL: Record<ThirdKey, string> = {
  first: 'First',
  second: 'Second',
  final: 'Final',
}

/** The four off notes offered on each third, in the app's own spelling. */
export const OFF_THIRD_NOTES = ['harsh', 'bitter', 'tar', 'sour'] as const

function unique(tags: string[]): string[] {
  return [...new Set(tags)]
}

export function previousThird(third: ThirdKey): ThirdKey | null {
  if (third === 'second') return 'first'
  if (third === 'final') return 'second'
  return null
}

/**
 * What to save the first time a later third is opened.
 * Copies taste notes once. Returns null when this third should be left alone,
 * including when the earlier third has no notes yet.
 */
export function carryTags(
  third: ThirdKey,
  smoke: Smoke,
): { tags?: string[]; tagsSeeded: true } | null {
  const prev = previousThird(third)
  if (!prev) return null
  const current = smoke.thirds[third]
  if (current.tagsSeeded) return null
  if (current.tags.length > 0) return { tagsSeeded: true }
  const earlier = smoke.thirds[prev].tags
  if (earlier.length === 0) return null
  return { tags: [...earlier], tagsSeeded: true }
}

/** Notes tasted on the thirds, or the old overall list when no third has notes. */
export function tastedNotes(smoke: Smoke): string[] {
  const fromThirds = unique(ORDER.flatMap((key) => smoke.thirds[key].tags))
  if (fromThirds.length > 0) return fromThirds
  return [...smoke.quickTags]
}

export interface HitAndMiss {
  /** Published notes that were tapped. */
  hit: string[]
  /** Published notes that were never tapped. */
  missed: string[]
  /** Tapped notes that are not on the published list. */
  added: string[]
}

export function hitAndMiss(
  smoke: Smoke,
  cigar: Pick<Cigar, 'flavors' | 'sheetFlavors'> | undefined,
): HitAndMiss {
  const tasted = tastedNotes(smoke)
  const tastedSet = new Set(tasted)
  const expected = cigarFlavorTags(cigar)
  const expectedSet = new Set(expected)
  return {
    hit: expected.filter((note) => tastedSet.has(note)),
    missed: expected.filter((note) => !tastedSet.has(note)),
    added: tasted.filter((note) => !expectedSet.has(note)),
  }
}

/** The latest finished smoke of this cigar from before this one. */
export function earlierSmoke(smoke: Smoke, smokes: Iterable<Smoke>): Smoke | null {
  let best: Smoke | null = null
  for (const other of smokes) {
    if (other.id === smoke.id || other.deletedAt) continue
    if (other.cigarId !== smoke.cigarId || other.status !== 'complete') continue
    if (other.smokedAt >= smoke.smokedAt) continue
    if (!best || other.smokedAt > best.smokedAt) best = other
  }
  return best
}

export interface NoteDelta {
  arrived: string[]
  dropped: string[]
}

export function noteDelta(current: Smoke, previous: Smoke): NoteDelta {
  const now = tastedNotes(current)
  const then = new Set(tastedNotes(previous))
  const nowSet = new Set(now)
  return {
    arrived: now.filter((note) => !then.has(note)),
    dropped: [...then].filter((note) => !nowSet.has(note)),
  }
}

export type CardFlavors = { mode: 'thirds'; text: string } | { mode: 'tags'; tags: string[] }

/** Thirds on the journal card, or the old three flavor tags when no third has notes. */
export function cardFlavors(smoke: Smoke): CardFlavors {
  const parts = ORDER.flatMap((key) => {
    const tags = smoke.thirds[key].tags
    return tags.length > 0 ? [`${CARD_LABEL[key]} ${tags.join(', ')}`] : []
  })
  if (parts.length > 0) return { mode: 'thirds', text: parts.join(' · ') }
  return { mode: 'tags', tags: effectiveTags(smoke).slice(0, 3) }
}
