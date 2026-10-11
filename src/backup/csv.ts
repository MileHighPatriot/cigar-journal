import type { Cigar, Smoke } from '../data/types'
import { levelLabel, shownScore, verdictFor } from '../domain/scoring'

/** Wraps a field in quotes when it has a comma, a quote, or a line break. Quotes are doubled. */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const COLUMNS = [
  'date',
  'brand',
  'line',
  'vitola',
  'length_in',
  'ring_gauge',
  'wrapper',
  'country',
  'score',
  'score_exact',
  'verdict',
  'appearance',
  'smoking',
  'flavor',
  'overall',
  'strength',
  'body',
  'minutes',
  'tags',
  'tags_first',
  'tags_second',
  'tags_final',
  'draw',
  'burn',
  'relights',
  'touch_ups',
  'pairing_type',
  'pairing_name',
  'setting',
  'company',
  'would_buy_again',
  'from_humidor',
  'price_paid',
  'summary',
  'id',
] as const

/** One row per completed smoke that is not deleted. UTF-8 with a byte-order mark, CRLF lines. */
export function smokesToCsv(smokes: Iterable<Smoke>, cigars: Map<string, Cigar>): string {
  const rows = [COLUMNS.join(',')]
  const list = [...smokes]
    .filter((smoke) => !smoke.deletedAt && smoke.status === 'complete')
    .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1))
  for (const smoke of list) {
    const cigar = cigars.get(smoke.cigarId)
    const shown = smoke.score === null ? null : shownScore(smoke.score)
    const sized = smoke.vitola || smoke.lengthIn || smoke.ringGauge ? smoke : cigar
    const values: (string | number | null | undefined)[] = [
      smoke.smokedAt,
      cigar?.brand,
      cigar?.line,
      sized?.vitola,
      sized?.lengthIn,
      sized?.ringGauge,
      cigar?.wrapperType,
      cigar?.country,
      shown,
      smoke.score,
      shown === null ? null : verdictFor(shown),
      smoke.ratings.appearance,
      smoke.ratings.smoking,
      smoke.ratings.flavor,
      smoke.ratings.overall,
      levelLabel(smoke.strength ?? cigar?.strength ?? null),
      levelLabel(smoke.body),
      smoke.durationMin,
      smoke.quickTags.join('; '),
      smoke.thirds.first.tags.join('; '),
      smoke.thirds.second.tags.join('; '),
      smoke.thirds.final.tags.join('; '),
      smoke.draw,
      smoke.burn,
      smoke.relights,
      smoke.touchUps,
      smoke.pairingType,
      smoke.pairingName,
      smoke.setting === 'other' ? smoke.settingOther : smoke.setting,
      smoke.company,
      smoke.wouldBuyAgain,
      smoke.lotId ? 'yes' : 'no',
      smoke.pricePaid,
      smoke.summary,
      smoke.id,
    ]
    rows.push(values.map(csvField).join(','))
  }
  return `﻿${rows.join('\r\n')}\r\n`
}
