import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import type { Cigar } from '../src/data/types'
import { filterCigars, statsByCigar, strengthCounts } from '../src/domain/cigars'
import { closestCigars } from '../src/domain/search'

const padron = newCigar({
  brand: 'Padron',
  line: '1964 Anniversary',
  strength: 4,
  wrapperType: 'Natural/Sun Grown',
})
const fuente = newCigar({
  brand: 'Arturo Fuente',
  line: 'Hemingway',
  strength: 3,
  wrapperType: 'Cameroon',
  source: 'seed',
})
const ashton = newCigar({
  brand: 'Ashton',
  line: 'Classic',
  strength: 2,
  wrapperType: 'Connecticut',
  source: 'seed',
})
const gone = newCigar({ brand: 'Zino', line: 'Gone', deletedAt: '2026-10-01T00:00:00.000Z' })
const all = [padron, fuente, ashton, gone]

const scored = (cigarId: string, rating: number, smokedAt: string) =>
  newSmoke(cigarId, {
    status: 'complete',
    smokedAt,
    ratings: { appearance: rating, smoking: rating, flavor: rating, overall: rating },
    score: 50 + 5 * rating,
  })

describe('cigar stats', () => {
  const smokes = [
    scored(padron.id, 8, '2026-10-01T00:00:00.000Z'),
    scored(padron.id, 9, '2026-10-05T00:00:00.000Z'),
    newSmoke(padron.id, { status: 'draft' }),
    { ...scored(fuente.id, 7, '2026-10-02T00:00:00.000Z'), deletedAt: '2026-10-03T00:00:00.000Z' },
  ]
  const stats = statsByCigar(smokes)

  it('counts completed smokes and averages their scores', () => {
    expect(stats.get(padron.id)).toEqual({
      count: 2,
      average: 93,
      lastSmokedAt: '2026-10-05T00:00:00.000Z',
    })
  })

  it('leaves out drafts and deleted smokes', () => {
    expect(stats.has(fuente.id)).toBe(false)
  })

  it('filters to cigars that have been smoked', () => {
    const smoked = filterCigars(
      all,
      { query: '', strength: null, wrapper: null, only: 'smoked' },
      stats,
    )
    expect(smoked.map((c) => c.brand)).toEqual(['Padron'])
  })
})

describe('cigar filter', () => {
  const none = new Map()
  const base = { query: '', strength: null, wrapper: null, only: 'all' as const }

  it('sorts by brand then line and hides deleted cigars', () => {
    expect(filterCigars(all, base, none).map((c) => c.brand)).toEqual([
      'Arturo Fuente',
      'Ashton',
      'Padron',
    ])
  })

  it('finds a cigar by any researched detail, with or without accents', () => {
    const [first] = all
    if (!first) throw new Error('no cigars')
    const researched = {
      ...first,
      id: 'researched',
      line: 'Dámaso',
      wrapperLeaf: 'Mexican San Andrés',
      binder: 'Nicaragua',
      factory: 'Tabacos Cubanica S.A.',
      flavors: ['hazelnut'],
      sizes: [{ name: 'Exclusivo', lengthIn: 5.5, ringGauge: 50 }],
      about: 'A box-pressed puro.',
    }
    const list = [...all, researched]
    for (const query of [
      'damaso',
      'san andres',
      'cubanica',
      'hazelnut',
      'exclusivo',
      'box-pressed',
    ]) {
      expect(filterCigars(list, { ...base, query }, none).map((c) => c.id)).toEqual(['researched'])
    }
  })

  it('matches every search word across brand, line, wrapper, and country', () => {
    expect(filterCigars(all, { ...base, query: 'fuente cameroon' }, none)).toHaveLength(1)
    expect(filterCigars(all, { ...base, query: 'fuente connecticut' }, none)).toHaveLength(0)
  })

  it('puts cigars with the words in their name ahead of ones that only mention them', () => {
    const mention = { ...ashton, id: 'mention', about: 'Often compared with the Hemingway.' }
    const found = filterCigars([mention, ...all], { ...base, query: 'hemingway' }, none)
    expect(found.map((c) => c.id)).toEqual([fuente.id, 'mention'])
  })

  it('filters by strength, wrapper, and cigars added by hand', () => {
    expect(filterCigars(all, { ...base, strength: 2 }, none).map((c) => c.brand)).toEqual([
      'Ashton',
    ])
    expect(filterCigars(all, { ...base, wrapper: 'Cameroon' }, none).map((c) => c.brand)).toEqual([
      'Arturo Fuente',
    ])
    expect(filterCigars(all, { ...base, only: 'mine' }, none).map((c) => c.brand)).toEqual([
      'Padron',
    ])
  })

  it('counts cigars at each strength', () => {
    expect(strengthCounts(all)).toEqual([0, 1, 1, 1, 0])
  })
})

describe('closest matches when nothing matches every word', () => {
  const make = (brand: string, line: string) => ({
    ...(all[0] as Cigar),
    id: `${brand}-${line}`,
    brand,
    line,
  })
  const list = [
    make('CAO', 'Flathead'),
    make('CAO', 'Brazilia'),
    make('Drew Estate', 'Liga Privada Único Serie Year of the Rat'),
    make('Drew Estate', 'Liga Privada No. 9'),
    make('Padron', '1964 Anniversary Series'),
  ]
  const names = (query: string) => closestCigars(list, query).map((c) => c.line)

  it('drops the word that is not in the name', () => {
    expect(names('cao flathead habano')).toEqual(['Flathead'])
  })

  it('forgives a misspelled word', () => {
    expect(names('liga pravada year of the rat')).toEqual([
      'Liga Privada Único Serie Year of the Rat',
    ])
  })

  it('shows nothing when only one word of several matches', () => {
    expect(names('cao zzzz qqqq')).toEqual([])
    expect(names('zzzz')).toEqual([])
  })
})
