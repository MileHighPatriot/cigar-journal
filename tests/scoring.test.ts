import { describe, expect, it } from 'vitest'
import { computeScore, shownScore, verdictFor } from '../src/domain/scoring'

const score = (appearance: number, smoking: number, flavor: number, overall: number) =>
  computeScore({ appearance, smoking, flavor, overall })

describe('Lounge 100 formula', () => {
  it.each([
    [7, 7, 7, 7, 85, 85],
    [8, 7, 9, 8.5, 90.875, 91],
    [10, 10, 10, 10, 100, 100],
    [6, 8, 6, 5.5, 81.625, 82],
    [1, 1, 1, 1, 55, 55],
  ])('%d / %d / %d / %d is %d, shown as %d', (a, s, f, o, exact, shown) => {
    expect(score(a, s, f, o)).toEqual({ exact, shown })
  })

  it('rounds a half up', () => {
    expect(score(7.5, 7.5, 7.5, 7.5)).toEqual({ exact: 87.5, shown: 88 })
  })

  it('has no score until all four ratings are set', () => {
    expect(computeScore({ appearance: 8, smoking: 7, flavor: null, overall: 9 })).toBeNull()
  })

  it('rounds a stored exact score the same way', () => {
    expect(shownScore(90.875)).toBe(91)
    expect(shownScore(87.5)).toBe(88)
    expect(shownScore(81.625)).toBe(82)
    expect(shownScore(85)).toBe(85)
  })
})

describe('verdict bands', () => {
  it.each([
    [83, 'Pass'],
    [84, 'Worth a single'],
    [85, 'Worth a single'],
    [86, 'Buy a few'],
    [87, 'Buy a few'],
    [88, 'Box-worthy'],
    [100, 'Box-worthy'],
    [55, 'Pass'],
  ])('%d is %s', (shown, verdict) => {
    expect(verdictFor(shown)).toBe(verdict)
  })
})
