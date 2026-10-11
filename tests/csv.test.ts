import { describe, expect, it } from 'vitest'
import { csvField, smokesToCsv } from '../src/backup/csv'
import { newCigar, newSmoke } from '../src/data/factories'

describe('CSV fields', () => {
  it('leaves plain text alone', () => {
    expect(csvField('cedar')).toBe('cedar')
    expect(csvField(91)).toBe('91')
    expect(csvField(null)).toBe('')
  })

  it('quotes commas, quotes, and line breaks', () => {
    expect(csvField('cedar, cocoa')).toBe('"cedar, cocoa"')
    expect(csvField('a "great" smoke')).toBe('"a ""great"" smoke"')
    expect(csvField('line one\nline two')).toBe('"line one\nline two"')
    expect(csvField('line one\r\nline two')).toBe('"line one\r\nline two"')
  })
})

describe('CSV export of smokes', () => {
  const cigar = newCigar({
    brand: 'Padron',
    line: '1964 Anniversary',
    wrapperType: 'Natural/Sun Grown',
  })
  const cigars = new Map([[cigar.id, cigar]])
  const smoke = newSmoke(cigar.id, {
    status: 'complete',
    smokedAt: '2026-10-10T02:00:00.000Z',
    vitola: 'Toro',
    lengthIn: 6,
    ringGauge: 52,
    ratings: { appearance: 8, smoking: 7, flavor: 9, overall: 8.5 },
    score: 90.875,
    quickTags: ['cedar', 'cocoa'],
    summary: 'Sharp burn, "wow"\nWould buy again',
  })
  const csv = smokesToCsv(
    [
      smoke,
      newSmoke(cigar.id, { status: 'draft' }),
      { ...smoke, id: 'gone', deletedAt: '2026-10-11T00:00:00.000Z' },
    ],
    cigars,
  )

  it('starts with a byte-order mark and a header row, and uses CRLF', () => {
    expect(csv.startsWith('﻿date,brand,line,vitola')).toBe(true)
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('has one row per completed smoke that is not deleted', () => {
    // The note holds a line break inside quotes, so count rows by the id column instead.
    expect(csv.split(smoke.id)).toHaveLength(2)
    expect(csv).not.toContain('gone')
  })

  it('writes the score, verdict, size, and an escaped note', () => {
    expect(csv).toContain('Padron,1964 Anniversary,Toro,6,52,Natural/Sun Grown')
    expect(csv).toContain(',91,90.875,Box-worthy,8,7,9,8.5,')
    expect(csv).toContain('cedar; cocoa')
    expect(csv).toContain('"Sharp burn, ""wow""\nWould buy again"')
  })
})
