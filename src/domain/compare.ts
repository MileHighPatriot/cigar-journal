import type { Cigar, RatingKey, Smoke, ThirdKey } from '../data/types'
import { formatDateLong, formatMinutes, formatMoney, plural } from './format'
import { levelLabel, RUBRIC, shownScore } from './scoring'
import { smokeSize } from './sizes'
import { average, effectiveStrength } from './stats'
import { effectiveTags } from './tags'

const THIRDS: ThirdKey[] = ['first', 'second', 'final']

export interface CompareColumn {
  key: string
  brand: string
  title: string
  subtitle: string
  /** Where the column header links to. */
  href: string
  /** Shown score, or the rounded average for a cigar. */
  score: number | null
  ratings: Record<RatingKey, number | null>
  tags: Record<ThirdKey | 'all', string[]>
  strength: string
  body: string
  strengthByThird: string
  bodyByThird: string
  draw: string
  burn: string
  ash: string
  smokeVolume: string
  relights: string
  touchUps: string
  issues: string[]
  wrapper: string
  size: string
  time: string
  pairing: string
  price: string
}

/** The value seen most often, ties going to the one seen first. */
export function mostCommon<T>(values: (T | null | undefined)[]): T | null {
  const counts = new Map<T, number>()
  let best: T | null = null
  let bestCount = 0
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    const count = (counts.get(value) ?? 0) + 1
    counts.set(value, count)
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

/** Tags ordered by how often they appear, most common first. */
function rankedTags(lists: string[][], limit = 6): string[] {
  const counts = new Map<string, number>()
  for (const list of lists) {
    for (const tag of new Set(list)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

const one = (value: number | null): string =>
  value === null ? '' : Number.isInteger(value) ? String(value) : value.toFixed(1)

function byThird(smoke: Smoke, field: 'strength' | 'body'): string {
  const labels = THIRDS.map((third) => levelLabel(smoke.thirds[third][field]))
  return labels.some(Boolean) ? labels.map((label) => label || 'Not noted').join(', then ') : ''
}

export function smokeColumn(smoke: Smoke, cigar: Cigar | undefined): CompareColumn {
  const ash = [smoke.ashFirmness, smoke.ashColor].filter(Boolean).join(', ')
  return {
    key: smoke.id,
    brand: cigar?.brand ?? '',
    title: cigar?.line || cigar?.brand || 'Unknown cigar',
    subtitle: formatDateLong(smoke.smokedAt),
    href: `/smokes/${smoke.id}`,
    score: smoke.score === null ? null : shownScore(smoke.score),
    ratings: smoke.ratings,
    tags: {
      all: effectiveTags(smoke),
      first: smoke.thirds.first.tags,
      second: smoke.thirds.second.tags,
      final: smoke.thirds.final.tags,
    },
    strength: levelLabel(effectiveStrength(smoke, cigar)),
    body: levelLabel(smoke.body),
    strengthByThird: byThird(smoke, 'strength'),
    bodyByThird: byThird(smoke, 'body'),
    draw: smoke.draw ?? '',
    burn: smoke.burn ?? '',
    ash,
    smokeVolume: smoke.smokeVolume ?? '',
    relights: String(smoke.relights),
    touchUps: String(smoke.touchUps),
    issues: [...new Set(THIRDS.flatMap((third) => smoke.thirds[third].issues))],
    wrapper: cigar?.wrapperType ?? '',
    size: smokeSize(smoke, cigar),
    time: formatMinutes(smoke.durationMin),
    pairing: [smoke.pairingType, smoke.pairingName].filter(Boolean).join(', '),
    price: smoke.pricePaid === null ? '' : formatMoney(smoke.pricePaid),
  }
}

/** A cigar's column is the average of its completed smokes. */
export function cigarColumn(cigar: Cigar, smokes: Smoke[]): CompareColumn {
  const done = smokes.filter((smoke) => !smoke.deletedAt && smoke.status === 'complete')
  const scores = done.flatMap((smoke) => (smoke.score === null ? [] : [shownScore(smoke.score)]))
  const mean = (values: (number | null)[]) => {
    const known = values.filter((value): value is number => value !== null)
    const result = average(known)
    return result === null ? null : Math.round(result * 10) / 10
  }
  const ratings = Object.fromEntries(
    RUBRIC.map((category) => [category.key, mean(done.map((s) => s.ratings[category.key]))]),
  ) as Record<RatingKey, number | null>
  const strength = mean(done.map((smoke) => effectiveStrength(smoke, cigar)))
  const body = mean(done.map((smoke) => smoke.body))
  const minutes = mean(done.map((smoke) => smoke.durationMin))
  const paid = mean(done.map((smoke) => smoke.pricePaid))
  const sizes = [...new Set(done.map((smoke) => smokeSize(smoke, cigar)).filter(Boolean))]
  const usually = (value: string | null) => (value ? `Usually ${value}` : '')
  return {
    key: cigar.id,
    brand: cigar.brand,
    title: cigar.line || cigar.brand || 'Unknown cigar',
    subtitle: `Average of ${plural(done.length, 'smoke')}`,
    href: `/cigars/${cigar.id}`,
    score: scores.length > 0 ? Math.round(average(scores) ?? 0) : null,
    ratings,
    tags: {
      all: rankedTags(done.map((smoke) => effectiveTags(smoke))),
      first: rankedTags(done.map((smoke) => smoke.thirds.first.tags)),
      second: rankedTags(done.map((smoke) => smoke.thirds.second.tags)),
      final: rankedTags(done.map((smoke) => smoke.thirds.final.tags)),
    },
    strength: levelLabel(strength === null ? null : Math.round(strength)),
    body: levelLabel(body === null ? null : Math.round(body)),
    strengthByThird: '',
    bodyByThird: '',
    draw: usually(mostCommon(done.map((smoke) => smoke.draw))),
    burn: usually(mostCommon(done.map((smoke) => smoke.burn))),
    ash: usually(mostCommon(done.map((smoke) => smoke.ashFirmness))),
    smokeVolume: usually(mostCommon(done.map((smoke) => smoke.smokeVolume))),
    relights: done.length > 0 ? `${one(mean(done.map((smoke) => smoke.relights)))} on average` : '',
    touchUps: done.length > 0 ? `${one(mean(done.map((smoke) => smoke.touchUps)))} on average` : '',
    issues: rankedTags(done.map((smoke) => THIRDS.flatMap((third) => smoke.thirds[third].issues))),
    wrapper: cigar.wrapperType ?? '',
    size: sizes.join(', '),
    time: minutes === null ? '' : `${formatMinutes(Math.round(minutes))} on average`,
    pairing: mostCommon(done.map((smoke) => smoke.pairingType)) ?? '',
    price: paid === null ? '' : `${formatMoney(Math.round(paid * 100) / 100)} on average`,
  }
}

/** Index of the highest number in a row, or -1 when there is no clear best. */
export function bestIndex(values: (number | null)[]): number {
  const known = values.filter((value): value is number => value !== null)
  if (known.length < 2) return -1
  const top = Math.max(...known)
  return known.filter((value) => value === top).length === 1 ? values.indexOf(top) : -1
}
