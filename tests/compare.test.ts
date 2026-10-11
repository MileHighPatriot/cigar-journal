import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import type { Smoke } from '../src/data/types'
import { bestIndex, cigarColumn, mostCommon, smokeColumn } from '../src/domain/compare'

const cigar = newCigar({
  brand: 'Padron',
  line: '1964 Anniversary',
  wrapperType: 'Natural/Sun Grown',
  strength: 4,
})

function smoke(rating: number, fields: Partial<Smoke> = {}): Smoke {
  return newSmoke(cigar.id, {
    status: 'complete',
    ratings: { appearance: rating, smoking: rating, flavor: rating, overall: rating },
    score: 50 + 5 * rating,
    ...fields,
  })
}

describe('a smoke as a compare column', () => {
  const full = smoke(8, {
    vitola: 'Toro',
    lengthIn: 6,
    ringGauge: 52,
    durationMin: 74,
    draw: 'ideal',
    burn: 'wavy',
    ashFirmness: 'firm',
    ashColor: 'light',
    relights: 1,
    body: 3,
    pairingType: 'bourbon',
    pairingName: 'Eagle Rare',
    pricePaid: 18,
    quickTags: ['cedar'],
  })
  full.thirds.first = { ...full.thirds.first, tags: ['cocoa'], strength: 3, issues: ['tight draw'] }
  full.thirds.final = {
    ...full.thirds.final,
    tags: ['espresso'],
    strength: 5,
    issues: ['relight', 'tight draw'],
  }
  const column = smokeColumn(full, cigar)

  it('carries scores, flavors by third, and construction', () => {
    expect(column.score).toBe(90)
    expect(column.tags).toEqual({
      all: ['cedar', 'cocoa', 'espresso'],
      first: ['cocoa'],
      second: [],
      final: ['espresso'],
    })
    expect(column.draw).toBe('ideal')
    expect(column.ash).toBe('firm, light')
    expect(column.issues).toEqual(['tight draw', 'relight'])
    expect(column.relights).toBe('1')
  })

  it('describes strength across the thirds and fills the facts', () => {
    expect(column.strength).toBe('Medium-Full')
    expect(column.body).toBe('Medium')
    expect(column.strengthByThird).toBe('Medium, then Not noted, then Full')
    expect(column.bodyByThird).toBe('')
    expect(column.size).toBe('Toro · 6 × 52')
    expect(column.time).toBe('1 hr 14 min')
    expect(column.pairing).toBe('bourbon, Eagle Rare')
    expect(column.price).toBe('$18')
  })
})

describe('a cigar as a compare column', () => {
  const smokes = [
    smoke(8, {
      draw: 'ideal',
      relights: 0,
      durationMin: 60,
      quickTags: ['cedar', 'cocoa'],
      vitola: 'Toro',
    }),
    smoke(9, {
      draw: 'ideal',
      relights: 1,
      durationMin: 80,
      quickTags: ['cedar'],
      vitola: 'Robusto',
    }),
    smoke(7, { draw: 'tight', relights: 2, durationMin: 70, quickTags: ['leather'] }),
    newSmoke(cigar.id, { status: 'draft', relights: 9 }),
    { ...smoke(10), deletedAt: '2026-10-01T00:00:00.000Z' },
  ]
  const column = cigarColumn(cigar, smokes)

  it('averages only its completed smokes', () => {
    expect(column.subtitle).toBe('Average of 3 smokes')
    expect(column.score).toBe(90)
    expect(column.ratings.flavor).toBe(8)
    expect(column.relights).toBe('1 on average')
    expect(column.time).toBe('1 hr 10 min on average')
  })

  it('reports the usual construction, the common flavors, and the sizes smoked', () => {
    expect(column.draw).toBe('Usually ideal')
    expect(column.tags.all[0]).toBe('cedar')
    expect(column.size).toBe('Toro, Robusto')
    expect(column.strength).toBe('Medium-Full')
  })
})

describe('compare helpers', () => {
  it('finds the most common value', () => {
    expect(mostCommon(['even', 'wavy', 'even', null])).toBe('even')
    expect(mostCommon([null, undefined])).toBeNull()
  })

  it('marks a best value only when one column clearly leads', () => {
    expect(bestIndex([88, 91, 90])).toBe(1)
    expect(bestIndex([91, 91, 90])).toBe(-1)
    expect(bestIndex([88, null])).toBe(-1)
    expect(bestIndex([null, 85, 80])).toBe(1)
  })
})
