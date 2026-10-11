import type { Repository } from './repository'
import type { Cigar } from './types'

export interface SeedCatalog {
  seedVersion: number
  cigars: Cigar[]
  /**
   * By cigar id: what the catalog before this one said, for each detail that has since been
   * corrected. A value that still matches came with the old list, so it is safe to replace.
   */
  previous?: Record<string, Partial<Cigar>>
}

export interface SeedResult {
  /** Cigars new to this device. */
  added: number
  /** Seeded cigars nobody had touched, replaced with the newer details. */
  refreshed: number
  /** Cigars Kohlton had edited, where only the empty fields were filled in. */
  filled: number
  /** Seeded cigars dropped from the list, hidden here because nothing refers to them. */
  retired: number
}

/** A seeded cigar exactly as it shipped: never edited, confirmed, or deleted by hand. */
export function isUntouchedSeed(cigar: Cigar): boolean {
  return cigar.source === 'seed' && cigar.updatedAt === cigar.createdAt
}

function isBlank(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  )
}

const NEVER_FILLED = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt', 'confirmed', 'source'])

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Keeps everything Kohlton entered. The catalog's value is taken only where his is empty, or
 * where his is still the old catalog's value, which means he never changed it.
 */
function fillBlanks(mine: Cigar, fresh: Cigar, was: Partial<Cigar> = {}): Cigar | null {
  let changed = false
  const next: Record<string, unknown> = { ...mine }
  const old: Record<string, unknown> = was
  for (const [key, value] of Object.entries(fresh)) {
    if (NEVER_FILLED.has(key) || same(next[key], value)) continue
    const untouched = key in old && same(next[key], old[key])
    if ((isBlank(next[key]) && !isBlank(value)) || untouched) {
      next[key] = value
      changed = true
    }
  }
  return changed ? (next as unknown as Cigar) : null
}

/**
 * Brings this device's cigar list up to the catalog that ships with the app. Runs once per
 * catalog version. Ids are fixed in the catalog, so every device ends up with the same records.
 *
 * - A cigar this device has never seen is added.
 * - A seeded cigar nobody touched is replaced with the newer details.
 * - A cigar Kohlton edited keeps his values. Its empty fields are filled, and a detail he
 *   never changed from the old catalog is corrected.
 * - A seeded cigar that is no longer in the catalog is hidden, unless a smoke, a humidor
 *   lot, or a wish refers to it or he edited it.
 *
 * None of this bumps updatedAt, so untouched seeded cigars still never sync.
 */
export async function seedCatalog(repo: Repository, catalog: SeedCatalog): Promise<SeedResult> {
  const result: SeedResult = { added: 0, refreshed: 0, filled: 0, retired: 0 }
  const done = (await repo.getMeta('seedVersion')) ?? 0
  if (done >= catalog.seedVersion) return result

  const existing = new Map((await repo.getAll('cigars')).map((cigar) => [cigar.id, cigar]))
  const inCatalog = new Set(catalog.cigars.map((cigar) => cigar.id))
  const writes: Cigar[] = []

  for (const fresh of catalog.cigars) {
    const mine = existing.get(fresh.id)
    if (!mine) {
      writes.push(fresh)
      result.added += 1
    } else if (isUntouchedSeed(mine)) {
      if (JSON.stringify(mine) !== JSON.stringify(fresh)) {
        writes.push(fresh)
        result.refreshed += 1
      }
    } else {
      const filled = fillBlanks(mine, fresh, catalog.previous?.[fresh.id])
      if (filled) {
        writes.push(filled)
        result.filled += 1
      }
    }
  }

  const referenced = new Set<string>()
  for (const store of ['smokes', 'lots', 'wishlist'] as const) {
    for (const record of await repo.getAll(store)) referenced.add(record.cigarId)
  }
  for (const mine of existing.values()) {
    if (inCatalog.has(mine.id) || !isUntouchedSeed(mine) || mine.deletedAt) continue
    if (referenced.has(mine.id)) continue
    // deletedAt is set without touching updatedAt, so it stays an untouched seed and never syncs.
    writes.push({ ...mine, deletedAt: mine.updatedAt })
    result.retired += 1
  }

  await repo.putMany({ cigars: writes })
  await repo.setMeta('seedVersion', catalog.seedVersion)
  return result
}
