import type { Lot, Smoke } from '../data/types'

/** Smokes logged from each lot, drafts included, deleted ones left out. */
export function smokedCountByLot(smokes: Iterable<Smoke>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const smoke of smokes) {
    if (smoke.deletedAt || !smoke.lotId) continue
    counts.set(smoke.lotId, (counts.get(smoke.lotId) ?? 0) + 1)
  }
  return counts
}

/** Remaining is worked out, never stored, so merges and Undo stay correct. */
export function remaining(lot: Lot, smoked: Map<string, number>): number {
  return Math.max(0, lot.quantityPurchased - lot.quantityRemoved - (smoked.get(lot.id) ?? 0))
}

export function localDate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function daysAged(lot: Lot, today = localDate()): number {
  const from = lot.boxDate ?? lot.purchaseDate
  const ms = Date.parse(`${today}T00:00:00`) - Date.parse(`${from}T00:00:00`)
  return Math.max(0, Math.round(ms / 86_400_000))
}

export function isReady(lot: Lot, smoked: Map<string, number>, today = localDate()): boolean {
  return remaining(lot, smoked) > 0 && (!lot.restUntil || lot.restUntil <= today)
}

export function humidorValue(lots: Iterable<Lot>, smoked: Map<string, number>): number {
  let total = 0
  for (const lot of lots) {
    if (lot.deletedAt) continue
    total += remaining(lot, smoked) * (lot.priceEach ?? 0)
  }
  return total
}
