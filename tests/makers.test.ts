import { describe, expect, it } from 'vitest'
import type { Cigar } from '../src/data/types'
import { makerIndex, makeSpotter, searchBrands, searchMakers } from '../src/domain/makers'
import { EXTRAS, MAKERS, MOVES, OWNERS, STORIES } from '../src/domain/makersData'
import catalog from '../src/seed/catalog.json'

const cigars = catalog.cigars as unknown as Cigar[]
const index = makerIndex(cigars)
const brand = (name: string) => {
  const entry = index.brands.find((item) => item.brand === name)
  if (!entry) throw new Error(`no brand ${name}`)
  return entry
}
const factoriesOf = (name: string) => brand(name).made.map((item) => item.factory.name)

describe('makers on file', () => {
  it('gives every maker and factory a key of its own and something to match', () => {
    const makerKeys = MAKERS.map((maker) => maker.key)
    const factories = MAKERS.flatMap((maker) => maker.factories)
    expect(new Set(makerKeys).size).toBe(makerKeys.length)
    expect(new Set(factories.map((factory) => factory.key)).size).toBe(factories.length)
    for (const factory of factories) expect(factory.match.length, factory.name).toBeGreaterThan(0)
  })

  it('has no em dash and only web addresses as sources', () => {
    const text = JSON.stringify({ MAKERS, OWNERS, EXTRAS, MOVES, STORIES })
    expect(text).not.toMatch(/[–—]/)
    const sources = [
      ...MAKERS.flatMap((maker) => maker.factories.flatMap((factory) => factory.sources)),
      ...Object.values(OWNERS).flatMap((owner) => owner.sources),
      ...EXTRAS.flatMap((extra) => extra.sources),
      ...MOVES.flatMap((move) => move.sources),
      ...STORIES.flatMap((story) => story.sources),
    ]
    for (const source of sources) expect(source).toMatch(/^https?:\/\/\S+$/)
  })

  it('backs every researched line, move, and story with a source', () => {
    for (const extra of EXTRAS) expect(extra.sources.length, extra.brand).toBeGreaterThan(0)
    for (const move of MOVES) expect(move.sources.length, move.brand).toBeGreaterThan(0)
    for (const story of STORIES) expect(story.sources.length, story.title).toBeGreaterThan(0)
  })

  it('names house brands the way the cigar list spells them', () => {
    const listed = new Set(index.brands.map((entry) => entry.brand))
    for (const maker of MAKERS) {
      for (const name of maker.house) expect(listed.has(name), `${maker.name}: ${name}`).toBe(true)
    }
  })
})

describe('matching a factory', () => {
  const spot = makeSpotter()
  const names = (text: string) => spot(text).map((item) => item.factory.name)

  it('keeps sister factories apart', () => {
    const esteli = names('Tabacalera AJ Fernandez Cigars de Nicaragua S.A.')
    const ocotal = names('San Lotano Factory (AJ Fernandez), Ocotal')
    expect(esteli).toHaveLength(1)
    expect(ocotal).toHaveLength(1)
    expect(esteli[0]).not.toBe(ocotal[0])
    expect(spot('My Father Cigars Honduras')).toHaveLength(1)
    expect(names('My Father Cigars Honduras')).not.toEqual(names('My Father Cigars S.A.'))
    expect(names('Fábrica de Puros Aladino at Las Lomas Jamastran')).not.toEqual(
      names('El Aladino (CLE factory), Danlí'),
    )
  })

  it('reads the same factory through its different spellings', () => {
    expect(names('Tabacos Valle de Jalapa S.A. (TABSA)')).toEqual(names('Aganorsa Leaf (Estelí)'))
    expect(names('STG Danlí')).toEqual(names('Honduras American Tobacco S.A. (HATSA)'))
    expect(names('La Gran Fábrica Drew Estate')).toEqual(names('La Gran Fabrica Drew Estate'))
  })

  it('finds both factories when a line is split between two', () => {
    expect(
      spot(
        "Nicaragua American Cigars S.A. (Tom's Blend), Fábrica de Tabacos Joya de Nicaragua S.A. (Michelle's Blend)",
      ),
    ).toHaveLength(2)
  })

  it('gives a factory nobody has researched a place of its own', () => {
    const found = spot('Some New Factory S.A.')
    expect(found).toHaveLength(1)
    expect(found[0]?.factory.match).toHaveLength(0)
    expect(spot('Some New Factory')[0]?.factory.key).toBe(found[0]?.factory.key)
  })
})

describe('the index over the cigar list', () => {
  it('places every cigar that has a factory', () => {
    const placed = new Set(
      index.brands.flatMap((entry) => entry.made.flatMap((item) => item.cigars.map((c) => c.id))),
    )
    const withFactory = cigars.filter((cigar) => cigar.factory && cigar.brand)
    expect(withFactory.length).toBeGreaterThan(2900)
    for (const cigar of withFactory) expect(placed.has(cigar.id), cigar.line).toBe(true)
  })

  it('shows the connections the video walks through', () => {
    // Tatuaje: one family, three countries.
    const tatuaje = brand('Tatuaje')
    expect(new Set(tatuaje.made.map((item) => item.maker.key)).size).toBe(1)
    expect(new Set(tatuaje.made.map((item) => item.factory.country)).size).toBe(3)
    // Ashton's Nicaraguan brands share the Garcia factory with Tatuaje.
    const garcia = tatuaje.made[0]?.maker.key
    expect(brand('La Aroma De Cuba').made[0]?.maker.key).toBe(garcia)
    expect(brand('San Cristobal').made[0]?.maker.key).toBe(garcia)
    expect(brand('Ashton').made[0]?.maker.key).toBe(brand('Arturo Fuente').made[0]?.maker.key)
    // Ferio Tego: one brand, makers in two countries.
    expect(brand('Ferio Tego').makerCount).toBeGreaterThan(1)
    // Dunbarton and Warped own no factory.
    expect(brand('Dunbarton').contract).toBe(true)
    expect(factoriesOf('Dunbarton').length).toBeGreaterThan(1)
    expect(brand('Warped').contract).toBe(true)
    // Foundation rolls at AJ Fernandez, whose own brand is his own.
    expect(brand('Foundation').made.some((item) => item.maker.key === 'aj-fernandez')).toBe(true)
    const own = brand('AJ Fernandez').made.filter((item) => item.maker.key === 'aj-fernandez')
    expect(own.length).toBeGreaterThan(0)
    expect(own.every((item) => item.house === true)).toBe(true)
    expect(brand('Diesel').made[0]?.house).toBe(false)
  })

  it('counts a maker with guests and one without', () => {
    const maker = (key: string) => index.makers.find((entry) => entry.maker.key === key)
    expect(maker('aj-fernandez')?.guestCount).toBeGreaterThan(10)
    expect(maker('aj-fernandez')?.factories).toHaveLength(2)
    expect(maker('padron')?.guestCount).toBe(0)
  })

  it('searches without minding accents and filters split brands', () => {
    expect(searchMakers(index.makers, 'esteli').length).toBeGreaterThan(10)
    expect(searchMakers(index.makers, 'tatuaje').length).toBe(1)
    const split = searchBrands(index.brands, '', 'split')
    expect(split.length).toBeGreaterThan(20)
    expect(split.every((entry) => entry.makerCount > 1)).toBe(true)
    expect(searchBrands(index.brands, 'fuente', 'all').map((e) => e.brand)).toContain('Ashton')
  })

  it('leaves the cigars as they were', () => {
    const before = JSON.stringify(cigars[0])
    makerIndex(cigars)
    expect(JSON.stringify(cigars[0])).toBe(before)
  })
})
