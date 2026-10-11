import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import { smokeSummary } from '../src/domain/summary'
import {
  elapsedMs,
  formatElapsed,
  fromLocalInput,
  minutesFor,
  toLocalInput,
} from '../src/domain/timer'

const cigar = newCigar({ brand: 'Padron', line: '1964 Anniversary' })

describe('copy summary', () => {
  it('writes the full plain-text summary', () => {
    const smoke = newSmoke(cigar.id, {
      status: 'complete',
      smokedAt: new Date(2026, 9, 10, 20, 0).toISOString(),
      vitola: 'Exclusivo',
      lengthIn: 5.5,
      ringGauge: 50,
      durationMin: 68,
      ratings: { appearance: 8, smoking: 7, flavor: 9, overall: 8.5 },
      score: 90.875,
      pairingType: 'bourbon',
      pairingName: 'Eagle Rare',
      summary: 'Burned razor sharp. Would buy a box.',
    })
    smoke.thirds.first.tags = ['cedar', 'cocoa', 'white pepper']
    smoke.thirds.second.tags = ['espresso', 'leather']
    smoke.thirds.final.tags = ['dark chocolate', 'earth']
    expect(smokeSummary(smoke, cigar)).toBe(
      [
        'Padron 1964 Anniversary Exclusivo (5.5 x 50)',
        'Oct 10, 2026 · Stanley Pappas lounge · 1 hr 8 min',
        'Lounge 100: 91 · Box-worthy',
        'First third: cedar, cocoa, white pepper',
        'Second third: espresso, leather',
        'Final third: dark chocolate, earth',
        'Pairing: bourbon, Eagle Rare',
        'Note: Burned razor sharp. Would buy a box.',
      ].join('\n'),
    )
  })

  it('leaves out lines with nothing to say', () => {
    const quick = newSmoke(cigar.id, {
      status: 'complete',
      smokedAt: new Date(2026, 9, 10, 20, 0).toISOString(),
      setting: 'home',
      quickTags: ['cedar'],
    })
    expect(smokeSummary(quick, cigar)).toBe(
      ['Padron 1964 Anniversary', 'Oct 10, 2026 · Home', 'Flavors: cedar'].join('\n'),
    )
  })

  it('has no em dash anywhere', () => {
    expect(smokeSummary(newSmoke(cigar.id), cigar)).not.toContain('—')
  })
})

describe('smoke timer', () => {
  const start = '2026-10-10T20:00:00.000Z'

  it('works out elapsed time from the start time, whatever happened in between', () => {
    expect(elapsedMs(start, null, Date.parse('2026-10-10T20:42:10.000Z'))).toBe(2_530_000)
    expect(elapsedMs(start, '2026-10-10T21:08:05.000Z')).toBe(4_085_000)
    expect(elapsedMs(start, null, Date.parse('2026-10-10T19:00:00.000Z'))).toBe(0)
  })

  it('shows minutes and seconds, then hours', () => {
    expect(formatElapsed(0)).toBe('0:00')
    expect(formatElapsed(2_530_000)).toBe('42:10')
    expect(formatElapsed(4_085_000)).toBe('1:08:05')
  })

  it('records whole minutes, at least 1', () => {
    expect(minutesFor(4_085_000)).toBe(68)
    expect(minutesFor(10_000)).toBe(1)
  })

  it('round-trips a date and time through the form field', () => {
    const iso = new Date(2026, 9, 10, 20, 5).toISOString()
    expect(toLocalInput(iso)).toBe('2026-10-10T20:05')
    expect(fromLocalInput('2026-10-10T20:05')).toBe(iso)
    expect(fromLocalInput('')).toBeNull()
  })
})
