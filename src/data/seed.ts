import type { Repository } from './repository'
import type { Cigar } from './types'

export interface SeedCatalog {
  seedVersion: number
  cigars: Cigar[]
}

/**
 * Adds seeded cigars once per device. Ids are fixed in the catalog file, so two devices
 * seed identical records. Ids already present (deleted ones included) are left alone.
 */
export async function seedCatalog(repo: Repository, catalog: SeedCatalog): Promise<Cigar[]> {
  const done = (await repo.getMeta('seedVersion')) ?? 0
  if (done >= catalog.seedVersion) return []
  const existing = new Set((await repo.getAll('cigars')).map((cigar) => cigar.id))
  const fresh = catalog.cigars.filter((cigar) => !existing.has(cigar.id))
  await repo.putMany({ cigars: fresh })
  await repo.setMeta('seedVersion', catalog.seedVersion)
  return fresh
}
