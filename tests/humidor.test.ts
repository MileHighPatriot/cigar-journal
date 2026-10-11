import { describe, expect, it } from 'vitest'
import { newLot, newSmoke } from '../src/data/factories'
import { daysAged, humidorValue, isReady, remaining, smokedCountByLot } from '../src/domain/humidor'

describe('humidor count', () => {
  const lot = newLot('cigar-1', { quantityPurchased: 5, priceEach: 12 })

  it('goes 5, 4, 5, 4 through log, delete, and undo', () => {
    expect(remaining(lot, smokedCountByLot([]))).toBe(5)

    const smoke = newSmoke('cigar-1', { lotId: lot.id })
    expect(remaining(lot, smokedCountByLot([smoke]))).toBe(4)

    const deleted = { ...smoke, deletedAt: '2026-10-10T00:00:00.000Z' }
    expect(remaining(lot, smokedCountByLot([deleted]))).toBe(5)

    const undone = { ...deleted, deletedAt: null }
    expect(remaining(lot, smokedCountByLot([undone]))).toBe(4)
  })

  it('counts drafts, since the cigar is already out of the box', () => {
    const draft = newSmoke('cigar-1', { lotId: lot.id, status: 'draft' })
    expect(remaining(lot, smokedCountByLot([draft]))).toBe(4)
  })

  it('subtracts cigars given away and never goes below zero', () => {
    const gifted = { ...lot, quantityRemoved: 2 }
    expect(remaining(gifted, smokedCountByLot([]))).toBe(3)
    expect(remaining({ ...lot, quantityRemoved: 9 }, smokedCountByLot([]))).toBe(0)
  })

  it('values what is left', () => {
    const smoke = newSmoke('cigar-1', { lotId: lot.id })
    expect(humidorValue([lot], smokedCountByLot([smoke]))).toBe(48)
  })

  it('ages from the box date when there is one', () => {
    const dated = { ...lot, purchaseDate: '2026-10-01', boxDate: '2026-09-01' }
    expect(daysAged(dated, '2026-10-10')).toBe(39)
    expect(daysAged({ ...dated, boxDate: null }, '2026-10-10')).toBe(9)
  })

  it('is ready when some are left and the rest date has passed', () => {
    const none = smokedCountByLot([])
    expect(isReady({ ...lot, restUntil: null }, none, '2026-10-10')).toBe(true)
    expect(isReady({ ...lot, restUntil: '2026-10-10' }, none, '2026-10-10')).toBe(true)
    expect(isReady({ ...lot, restUntil: '2026-11-01' }, none, '2026-10-10')).toBe(false)
    expect(isReady({ ...lot, quantityRemoved: 5 }, none, '2026-10-10')).toBe(false)
  })
})
