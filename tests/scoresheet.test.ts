import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke, withSmokeDefaults } from '../src/data/factories'
import type { Marks, Smoke } from '../src/data/types'
import {
  buyAgainFromMarks,
  categoryRating,
  computeScore,
  emptyRatings,
  ratingsFromMarks,
  SHEET,
  sheetProgress,
  verdictFor,
} from '../src/domain/scoring'
import { standing } from '../src/domain/standing'

/** Every item answered at the same distance from the top (0 is the best line). */
function sheet(fromTop: number, call: number): Marks {
  const marks: Marks = {}
  for (const item of SHEET) marks[item.key] = Math.max(0, item.levels.length - 1 - fromTop)
  marks.call = call
  return marks
}
const scoreOf = (marks: Marks) => computeScore(ratingsFromMarks(emptyRatings(), marks))

describe('the scoresheet', () => {
  it('has ten items and every category has at least one', () => {
    expect(SHEET).toHaveLength(10)
    expect(new Set(SHEET.map((item) => item.key)).size).toBe(10)
    for (const category of ['appearance', 'smoking', 'flavor', 'overall'] as const) {
      expect(SHEET.some((item) => item.category === category)).toBe(true)
    }
  })

  it('lists each item worst to best, ending on full marks', () => {
    for (const item of SHEET) {
      const points = item.levels.map((level) => level.points)
      expect([...points].sort((a, b) => a - b)).toEqual(points)
      expect(points.at(-1)).toBe(100)
    }
  })

  it('gives no rating until every item in the category is answered', () => {
    expect(categoryRating('smoking', { draw: 4, burn: 4 })).toBeNull()
    expect(categoryRating('smoking', { draw: 4, burn: 4, smoke: 3 })).toBe(10)
    expect(scoreOf({ draw: 4, burn: 4, smoke: 3 })).toBeNull()
  })

  it('scores a flawless all-time great at 100 and the worst of everything in the 50s', () => {
    expect(scoreOf(sheet(0, 5))).toEqual({ exact: 100, shown: 100 })
    const worst: Marks = {}
    for (const item of SHEET) worst[item.key] = 0
    expect(scoreOf(worst)?.shown).toBeLessThan(60)
  })

  it('lands a good cigar on the verdict that matches the call', () => {
    // Good across the board, one step under the top line on every item.
    expect(verdictFor(scoreOf(sheet(1, 2))?.shown ?? 0)).toBe('Worth a single')
    expect(verdictFor(scoreOf(sheet(1, 3))?.shown ?? 0)).toBe('Buy a few')
    expect(verdictFor(scoreOf(sheet(1, 4))?.shown ?? 0)).toBe('Box-worthy')
    expect(verdictFor(scoreOf(sheet(1, 1))?.shown ?? 0)).toBe('Pass')
  })

  it('moves the score when one thing goes wrong', () => {
    const good = sheet(1, 3)
    const badBurn = { ...good, burn: 0 }
    expect(scoreOf(badBurn)?.exact ?? 0).toBeLessThan((scoreOf(good)?.exact ?? 0) - 2)
  })

  it('keeps a rating given the old way until its category is fully re-answered', () => {
    const old = { appearance: 8, smoking: 7, flavor: 9, overall: 8.5 }
    expect(ratingsFromMarks(old, {})).toEqual(old)
    expect(ratingsFromMarks(old, { draw: 4 })).toEqual(old)
    expect(ratingsFromMarks(old, { call: 5 })).toEqual({ ...old, overall: 10 })
  })

  it('still scores the old 1 to 10 ratings exactly as before', () => {
    expect(computeScore({ appearance: 8, smoking: 7, flavor: 9, overall: 8.5 })).toEqual({
      exact: 90.875,
      shown: 91,
    })
  })

  it('counts answers and reads buy-again off the call', () => {
    expect(sheetProgress({ draw: 2, call: 3 })).toEqual({ done: 2, total: 10 })
    expect(buyAgainFromMarks({})).toBeNull()
    expect([0, 1, 2, 3, 4, 5].map((call) => buyAgainFromMarks({ call }))).toEqual([
      'no',
      'no',
      'single',
      'few',
      'box',
      'box',
    ])
  })

  it('opens a smoke saved before the sheet existed with its score untouched', () => {
    const { marks: _marks, ...saved } = newSmoke('c1', {
      status: 'complete',
      ratings: { appearance: 7, smoking: 7, flavor: 7, overall: 7 },
      score: 85,
      rubricVersion: 1,
    })
    const opened = withSmokeDefaults(saved as Smoke)
    expect(opened.marks).toEqual({})
    expect(opened.score).toBe(85)
    expect(opened.rubricVersion).toBe(1)
    expect(opened.ratings.flavor).toBe(7)
  })
})

describe('where a smoke stands', () => {
  const padron = newCigar({ id: 'p1', brand: 'Padron', line: '1964', wrapperType: 'Habano' })
  const padron2 = newCigar({ id: 'p2', brand: 'Padron', line: '2000', wrapperType: 'Habano' })
  const oliva = newCigar({ id: 'o1', brand: 'Oliva', line: 'Serie V', wrapperType: 'Habano' })
  const cigars = new Map([padron, padron2, oliva].map((cigar) => [cigar.id, cigar]))
  const smoke = (cigarId: string, score: number | null, day: number, fields: Partial<Smoke> = {}) =>
    newSmoke(cigarId, {
      status: 'complete',
      score,
      smokedAt: `2026-10-${String(day).padStart(2, '0')}T20:00:00.000Z`,
      ...fields,
    })

  it('says nothing without a score and marks the first one', () => {
    expect(standing(smoke('p1', null, 1), [], cigars)).toEqual([])
    expect(standing(smoke('p1', 90, 1), [], cigars)).toEqual(['Your first scored smoke'])
  })

  it('ranks it and compares brand, wrapper, and the last time', () => {
    const others = [
      smoke('p1', 88, 1),
      smoke('p2', 86, 2),
      smoke('o1', 93, 3),
      smoke('o1', 84, 4, { status: 'draft' }),
      smoke('o1', null, 5),
    ]
    expect(standing(smoke('p1', 91, 10), others, cigars)).toEqual([
      '#2 of 4 smokes',
      'Best Padron you have logged',
      '2 over your Habano average',
      '3 better than the last time you smoked it',
    ])
    expect(standing(smoke('p2', 87, 10), others, cigars)).toEqual([
      '#3 of 4 smokes',
      'Right at your Padron average',
      '2 under your Habano average',
      '1 better than the last time you smoked it',
    ])
  })

  it('calls out a new best', () => {
    const others = [smoke('p1', 88, 1), smoke('o1', 90, 2)]
    expect(standing(smoke('o1', 95, 9), others, cigars)[0]).toBe('Your best yet, #1 of 3 smokes')
  })
})
