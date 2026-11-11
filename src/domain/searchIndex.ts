import type { Cigar } from '../data/types'
import { fold } from './format'
import { LEVEL_LABELS } from './scoring'

// Search text is worked out once per cigar record and kept in memory only, keyed by the
// record object itself. An edited cigar is a new object, so it gets fresh text. Nothing
// here is saved, and no record is changed.

const names = new WeakMap<Cigar, string>()
const tokens = new WeakMap<Cigar, string[]>()
const details = new WeakMap<Cigar, string>()
const sortKeys = new WeakMap<Cigar, string>()

/** Brand, line, and size name, folded for matching. */
export function nameText(cigar: Cigar): string {
  let text = names.get(cigar)
  if (text === undefined) {
    text = fold(`${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`)
    names.set(cigar, text)
  }
  return text
}

/** The words of the name, for forgiving matches. */
export function nameTokens(cigar: Cigar): string[] {
  let list = tokens.get(cigar)
  if (list === undefined) {
    list = nameText(cigar)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
    tokens.set(cigar, list)
  }
  return list
}

/** Everything the Cigars tab searches: name, blend, factory, notes, flavors, sizes. */
export function detailText(cigar: Cigar): string {
  let text = details.get(cigar)
  if (text === undefined) {
    text = fold(
      [
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
        .join(' '),
    )
    details.set(cigar, text)
  }
  return text
}

const collator = new Intl.Collator('en', { sensitivity: 'base' })
const numericCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

/** Brand then line, ignoring case and accents. */
export function byBrandLine(a: Cigar, b: Cigar): number {
  let ka = sortKeys.get(a)
  if (ka === undefined) {
    ka = `${a.brand} ${a.line}`
    sortKeys.set(a, ka)
  }
  let kb = sortKeys.get(b)
  if (kb === undefined) {
    kb = `${b.brand} ${b.line}`
    sortKeys.set(b, kb)
  }
  return collator.compare(ka, kb)
}

export const compareNames = numericCollator.compare
