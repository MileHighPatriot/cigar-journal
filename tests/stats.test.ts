import { describe, expect, it } from 'vitest'
import { newCigar, newLot, newSmoke } from '../src/data/factories'
import type { Smoke } from '../src/data/types'
import {
  averageBy,
  completedRows,
  effectiveStrength,
  niceMax,
  scoreBins,
  scoredRows,
  spendByMonth,
  topTags,
  totalMinutes,
} from '../src/domain/stats'

const habano = newCigar({
  brand: 'Padron',
  line: '1964',
  wrapperType: 'Habano',
  country: 'Nicaragua',
  strength: 4,
})
const shade = newCigar({
  brand: 'Ashton',
  line: 'Classic',
  wrapperType: 'Connecticut',
  country: 'Dominican Republic',
  strength: 2,
})
const cigars = new Map([
  [habano.id, habano],
  [shade.id, shade],
])

const smoke = (cigarId: string, rating: number, fields: Partial<Smoke> = {}) =>
  newSmoke(cigarId, {
    status: 'complete',
    ratings: { appearance: rating, smoking: rating, flavor: rating, overall: rating },
    score: 50 + 5 * rating,
    ...fields,
  })

describe('score distribution', () => {
  it('puts scores in two-point bins with open ends', () => {
    const bins = scoreBins([72, 79, 80, 81, 88, 89, 90, 95, 96, 100])
    const count = (label: string) => bins.find((bin) => bin.label === label)?.count
    expect(bins).toHaveLength(10)
    expect(count('<80')).toBe(2)
    expect(count('80')).toBe(2)
    expect(count('88')).toBe(2)
    expect(count('90')).toBe(1)
    expect(count('94')).toBe(1)
    expect(count('96+')).toBe(2)
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(10)
  })
})

describe('average score by group', () => {
  const rows = scoredRows(
    completedRows(
      [
        smoke(habano.id, 8),
        smoke(habano.id, 9),
        smoke(shade.id, 7),
        newSmoke(habano.id, { status: 'draft' }),
        { ...smoke(shade.id, 10), deletedAt: '2026-10-01T00:00:00.000Z' },
      ],
      cigars,
    ),
  )

  it('leaves out drafts and deleted smokes', () => {
    expect(rows).toHaveLength(3)
  })

  it('only keeps groups with 2 or more smokes', () => {
    expect(averageBy(rows, 'wrapper')).toEqual([{ label: 'Habano', average: 92.5, count: 2 }])
    expect(averageBy(rows, 'brand')).toEqual([{ label: 'Padron', average: 92.5, count: 2 }])
    expect(averageBy(rows, 'country')).toEqual([{ label: 'Nicaragua', average: 92.5, count: 2 }])
    expect(averageBy(rows, 'strength')).toEqual([{ label: 'Medium-Full', average: 92.5, count: 2 }])
  })
})

describe('effective strength', () => {
  it("prefers the smoke's own, then the thirds, then the cigar's", () => {
    expect(effectiveStrength(newSmoke(habano.id, { strength: 5 }), habano)).toBe(5)
    const byThirds = newSmoke(habano.id)
    byThirds.thirds.first.strength = 2
    byThirds.thirds.final.strength = 3
    expect(effectiveStrength(byThirds, habano)).toBe(3)
    expect(effectiveStrength(newSmoke(habano.id), habano)).toBe(4)
    expect(effectiveStrength(newSmoke('x'), undefined)).toBeNull()
  })
})

describe('flavors, time, and spend', () => {
  it('ranks the most common flavor tags', () => {
    const a = smoke(habano.id, 8, { quickTags: ['cedar', 'cocoa'] })
    const b = smoke(habano.id, 8, { quickTags: ['cedar'] })
    b.thirds.final.tags = ['cedar', 'espresso']
    expect(topTags([a, b])).toEqual([
      { tag: 'cedar', count: 2 },
      { tag: 'cocoa', count: 1 },
      { tag: 'espresso', count: 1 },
    ])
  })

  it('adds up smoke time', () => {
    expect(
      totalMinutes([
        smoke(habano.id, 8, { durationMin: 70 }),
        smoke(habano.id, 8, { durationMin: 45 }),
        smoke(habano.id, 8),
      ]),
    ).toBe(115)
  })

  it('counts lot purchases and singles paid for, by month', () => {
    const lots = [
      newLot(habano.id, { quantityPurchased: 5, priceEach: 12, purchaseDate: '2026-10-03' }),
      newLot(habano.id, { quantityPurchased: 2, priceEach: 20, purchaseDate: '2026-09-20' }),
      newLot(habano.id, {
        quantityPurchased: 9,
        priceEach: 9,
        purchaseDate: '2026-10-05',
        deletedAt: '2026-10-06T00:00:00.000Z',
      }),
      newLot(habano.id, { quantityPurchased: 3, priceEach: null, purchaseDate: '2026-10-05' }),
    ]
    const smokes = [
      smoke(shade.id, 8, { pricePaid: 14, smokedAt: '2026-10-08T20:00:00.000Z' }),
      // From the humidor: already counted when the lot was bought.
      smoke(habano.id, 8, { pricePaid: 12, lotId: 'a-lot', smokedAt: '2026-10-09T20:00:00.000Z' }),
    ]
    const months = spendByMonth(smokes, lots, 3, new Date(2026, 9, 15))
    expect(months).toEqual([
      { month: '2026-08', label: 'Aug', total: 0 },
      { month: '2026-09', label: 'Sep', total: 40 },
      { month: '2026-10', label: 'Oct', total: 74 },
    ])
  })

  it('rounds a chart scale up to a clean number', () => {
    expect(niceMax(3)).toBe(4)
    expect(niceMax(7)).toBe(10)
    expect(niceMax(74)).toBe(100)
    expect(niceMax(130)).toBe(200)
    expect(niceMax(240)).toBe(250)
  })
})
