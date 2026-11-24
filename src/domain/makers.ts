import type { Cigar } from '../data/types'
import { fold } from './format'
import { type BrandOwner, EXTRAS, type Extra, MAKERS, MOVES, type Move, OWNERS } from './makersData'

/** One building where cigars are rolled. */
export interface Factory {
  key: string
  name: string
  town: string | null
  country: string | null
  /**
   * Pieces of the cigar list's factory text that mean this building, lowercase with no
   * accents. A piece that starts with "=" has to be the whole text.
   */
  match: string[]
  /** Pieces that rule this building out, for a sister factory with a longer name. */
  not?: string[]
  /** Names it went by before, in plain words. */
  was: string | null
  note: string | null
  sources: string[]
}

/** The family or company behind one or more factories. */
export interface Maker {
  key: string
  name: string
  /** Who owns or runs it. */
  owner: string | null
  /** Brands that belong to the maker itself. Every other brand rolled there is made for someone else. */
  house: string[]
  factories: Factory[]
}

/** A brand at one factory: the cigars on his list rolled there, and researched lines that are not on it. */
export interface Made {
  maker: Maker
  factory: Factory
  brand: string
  /** True when the brand belongs to the maker. Null when nobody on file says. */
  house: boolean | null
  cigars: Cigar[]
  extras: Extra[]
}

export interface BrandEntry {
  brand: string
  owner: BrandOwner | null
  made: Made[]
  /** How many different makers roll it. */
  makerCount: number
  /** Rolled, at least in part, by a maker that does not own the brand. */
  contract: boolean
  moves: Move[]
}

export interface FactoryEntry {
  factory: Factory
  brands: Made[]
}

export interface MakerEntry {
  maker: Maker
  /** False for a factory that is only a name in the cigar list, with nothing researched about it. */
  known: boolean
  factories: FactoryEntry[]
  brandCount: number
  /** Brands rolled here for another company. */
  guestCount: number
}

export interface MakerIndex {
  makers: MakerEntry[]
  brands: BrandEntry[]
  factoryCount: number
}

function hits(factory: Factory, text: string): boolean {
  if (factory.not?.some((piece) => text.includes(piece))) return false
  return factory.match.some((piece) =>
    piece.startsWith('=') ? text === piece.slice(1) : text.includes(piece),
  )
}

/** A factory nobody has researched: grouped by its name with the company endings taken off. */
function looseKey(text: string): string {
  return text
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(s\.?a\.?s?|s\.?r\.?l\.?|s\. de r\.l\.|de c\.v\.|co\.?|factory|cigars?)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type Spot = { maker: Maker; factory: Factory }

/**
 * Which factories a cigar's factory text names. Most name one. A few name two, where a
 * line is split between them. Text that matches nothing on file becomes a factory of its own.
 */
export function makeSpotter(makers: Maker[] = MAKERS): (text: string) => Spot[] {
  const seen = new Map<string, Spot[]>()
  const loose = new Map<string, Spot>()
  return (raw) => {
    const text = fold(raw).trim()
    if (!text) return []
    const cached = seen.get(text)
    if (cached) return cached
    const spots: Spot[] = []
    for (const maker of makers) {
      for (const factory of maker.factories) {
        if (hits(factory, text)) spots.push({ maker, factory })
      }
    }
    if (spots.length === 0) {
      const key = looseKey(text) || text
      let spot = loose.get(key)
      if (!spot) {
        const factory: Factory = {
          key: `loose-${key}`,
          name: raw.trim(),
          town: null,
          country: null,
          match: [],
          was: null,
          note: null,
          sources: [],
        }
        spot = {
          maker: {
            key: factory.key,
            name: factory.name,
            owner: null,
            house: [],
            factories: [factory],
          },
          factory,
        }
        loose.set(key, spot)
      }
      spots.push(spot)
    }
    seen.set(text, spots)
    return spots
  }
}

const byName = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })

/** Brand names differ in small ways between lists ("Padron", "Padrón"). */
const brandKey = (brand: string) => fold(brand).replace(/[^a-z0-9]+/g, '')

/** Everything the tab shows, worked out from the cigar list and the research on file. Saves nothing. */
export function makerIndex(cigars: Iterable<Cigar>): MakerIndex {
  const spot = makeSpotter()
  const made = new Map<string, Made>()
  const names = new Map<string, string>()
  const nameOf = (brand: string) => {
    const key = brandKey(brand)
    const known = names.get(key)
    if (known) return known
    names.set(key, brand)
    return brand
  }
  const slot = (where: Spot, brand: string): Made => {
    const name = nameOf(brand)
    const key = `${where.factory.key}|${brandKey(name)}`
    let entry = made.get(key)
    if (!entry) {
      entry = { ...where, brand: name, house: null, cigars: [], extras: [] }
      made.set(key, entry)
    }
    return entry
  }

  for (const cigar of cigars) {
    if (cigar.deletedAt || !cigar.factory || !cigar.brand) continue
    for (const where of spot(cigar.factory)) slot(where, cigar.brand).cigars.push(cigar)
  }
  for (const extra of EXTRAS) {
    for (const where of spot(extra.factory)) slot(where, extra.brand).extras.push(extra)
  }

  const owners = new Map(Object.entries(OWNERS).map(([brand, owner]) => [brandKey(brand), owner]))
  const byBrand = new Map<string, Made[]>()
  for (const entry of made.values()) {
    const list = byBrand.get(entry.brand) ?? []
    list.push(entry)
    byBrand.set(entry.brand, list)
  }

  const brands: BrandEntry[] = []
  for (const [brand, list] of byBrand) {
    const owner = owners.get(brandKey(brand)) ?? null
    const makerKeys = new Set(list.map((entry) => entry.maker.key))
    for (const entry of list) {
      const known = entry.maker.factories[0]?.match.length !== 0
      if (entry.maker.house.some((name) => brandKey(name) === brandKey(brand))) entry.house = true
      else if (known || owner?.ownsFactory === false) entry.house = false
      else if (owner?.ownsFactory === true && makerKeys.size === 1) entry.house = true
      entry.cigars.sort((a, b) => byName(a.line, b.line))
    }
    list.sort((a, b) => b.cigars.length - a.cigars.length || byName(a.factory.name, b.factory.name))
    brands.push({
      brand,
      owner,
      made: list,
      makerCount: makerKeys.size,
      contract: list.some((entry) => entry.house === false),
      moves: MOVES.filter((move) => brandKey(move.brand) === brandKey(brand)),
    })
  }
  brands.sort((a, b) => byName(a.brand, b.brand))

  const byMaker = new Map<string, MakerEntry>()
  for (const entry of made.values()) {
    let maker = byMaker.get(entry.maker.key)
    if (!maker) {
      maker = {
        maker: entry.maker,
        known: entry.maker.factories[0]?.match.length !== 0,
        factories: [],
        brandCount: 0,
        guestCount: 0,
      }
      byMaker.set(entry.maker.key, maker)
    }
    let factory = maker.factories.find((item) => item.factory.key === entry.factory.key)
    if (!factory) {
      factory = { factory: entry.factory, brands: [] }
      maker.factories.push(factory)
    }
    factory.brands.push(entry)
  }
  const makers = [...byMaker.values()]
  for (const maker of makers) {
    const order = maker.maker.factories.map((factory) => factory.key)
    maker.factories.sort((a, b) => order.indexOf(a.factory.key) - order.indexOf(b.factory.key))
    const all = new Set<string>()
    const guests = new Set<string>()
    for (const factory of maker.factories) {
      // Their own brands first, then the rest by how many lines are on the list.
      factory.brands.sort(
        (a, b) =>
          Number(b.house === true) - Number(a.house === true) ||
          b.cigars.length - a.cigars.length ||
          byName(a.brand, b.brand),
      )
      for (const entry of factory.brands) {
        all.add(entry.brand)
        if (entry.house === false) guests.add(entry.brand)
      }
    }
    maker.brandCount = all.size
    maker.guestCount = guests.size
  }
  makers.sort(
    (a, b) =>
      Number(b.known) - Number(a.known) ||
      b.brandCount - a.brandCount ||
      byName(a.maker.name, b.maker.name),
  )

  return {
    makers,
    brands,
    factoryCount: makers.reduce((sum, maker) => sum + maker.factories.length, 0),
  }
}

/** "Estelí and Ocotal, Nicaragua", or as much of that as is on file. */
export function placeOf(factory: Factory): string {
  return [factory.town, factory.country].filter(Boolean).join(', ')
}

/** Where a maker's factories are, each country once. */
export function placesOf(maker: Maker): string {
  const seen = new Set<string>()
  for (const factory of maker.factories) {
    const place = placeOf(factory)
    if (place) seen.add(place)
  }
  return [...seen].join(' · ')
}

function has(query: string, ...parts: (string | null | undefined)[]): boolean {
  return parts.some((part) => part && fold(part).includes(query))
}

export function searchMakers(makers: MakerEntry[], text: string): MakerEntry[] {
  const query = fold(text).trim()
  if (!query) return makers
  return makers.filter(
    (entry) =>
      has(query, entry.maker.name, entry.maker.owner) ||
      entry.factories.some(
        (item) =>
          has(
            query,
            item.factory.name,
            item.factory.town,
            item.factory.country,
            item.factory.was,
          ) || item.brands.some((brand) => has(query, brand.brand)),
      ),
  )
}

export type BrandFilter = 'all' | 'split' | 'contract'

export function searchBrands(
  brands: BrandEntry[],
  text: string,
  filter: BrandFilter,
): BrandEntry[] {
  const query = fold(text).trim()
  return brands.filter((entry) => {
    if (filter === 'split' && entry.makerCount < 2) return false
    if (filter === 'contract' && !entry.contract) return false
    if (!query) return true
    return (
      has(query, entry.brand, entry.owner?.owner, entry.owner?.people) ||
      entry.made.some((item) =>
        has(query, item.maker.name, item.factory.name, item.factory.town, item.factory.country),
      )
    )
  })
}
