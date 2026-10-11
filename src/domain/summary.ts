import type { Cigar, Smoke } from '../data/types'
import { formatDateLong, formatMinutes } from './format'
import { shownScore, verdictFor } from './scoring'

const SETTINGS = { lounge: 'Stanley Pappas lounge', home: 'Home', patio: 'Patio', other: '' }

function plainSize(smoke: Smoke, cigar: Cigar | undefined): string {
  const source = smoke.vitola || smoke.lengthIn || smoke.ringGauge ? smoke : cigar
  if (!source) return ''
  const dims = source.lengthIn && source.ringGauge ? `${source.lengthIn} x ${source.ringGauge}` : ''
  if (source.vitola && dims) return `${source.vitola} (${dims})`
  return source.vitola || (dims ? `(${dims})` : '')
}

/** Plain text for pasting into a message or notes. Lines with nothing to say are left out. */
export function smokeSummary(smoke: Smoke, cigar: Cigar | undefined): string {
  const name = [cigar?.brand, cigar?.line, plainSize(smoke, cigar)].filter(Boolean).join(' ')
  const where = smoke.setting === 'other' ? smoke.settingOther : SETTINGS[smoke.setting]
  const second = [formatDateLong(smoke.smokedAt), where, formatMinutes(smoke.durationMin)]
    .filter(Boolean)
    .join(' · ')
  const lines = [name || 'Unknown cigar', second]
  if (smoke.score !== null) {
    const shown = shownScore(smoke.score)
    lines.push(`Lounge 100: ${shown} · ${verdictFor(shown)}`)
  }
  const thirds: [string, string[]][] = [
    ['First third', smoke.thirds.first.tags],
    ['Second third', smoke.thirds.second.tags],
    ['Final third', smoke.thirds.final.tags],
  ]
  for (const [label, tags] of thirds) {
    if (tags.length > 0) lines.push(`${label}: ${tags.join(', ')}`)
  }
  if (smoke.quickTags.length > 0) lines.push(`Flavors: ${smoke.quickTags.join(', ')}`)
  const pairing = [smoke.pairingType, smoke.pairingName].filter(Boolean).join(', ')
  if (pairing) lines.push(`Pairing: ${pairing}`)
  if (smoke.summary.trim()) lines.push(`Note: ${smoke.summary.trim()}`)
  return lines.join('\n')
}
