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

function dayMs(date: string): number {
  return Date.parse(`${date}T00:00:00`)
}

export function addDays(date: string, days: number): string {
  const next = new Date(dayMs(date))
  next.setDate(next.getDate() + days)
  return localDate(next)
}

export interface RestInfo {
  /** True while the rest-until date is still ahead. */
  resting: boolean
  daysLeft: number
  /** 0 to 1, from the purchase date to the rest-until date. */
  progress: number
}

export function restInfo(lot: Lot, today = localDate()): RestInfo {
  if (!lot.restUntil || lot.restUntil <= today) return { resting: false, daysLeft: 0, progress: 1 }
  const total = Math.max(1, dayMs(lot.restUntil) - dayMs(lot.purchaseDate))
  const done = dayMs(today) - dayMs(lot.purchaseDate)
  return {
    resting: true,
    daysLeft: Math.round((dayMs(lot.restUntil) - dayMs(today)) / 86_400_000),
    progress: Math.min(1, Math.max(0, done / total)),
  }
}

export interface HumidorTotals {
  /** Cigars on hand across every lot. */
  onHand: number
  ready: number
  resting: number
  value: number
}

export function humidorTotals(
  lots: Iterable<Lot>,
  smoked: Map<string, number>,
  today = localDate(),
): HumidorTotals {
  const totals: HumidorTotals = { onHand: 0, ready: 0, resting: 0, value: 0 }
  for (const lot of lots) {
    if (lot.deletedAt) continue
    const left = remaining(lot, smoked)
    totals.onHand += left
    totals.value += left * (lot.priceEach ?? 0)
    if (restInfo(lot, today).resting) totals.resting += left
    else totals.ready += left
  }
  return totals
}
