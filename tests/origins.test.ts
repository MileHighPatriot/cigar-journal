import { describe, expect, it } from 'vitest'
import {
  binderCountries,
  countriesIn,
  fillerCountries,
  wrapperCountries,
} from '../src/domain/origins'
import catalog from '../src/seed/catalog.json'
import sheet from '../src/seed/lounge-sheet.json'

describe('leaf countries', () => {
  it('reads the country the leaf was grown in', () => {
    expect(countriesIn('Ecuador')).toEqual(['Ecuador'])
    expect(countriesIn('USA')).toEqual(['United States'])
    expect(countriesIn('U.S.')).toEqual(['United States'])
    expect(countriesIn('U.S.A.')).toEqual(['United States'])
    expect(countriesIn('United States')).toEqual(['United States'])
    expect(countriesIn('Ecuador (rosado-colored)')).toEqual(['Ecuador'])
    expect(countriesIn('Connecticut Shade')).toEqual(['United States'])
    expect(countriesIn('Ecuadorian Connecticut')).toEqual(['Ecuador'])
    expect(countriesIn('Cuban-seed Nicaraguan')).toEqual(['Nicaragua'])
    expect(countriesIn('Dominican Republic (Cuban seed)')).toEqual(['Dominican Republic'])
    expect(countriesIn('Nicaragua + U.S.')).toEqual(['Nicaragua', 'United States'])
    expect(countriesIn('Dominican Republic, Nicaragua')).toEqual([
      'Dominican Republic',
      'Nicaragua',
    ])
    expect(countriesIn('Mexico (San Andrés)')).toEqual(['Mexico'])
    expect(countriesIn('Indonesia (Jember)')).toEqual(['Indonesia'])
    expect(
      countriesIn(
        'Three versions: Ecuadorian Connecticut, Nicaraguan Sun Grown or Nicaraguan Maduro',
      ),
    ).toEqual(['Ecuador', 'Nicaragua'])
    expect(countriesIn('Sumatra')).toEqual([])
    expect(countriesIn('Rotates by limited edition')).toEqual([])
    expect(
      countriesIn(
        'Five filler tobaccos from the Caribbean and Central America (countries not itemized)',
      ),
    ).toEqual([])
  })

  it('keeps a Connecticut-seed wrapper grown in Ecuador out of the United States', () => {
    expect(
      wrapperCountries({
        wrapperOrigin: null,
        wrapperLeaf: 'Ecuadorian Connecticut',
      }),
    ).toEqual(['Ecuador'])
    expect(
      wrapperCountries({
        wrapperOrigin: 'Ecuador',
        wrapperLeaf:
          'Three versions: Ecuadorian Connecticut, Nicaraguan Sun Grown or Nicaraguan Maduro',
      }),
    ).toEqual(['Ecuador', 'Nicaragua'])
  })

  it('reads a country from every lounge blend that names one', () => {
    const byId = new Map(catalog.cigars.map((cigar) => [cigar.id, cigar]))
    const skip = /not published|not itemized|rotates by limited|^\s*sumatra\s*$/i
    const misses: string[] = []
    for (const id of sheet.ids) {
      const cigar = byId.get(id)
      if (!cigar) continue
      const fields: [string, string | null, string[]][] = [
        ['wrapper', cigar.wrapperOrigin, countriesIn(cigar.wrapperOrigin)],
        ['leaf', cigar.wrapperLeaf, countriesIn(cigar.wrapperLeaf)],
        ['binder', cigar.binder, binderCountries(cigar)],
        ['filler', cigar.filler, fillerCountries(cigar)],
      ]
      for (const [label, value, parsed] of fields) {
        if (!value || skip.test(value)) continue
        if (parsed.length === 0) misses.push(`${cigar.brand} ${cigar.line} ${label}: ${value}`)
      }
    }
    expect(misses).toEqual([])
  })
})
