import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import { STANDARD_SIZES, smokeSize } from '../src/domain/sizes'

describe('size shown for a smoke', () => {
  const line = newCigar({ brand: 'Padron', line: '1964 Anniversary' })

  it('is empty when neither the smoke nor the cigar has one', () => {
    expect(smokeSize(newSmoke(line.id), line)).toBe('')
  })

  it('uses the size noted on the smoke', () => {
    const smoke = newSmoke(line.id, { vitola: 'Toro', lengthIn: 6, ringGauge: 52 })
    expect(smokeSize(smoke, line)).toBe('Toro · 6 × 52')
  })

  it("falls back to the cigar's own size", () => {
    const sized = newCigar({ ...line, vitola: 'Exclusivo', lengthIn: 5.5, ringGauge: 50 })
    expect(smokeSize(newSmoke(sized.id), sized)).toBe('Exclusivo · 5½ × 50')
  })

  it('shows a name with no dimensions', () => {
    expect(smokeSize(newSmoke(line.id, { vitola: 'Salomon' }), line)).toBe('Salomon')
  })

  it('offers each common size once', () => {
    const names = STANDARD_SIZES.map((size) => size.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain('Robusto')
  })
})
