import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { newSmoke } from '../src/data/factories'
import { IdbRepository } from '../src/data/repository'
import { type SeedCatalog, seedCatalog } from '../src/data/seed'
import catalogJson from '../src/seed/catalog.json'
import version from '../src/seed/version.json'

const catalog = catalogJson as SeedCatalog
let n = 0
const freshRepo = () => IdbRepository.open(`seed-test-${++n}`)

describe('seed catalog file', () => {
  const total = catalog.cigars.length

  it('has a big list of unconfirmed cigars with unique ids', () => {
    expect(total).toBeGreaterThan(900)
    expect(new Set(catalog.cigars.map((c) => c.id)).size).toBe(total)
    expect(catalog.cigars.every((c) => c.confirmed === false && c.source === 'seed')).toBe(true)
    expect(catalog.cigars.every((c) => c.vitola === null && c.lengthIn === null)).toBe(true)
  })

  it('includes the eight house cigars', () => {
    const house = catalog.cigars.filter((c) => c.brand === 'Stanley Pappas')
    expect(house.map((c) => c.line)).toContain('Lady Victoria')
    expect(house).toHaveLength(8)
  })

  it('carries no placeholder text', () => {
    // The lounge sheet says "check the band" where it has no answer. A researched note may
    // fairly use those words, so only the sheet's own fields are held to this.
    const facts = catalog.cigars.map(({ researchNote, about, ...rest }) => rest)
    expect(JSON.stringify(facts).toLowerCase()).not.toContain('check the band')
    expect(JSON.stringify(catalog)).not.toContain('—')
  })
})

describe('seeding', () => {
  it('adds every cigar the first time and nothing the second time', async () => {
    const repo = await freshRepo()
    expect((await seedCatalog(repo, catalog)).added).toBe(catalog.cigars.length)
    expect(await seedCatalog(repo, catalog)).toEqual({
      added: 0,
      refreshed: 0,
      filled: 0,
      retired: 0,
    })
    expect(await repo.getAll('cigars')).toHaveLength(catalog.cigars.length)
  })

  it('never overwrites an edit or brings back a deleted seed cigar', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, catalog)
    const [first, second] = await repo.getAll('cigars')
    if (!first || !second) throw new Error('seed is empty')
    await repo.put('cigars', { ...first, vitola: 'Robusto', confirmed: true })
    await repo.softDelete('cigars', second.id)

    // A later catalog version runs the seed again.
    await seedCatalog(repo, { ...catalog, seedVersion: catalog.seedVersion + 1 })

    const after = await repo.getAll('cigars')
    expect(after).toHaveLength(catalog.cigars.length)
    expect(after.find((c) => c.id === first.id)?.vitola).toBe('Robusto')
    expect(after.find((c) => c.id === second.id)?.deletedAt).not.toBeNull()
  })
})

describe('the lounge list on a cigar', () => {
  it('is not something the catalog knows about', () => {
    // Lounge entries live on the cigar record. The catalog must never carry one, or a
    // refresh could put a stick on or off the lounge list.
    expect(catalog.cigars.some((cigar) => 'lounge' in cigar)).toBe(false)
  })

  it('survives a catalog refresh', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, catalog)
    const [stick] = await repo.getAll('cigars')
    if (!stick) throw new Error('seed is empty')
    const lounge = {
      addedAt: '2026-10-15T20:00:00.000Z',
      price: 12,
      shelf: 'top shelf',
      note: '',
      known: 'learning' as const,
      studiedAt: null,
    }
    await repo.put('cigars', { ...stick, lounge })

    // The next catalog corrects a detail on that cigar.
    const fresh = catalog.cigars.map((cigar) =>
      cigar.id === stick.id ? { ...cigar, about: 'Corrected in the next list.' } : cigar,
    )
    await seedCatalog(repo, {
      seedVersion: catalog.seedVersion + 1,
      cigars: fresh,
      previous: { [stick.id]: { about: stick.about } },
    })

    const after = (await repo.getAll('cigars')).find((cigar) => cigar.id === stick.id)
    expect(after?.lounge).toEqual(lounge)
    expect(after?.about).toBe('Corrected in the next list.')
  })
})

describe('a device that seeded the first, smaller catalog', () => {
  it('gains the new cigars and keeps its own edits', async () => {
    const repo = await freshRepo()
    const first = { seedVersion: 1, cigars: catalog.cigars.slice(0, 127) }
    await seedCatalog(repo, first)
    const [mine] = await repo.getAll('cigars')
    if (!mine) throw new Error('seed is empty')
    await repo.put('cigars', { ...mine, notes: 'My favorite' })

    const result = await seedCatalog(repo, catalog)

    expect(result.added).toBe(catalog.cigars.length - 127)
    const after = await repo.getAll('cigars')
    expect(after).toHaveLength(catalog.cigars.length)
    expect(after.find((c) => c.id === mine.id)?.notes).toBe('My favorite')
  })
})

describe('repository', () => {
  it('stamps updatedAt on put and finds changes since a time', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, catalog)
    const [first] = await repo.getAll('cigars')
    if (!first) throw new Error('seed is empty')
    const saved = await repo.put('cigars', { ...first, notes: 'Tried it' })
    expect(saved.updatedAt > first.updatedAt).toBe(true)
    const changed = await repo.changedSince('cigars', first.updatedAt)
    expect(changed.map((c) => c.id)).toEqual([first.id])
  })

  it('clears only its own stores and can keep device settings', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, catalog)
    await repo.clearAll({ keepMeta: true })
    expect(await repo.getAll('cigars')).toHaveLength(0)
    expect(await repo.getMeta('seedVersion')).toBe(catalog.seedVersion)
  })
})

describe('a newer catalog with researched details', () => {
  const base = catalog.cigars.slice(0, 4).map((cigar) => ({ ...cigar, binder: null, about: null }))
  const [a, b, c, d] = base
  if (!a || !b || !c || !d) throw new Error('seed is empty')
  const v1 = { seedVersion: 1, cigars: base }
  // Version 2: richer details for a, b, c; d has been dropped; e is new.
  const e = { ...a, id: 'brand-new-id', line: 'A New Line' }
  const v2 = {
    seedVersion: 2,
    cigars: [
      { ...a, binder: 'Nicaragua', about: 'Researched.', checked: true },
      { ...b, binder: 'Honduras', about: 'Researched.', checked: true },
      { ...c, binder: 'Mexico', about: 'Researched.', checked: true },
      e,
    ],
  }

  it('refreshes untouched cigars, fills blanks on edited ones, adds new ones, and hides dropped ones', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, v1)
    // He edited b: his binder must survive, and only the empty "about" gets filled.
    await repo.put('cigars', { ...b, binder: 'My own note', confirmed: true })

    const result = await seedCatalog(repo, v2)
    expect(result).toEqual({ added: 1, refreshed: 2, filled: 1, retired: 1 })

    const after = new Map((await repo.getAll('cigars')).map((cigar) => [cigar.id, cigar]))
    expect(after.get(a.id)).toMatchObject({ binder: 'Nicaragua', checked: true })
    expect(after.get(b.id)).toMatchObject({
      binder: 'My own note',
      about: 'Researched.',
      confirmed: true,
    })
    expect(after.get(d.id)?.deletedAt).not.toBeNull()
    expect(after.has('brand-new-id')).toBe(true)
  })

  it('leaves refreshed and hidden cigars as untouched seeds, so they still never sync', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, v1)
    await seedCatalog(repo, v2)
    const after = await repo.getAll('cigars')
    expect(after.every((cigar) => cigar.updatedAt === cigar.createdAt)).toBe(true)
  })

  it('keeps a dropped cigar when a smoke or a lot still refers to it', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, v1)
    await repo.putMany({ smokes: [newSmoke(d.id)] })
    const result = await seedCatalog(repo, v2)
    expect(result.retired).toBe(0)
    expect((await repo.getAll('cigars')).find((cigar) => cigar.id === d.id)?.deletedAt).toBeNull()
  })

  it('does not change the edit time of a cigar he edited', async () => {
    const repo = await freshRepo()
    await seedCatalog(repo, v1)
    const edited = await repo.put('cigars', { ...b, notes: 'Mine' })
    await seedCatalog(repo, v2)
    const after = (await repo.getAll('cigars')).find((cigar) => cigar.id === b.id)
    expect(after?.updatedAt).toBe(edited.updatedAt)
    expect(after?.binder).toBe('Honduras')
  })

  it('corrects an old catalog value on a cigar he touched, but never a value he typed', async () => {
    const repo = await freshRepo()
    const old = { ...c, wrapperType: 'Habano', country: 'Honduras' }
    await seedCatalog(repo, { seedVersion: 1, cigars: [old] })
    // He tapped "Looks right" and set the country himself. The wrapper is still the old guess.
    await repo.put('cigars', { ...old, confirmed: true, country: 'Nicaragua' })

    await seedCatalog(repo, {
      seedVersion: 2,
      cigars: [{ ...c, wrapperType: 'Sumatra', country: 'Dominican Republic', checked: true }],
      previous: { [c.id]: { wrapperType: 'Habano', country: 'Honduras' } },
    })
    const after = (await repo.getAll('cigars')).find((cigar) => cigar.id === c.id)
    expect(after).toMatchObject({ wrapperType: 'Sumatra', country: 'Nicaragua', confirmed: true })
  })
})

describe('catalog version file', () => {
  it('matches the catalog, so the app knows when to load it', () => {
    expect(version.seedVersion).toBe(catalog.seedVersion)
  })
})
