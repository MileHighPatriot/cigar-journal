import { describe, expect, it } from 'vitest'
import { newCigar } from '../src/data/factories'
import type { Cigar, Level } from '../src/data/types'
import {
  answerCard,
  EMPTY_LOUNGE_FILTER,
  filterLounge,
  flavorOptions,
  groupByStrength,
  groupOf,
  loungeCigars,
  loungeTotals,
  newLoungeEntry,
  nextKnown,
  studyDeck,
} from '../src/domain/lounge'

function stocked(brand: string, line: string, fields: Partial<Cigar> = {}): Cigar {
  return newCigar({ brand, line, lounge: newLoungeEntry(), ...fields })
}

const padron = stocked('Padron', '1964 Anniversary', {
  strength: 4,
  wrapperType: 'Maduro/Broadleaf',
  flavors: ['cocoa', 'espresso', 'pepper'],
  priceTier: 3,
  lounge: newLoungeEntry({ price: 24, shelf: 'top shelf', known: 'known' }),
})
const macanudo = stocked('Macanudo', 'Cafe', {
  strength: 1,
  wrapperType: 'Connecticut',
  flavors: ['cream', 'cedar'],
  priceTier: 1,
  lounge: newLoungeEntry({ price: 9, known: 'learning' }),
})
const ashton = stocked('Ashton', 'Classic', {
  strength: 2,
  wrapperType: 'Connecticut',
  sheetFlavors: ['Creamy', 'nuts'],
  priceTier: 2,
})
const oliva = stocked('Oliva', 'Serie V', { strength: 3, wrapperType: 'Habano' })
const mystery = stocked('Zino', 'Nicaragua', { strength: null })
const notStocked = newCigar({ brand: 'Arturo Fuente', line: 'Hemingway', strength: 3 })
const deleted = stocked('Gone', 'Gone', { deletedAt: '2026-01-01T00:00:00.000Z' })

const all = loungeCigars([padron, macanudo, ashton, oliva, mystery, notStocked, deleted])

describe('lounge list', () => {
  it('keeps only live cigars with a lounge entry', () => {
    expect(all.map((cigar) => cigar.brand)).toEqual([
      'Padron',
      'Macanudo',
      'Ashton',
      'Oliva',
      'Zino',
    ])
  })

  it('splits by strength into mild, medium, full, and unknown, not by maker', () => {
    const levels: [Level | null, string][] = [
      [1, 'mild'],
      [2, 'mild'],
      [3, 'medium'],
      [4, 'full'],
      [5, 'full'],
      [null, 'unknown'],
    ]
    for (const [level, group] of levels) expect(groupOf(level)).toBe(group)

    const groups = groupByStrength(all)
    expect(groups.map((entry) => entry.group.label)).toEqual([
      'Mild',
      'Medium',
      'Full',
      'No strength on file',
    ])
    // A to Z by brand inside a group, so a mild Ashton comes before a mild Macanudo.
    expect(groups[0]?.cigars.map((cigar) => cigar.brand)).toEqual(['Ashton', 'Macanudo'])
  })

  it('leaves out empty groups', () => {
    expect(groupByStrength(loungeCigars([padron])).map((entry) => entry.group.key)).toEqual([
      'full',
    ])
  })

  it('counts how many he knows', () => {
    expect(loungeTotals(all)).toEqual({ total: 5, known: 1, learning: 1, fresh: 3 })
  })
})

describe('help me pick', () => {
  const pick = (filter: Partial<typeof EMPTY_LOUNGE_FILTER>) =>
    filterLounge(all, { ...EMPTY_LOUNGE_FILTER, ...filter }).map((cigar) => cigar.brand)

  it('narrows by strength group, wrapper, flavor, and price tier', () => {
    expect(pick({ group: 'mild' })).toEqual(['Macanudo', 'Ashton'])
    expect(pick({ wrapper: 'Connecticut', flavor: 'cedar' })).toEqual(['Macanudo'])
    expect(pick({ priceTier: 3 })).toEqual(['Padron'])
  })

  it('reads the lounge sheet flavors, in the app spelling, when there are no published notes', () => {
    // The sheet says "Creamy"; the app's word is "cream", so both sticks answer to it.
    expect(pick({ flavor: 'cream' })).toEqual(['Macanudo', 'Ashton'])
  })

  it('narrows by lounge price and what he knows', () => {
    expect(pick({ maxPrice: 10 })).toEqual(['Macanudo'])
    // A stick with no price noted cannot be promised under a price.
    expect(pick({ maxPrice: 100 })).toEqual(['Padron', 'Macanudo'])
    expect(pick({ known: 'new' })).toEqual(['Ashton', 'Oliva', 'Zino'])
  })

  it('searches names, blend, strength words, flavors, and the shelf note', () => {
    expect(pick({ query: 'padron maduro' })).toEqual(['Padron'])
    expect(pick({ query: 'top shelf' })).toEqual(['Padron'])
    // "Medium" is also in Mild-Medium and Medium-Full, so three answer to it.
    expect(pick({ query: 'medium' })).toEqual(['Padron', 'Ashton', 'Oliva'])
    expect(pick({ query: 'full' })).toEqual(['Padron'])
    expect(pick({ query: 'nothing here' })).toEqual([])
  })

  it('lists the flavors across the lounge, most common first', () => {
    expect(flavorOptions(all).slice(0, 2)).toEqual([
      { flavor: 'cream', count: 2 },
      { flavor: 'cedar', count: 1 },
    ])
  })
})

describe('flashcards', () => {
  it('deals the ones he knows least first, then the ones studied longest ago', () => {
    const studied = stocked('Ashton', 'Classic', {
      lounge: newLoungeEntry({ studiedAt: '2026-10-14T00:00:00.000Z' }),
    })
    const deck = studyDeck(loungeCigars([padron, macanudo, studied, oliva]))
    expect(deck.map((cigar) => cigar.brand)).toEqual(['Oliva', 'Ashton', 'Macanudo', 'Padron'])
  })

  it('moves up on a right answer and a known one back on a wrong answer', () => {
    const now = new Date('2026-10-15T20:00:00.000Z')
    const entry = newLoungeEntry()
    const once = answerCard(entry, true, now)
    expect(once.known).toBe('learning')
    expect(once.studiedAt).toBe(now.toISOString())
    expect(answerCard(once, true, now).known).toBe('known')
    expect(answerCard({ ...entry, known: 'known' }, false, now).known).toBe('learning')
    expect(answerCard({ ...entry, known: 'learning' }, false, now).known).toBe('learning')
    expect(answerCard(entry, false, now).known).toBe('new')
  })

  it('cycles the row chip New, Learning, Know it, New', () => {
    expect(nextKnown('new')).toBe('learning')
    expect(nextKnown('learning')).toBe('known')
    expect(nextKnown('known')).toBe('new')
  })
})
