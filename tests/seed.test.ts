import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { IdbRepository } from '../src/data/repository'
import { type SeedCatalog, seedCatalog } from '../src/data/seed'
import catalogJson from '../src/seed/catalog.json'

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
    const text = JSON.stringify(catalog).toLowerCase()
    expect(text).not.toContain('check the band')
    expect(text).not.toContain('—')
  })
})

describe('seeding', () => {
  it('adds every cigar the first time and nothing the second time', async () => {
    const repo = await freshRepo()
    expect(await seedCatalog(repo, catalog)).toHaveLength(catalog.cigars.length)
    expect(await seedCatalog(repo, catalog)).toHaveLength(0)
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

describe('a device that seeded the first, smaller catalog', () => {
  it('gains the new cigars and keeps its own edits', async () => {
    const repo = await freshRepo()
    const first = { seedVersion: 1, cigars: catalog.cigars.slice(0, 127) }
    await seedCatalog(repo, first)
    const [mine] = await repo.getAll('cigars')
    if (!mine) throw new Error('seed is empty')
    await repo.put('cigars', { ...mine, notes: 'My favorite' })

    const added = await seedCatalog(repo, catalog)

    expect(added).toHaveLength(catalog.cigars.length - 127)
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
