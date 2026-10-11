import type { Cigar } from '../data/types'

const dateShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dateLong = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const timeShort = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export function formatDate(iso: string, now = new Date()): string {
  const date = new Date(iso)
  return date.getFullYear() === now.getFullYear() ? dateShort.format(date) : dateLong.format(date)
}

export function formatDateLong(iso: string): string {
  return dateLong.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeShort.format(new Date(iso))
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return ''
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })
}

export function formatRating(rating: number | null): string {
  if (rating === null) return ''
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1)
}

const FRACTIONS: Record<string, string> = {
  '0.125': '⅛',
  '0.25': '¼',
  '0.375': '⅜',
  '0.5': '½',
  '0.625': '⅝',
  '0.75': '¾',
  '0.875': '⅞',
}

function inches(value: number): string {
  const whole = Math.floor(value)
  const fraction = FRACTIONS[String(value - whole)]
  if (value === whole) return String(whole)
  return fraction ? `${whole}${fraction}` : String(value)
}

/** "5½ × 50", or just the part that is known. */
export function formatSize(cigar: Pick<Cigar, 'lengthIn' | 'ringGauge'>): string {
  if (cigar.lengthIn && cigar.ringGauge) return `${inches(cigar.lengthIn)} × ${cigar.ringGauge}`
  if (cigar.lengthIn) return `${inches(cigar.lengthIn)} in`
  if (cigar.ringGauge) return `${cigar.ringGauge} ring`
  return ''
}

/** The line, or the brand when a cigar has no line yet. */
export function cigarTitle(cigar: Pick<Cigar, 'brand' | 'line'>): string {
  return cigar.line || cigar.brand || 'Unnamed cigar'
}

export function cigarSubtitle(cigar: Pick<Cigar, 'vitola' | 'lengthIn' | 'ringGauge'>): string {
  return [cigar.vitola, formatSize(cigar)].filter(Boolean).join(' · ')
}

export function cigarFullName(cigar: Cigar): string {
  return [cigar.brand, cigar.line, cigar.vitola].filter(Boolean).join(' ')
}

export function lineKey(cigar: Pick<Cigar, 'brand' | 'line'>): string {
  return `${cigar.brand.trim().toLowerCase()}|${cigar.line.trim().toLowerCase()}`
}
