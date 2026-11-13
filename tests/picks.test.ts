import { describe, expect, it } from 'vitest'
import type { Cigar } from '../src/data/types'
import { groupOf } from '../src/domain/lounge'
import { GUESTS, PICKS, picksFor, pricedCount } from '../src/domain/picks'
import catalog from '../src/seed/catalog.json'

const cigars = new Map((catalog.cigars as unknown as Cigar[]).map((cigar) => [cigar.id, cigar]))

describe('floor picks', () => {
  it('has four sticks for each guest at each strength, none twice', () => {
    for (const guest of GUESTS) {
      for (const strength of ['mild', 'medium', 'full']) {
        const set = PICKS.filter((pick) => pick.guest === guest.key && pick.strength === strength)
        expect(set, `${guest.key} ${strength}`).toHaveLength(4)
      }
    }
    expect(new Set(PICKS.map((pick) => pick.cigarId)).size).toBe(PICKS.length)
  })

  it('never puts two sticks from one company in a set of four', () => {
    for (const guest of GUESTS) {
      for (const group of picksFor(guest.key, cigars)) {
        const brands = group.rows.map((row) => row.cigar?.brand)
        expect(new Set(brands).size, `${guest.key} ${group.strength}: ${brands.join(', ')}`).toBe(4)
      }
    }
  })

  it('gives every pick a description to tell the guest, with no em dashes', () => {
    for (const pick of PICKS) {
      for (const part of [pick.why, pick.story, pick.leaf, pick.taste]) {
        expect(part.length, pick.name).toBeGreaterThan(20)
      }
      expect(
        `${pick.why}${pick.story}${pick.leaf}${pick.taste}${pick.proof}`,
        pick.name,
      ).not.toContain('\u2014')
    }
  })

  it('points every pick at a catalog cigar of the strength it is listed under', () => {
    for (const pick of PICKS) {
      const cigar = cigars.get(pick.cigarId)
      expect(cigar, pick.name).toBeDefined()
      expect(groupOf(cigar?.strength ?? null), pick.name).toBe(pick.strength)
      expect(`${cigar?.brand} ${cigar?.line}`.trim(), pick.name).toBe(pick.name)
    }
  })

  it('runs every set of four from the cheapest to the priciest', () => {
    for (const guest of GUESTS) {
      for (const group of picksFor(guest.key, cigars)) {
        const prices = group.rows.map((row) => row.online)
        expect(new Set(prices).size, `${guest.key} ${group.strength}`).toBe(4)
        expect(prices, `${guest.key} ${group.strength}`).toEqual([...prices].sort((a, b) => a - b))
      }
    }
  })

  it('groups a guest Mild to Full and skips a deleted cigar', () => {
    const mine = new Map(cigars)
    const first = PICKS[0]
    if (!first) throw new Error('no picks')
    const gone = mine.get(first.cigarId)
    if (!gone) throw new Error('missing cigar')
    mine.set(gone.id, { ...gone, deletedAt: '2026-11-12T00:00:00.000Z' })
    const groups = picksFor('new', mine)
    expect(groups.map((group) => group.strength)).toEqual(['mild', 'medium', 'full'])
    expect(groups[0]?.rows[0]?.cigar).toBeNull()
    expect(groups[0]?.rows[1]?.cigar?.id).toBe(PICKS[1]?.cigarId)
  })

  it('counts a pick as priced only once he has set it himself', () => {
    const mine = new Map<string, Cigar>(
      [...cigars].map(([id, cigar]) => [id, { ...cigar, priceCheckedAt: null }]),
    )
    expect(pricedCount(mine)).toBe(0)
    const pick = PICKS[4]
    if (!pick) throw new Error('no pick')
    const cigar = mine.get(pick.cigarId)
    if (!cigar) throw new Error('missing cigar')
    mine.set(cigar.id, { ...cigar, priceTier: 4, priceCheckedAt: '2026-11-15T18:00:00.000Z' })
    expect(pricedCount(mine)).toBe(1)
  })
})
