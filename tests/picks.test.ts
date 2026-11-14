import { describe, expect, it } from 'vitest'
import type { Cigar } from '../src/data/types'
import { groupOf } from '../src/domain/lounge'
import {
  GUESTS,
  PICKS,
  picksFor,
  pickWeek,
  pricedCount,
  weekPicks,
  weekSet,
} from '../src/domain/picks'
import catalog from '../src/seed/catalog.json'

const cigars = new Map((catalog.cigars as unknown as Cigar[]).map((cigar) => [cigar.id, cigar]))
const STRENGTHS = ['mild', 'medium', 'full'] as const
/** Two years of Sundays. */
const WEEKS = Array.from({ length: 105 }, (_, week) => week)

describe('floor picks', () => {
  it('lists no stick twice and gives every set more than four to deal from', () => {
    expect(new Set(PICKS.map((pick) => pick.cigarId)).size).toBe(PICKS.length)
    for (const guest of GUESTS) {
      for (const strength of STRENGTHS) {
        const pool = PICKS.filter((pick) => pick.guest === guest.key && pick.strength === strength)
        expect(pool.length, `${guest.key} ${strength}`).toBeGreaterThan(5)
      }
    }
  })

  it('deals four sticks a set every week: four brands, three or more prices, cheapest first', () => {
    for (const week of WEEKS) {
      for (const guest of GUESTS) {
        for (const strength of STRENGTHS) {
          const four = weekSet(guest.key, strength, week)
          const where = `week ${week} ${guest.key} ${strength}`
          expect(four, where).toHaveLength(4)
          expect(new Set(four.map((pick) => pick.brand)).size, where).toBe(4)
          const prices = four.map((pick) => pick.online)
          expect(new Set(prices).size, where).toBeGreaterThanOrEqual(week === 0 ? 4 : 3)
          expect(prices, where).toEqual([...prices].sort((a, b) => a - b))
          for (const pick of four) {
            expect(pick.guest, where).toBe(guest.key)
            expect(pick.strength, where).toBe(strength)
          }
        }
      }
      expect(new Set(weekPicks(week).map((pick) => pick.cigarId)).size, `week ${week}`).toBe(36)
    }
  })

  it('changes every set each Sunday and brings every stick up within two months', () => {
    for (const guest of GUESTS) {
      for (const strength of STRENGTHS) {
        const ids = (week: number) => weekSet(guest.key, strength, week).map((pick) => pick.cigarId)
        const pool = PICKS.filter((pick) => pick.guest === guest.key && pick.strength === strength)
        for (const week of WEEKS.slice(1)) {
          const before = new Set(ids(week - 1))
          const fresh = ids(week).filter((id) => !before.has(id))
          expect(fresh.length, `week ${week} ${guest.key} ${strength}`).toBeGreaterThanOrEqual(2)
          if (week > 1) {
            expect([...ids(week)].sort(), `week ${week} ${guest.key} ${strength}`).not.toEqual(
              [...ids(week - 2)].sort(),
            )
          }
        }
        for (const start of [0, 20, 60]) {
          const seen = new Set(Array.from({ length: 8 }, (_, step) => ids(start + step)).flat())
          expect(seen.size, `${guest.key} ${strength} from week ${start}`).toBe(pool.length)
        }
      }
    }
  })

  it('holds the first set until Sunday 2026-11-22, then moves on each Sunday', () => {
    expect(pickWeek(new Date(2026, 10, 13, 9))).toBe(0)
    expect(pickWeek(new Date(2026, 10, 15, 12))).toBe(0)
    expect(pickWeek(new Date(2026, 10, 21, 23, 59))).toBe(0)
    expect(pickWeek(new Date(2026, 10, 22, 0, 0))).toBe(1)
    expect(pickWeek(new Date(2026, 10, 28, 23, 59))).toBe(1)
    expect(pickWeek(new Date(2026, 10, 29, 0, 0))).toBe(2)
    // Across the clock change in March.
    expect(pickWeek(new Date(2027, 2, 13, 23, 59))).toBe(16)
    expect(pickWeek(new Date(2027, 2, 14, 0, 0))).toBe(17)
    expect(pickWeek(new Date(2026, 5, 1))).toBe(0)
    const first = PICKS.slice(0, 4).map((pick) => pick.cigarId)
    expect(weekSet('new', 'mild', 0).map((pick) => pick.cigarId)).toEqual(first)
  })

  it('deals only sticks still on his Lounge list', () => {
    const entry = { addedAt: '2026-10-26T19:00:00.000Z' } as unknown as Cigar['lounge']
    const gone = PICKS.find((pick) => pick.name === 'Macanudo Café')
    if (!gone) throw new Error('no pick')
    const mine = new Map(
      [...cigars].map(([id, cigar]) => [
        id,
        { ...cigar, lounge: id === gone.cigarId ? null : entry },
      ]),
    )
    for (const week of WEEKS.slice(0, 30)) {
      const four = weekSet('new', 'mild', week, mine)
      expect(four, `week ${week}`).toHaveLength(4)
      expect(
        four.map((pick) => pick.cigarId),
        `week ${week}`,
      ).not.toContain(gone.cigarId)
      expect(new Set(four.map((pick) => pick.brand)).size, `week ${week}`).toBe(4)
    }
    // A set he has not touched opens the same as before.
    expect(weekSet('new', 'full', 0, mine)).toEqual(weekSet('new', 'full', 0))
    // A device with no Lounge list at all still gets picks.
    expect(weekPicks(3, cigars)).toHaveLength(36)
  })

  it('gives every pick a description to tell the guest, with no em dashes', () => {
    for (const pick of PICKS) {
      for (const part of [pick.why, pick.story, pick.leaf, pick.taste]) {
        expect(part.length, pick.name).toBeGreaterThan(20)
      }
      expect(
        `${pick.why}${pick.story}${pick.leaf}${pick.taste}${pick.proof}`,
        pick.name,
      ).not.toMatch(/[\u2013\u2014]/)
    }
  })

  it('points every pick at a catalog cigar of the strength it is listed under', () => {
    for (const pick of PICKS) {
      const cigar = cigars.get(pick.cigarId)
      expect(cigar, pick.name).toBeDefined()
      expect(groupOf(cigar?.strength ?? null), pick.name).toBe(pick.strength)
      expect(`${cigar?.brand} ${cigar?.line}`.trim(), pick.name).toBe(pick.name)
      expect(cigar?.brand, pick.name).toBe(pick.brand)
    }
  })

  it('groups a guest Mild to Full and skips a deleted cigar', () => {
    const mine = new Map(cigars)
    const first = PICKS[0]
    if (!first) throw new Error('no picks')
    const gone = mine.get(first.cigarId)
    if (!gone) throw new Error('missing cigar')
    mine.set(gone.id, { ...gone, deletedAt: '2026-11-12T00:00:00.000Z' })
    const groups = picksFor('new', mine, 0)
    expect(groups.map((group) => group.strength)).toEqual(['mild', 'medium', 'full'])
    expect(groups[0]?.rows[0]?.cigar).toBeNull()
    expect(groups[0]?.rows[1]?.cigar?.id).toBe(PICKS[1]?.cigarId)
  })

  it('counts a pick as priced only once he has set it himself', () => {
    const mine = new Map<string, Cigar>(
      [...cigars].map(([id, cigar]) => [id, { ...cigar, priceCheckedAt: null }]),
    )
    expect(pricedCount(mine, 0)).toBe(0)
    const pick = PICKS[4]
    if (!pick) throw new Error('no pick')
    const cigar = mine.get(pick.cigarId)
    if (!cigar) throw new Error('missing cigar')
    mine.set(cigar.id, { ...cigar, priceTier: 4, priceCheckedAt: '2026-11-15T18:00:00.000Z' })
    expect(pricedCount(mine, 0)).toBe(1)
  })
})
