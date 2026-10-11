import { type JournalDatabase, openJournalDb } from './db'
import type { Meta, PhotoBytes, RecordMap, StoreName } from './types'
import { STORE_NAMES } from './types'

export type RecordBatch = { [S in StoreName]?: RecordMap[S][] }

/**
 * The only code that touches IndexedDB. A Phase 2 sync engine reads and writes through
 * this same interface (changedSince + putMany).
 */
export interface Repository {
  getAll<S extends StoreName>(store: S): Promise<RecordMap[S][]>
  /** Stamps updatedAt, writes, and resolves only once the transaction has completed. */
  put<S extends StoreName>(store: S, record: RecordMap[S]): Promise<RecordMap[S]>
  /** Writes records exactly as given (import, seed, sync). One transaction for all stores. */
  putMany(batch: RecordBatch): Promise<void>
  softDelete<S extends StoreName>(store: S, id: string): Promise<RecordMap[S] | undefined>
  restore<S extends StoreName>(store: S, id: string): Promise<RecordMap[S] | undefined>
  changedSince<S extends StoreName>(store: S, iso: string): Promise<RecordMap[S][]>
  getPhotoBytes(size: 'full' | 'thumb', id: string): Promise<PhotoBytes | undefined>
  hasPhotoBytes(id: string): Promise<boolean>
  putPhotoBytes(full: PhotoBytes, thumb: PhotoBytes): Promise<void>
  deletePhotoBytes(ids: string[]): Promise<void>
  getMeta<K extends keyof Meta>(key: K): Promise<Meta[K] | undefined>
  setMeta<K extends keyof Meta>(key: K, value: Meta[K]): Promise<void>
  /** Clears this app's own stores only. Meta is kept unless asked. */
  clearAll(options?: { keepMeta?: boolean }): Promise<void>
}

export function nowIso(): string {
  return new Date().toISOString()
}

export class IdbRepository implements Repository {
  private constructor(private db: JournalDatabase) {}

  static async open(name?: string): Promise<IdbRepository> {
    return new IdbRepository(await openJournalDb(name))
  }

  close() {
    this.db.close()
  }

  getAll<S extends StoreName>(store: S): Promise<RecordMap[S][]> {
    return this.db.getAll(store) as Promise<RecordMap[S][]>
  }

  async put<S extends StoreName>(store: S, record: RecordMap[S]): Promise<RecordMap[S]> {
    const stamped = { ...record, updatedAt: nowIso() }
    const tx = this.db.transaction(store, 'readwrite')
    // biome-ignore lint/suspicious/noExplicitAny: store name and record type are paired by S
    await (tx.store as any).put(stamped)
    await tx.done
    return stamped
  }

  async putMany(batch: RecordBatch): Promise<void> {
    const names = STORE_NAMES.filter((name) => (batch[name]?.length ?? 0) > 0)
    if (names.length === 0) return
    const tx = this.db.transaction(names, 'readwrite')
    for (const name of names) {
      // biome-ignore lint/suspicious/noExplicitAny: store name and record type are paired
      const store = tx.objectStore(name) as any
      for (const record of batch[name] ?? []) store.put(record)
    }
    await tx.done
  }

  async softDelete<S extends StoreName>(store: S, id: string) {
    const existing = (await this.db.get(store, id)) as RecordMap[S] | undefined
    if (!existing) return undefined
    return this.put(store, { ...existing, deletedAt: nowIso() })
  }

  async restore<S extends StoreName>(store: S, id: string) {
    const existing = (await this.db.get(store, id)) as RecordMap[S] | undefined
    if (!existing) return undefined
    return this.put(store, { ...existing, deletedAt: null })
  }

  changedSince<S extends StoreName>(store: S, iso: string): Promise<RecordMap[S][]> {
    const range = IDBKeyRange.lowerBound(iso, true)
    // biome-ignore lint/suspicious/noExplicitAny: every synced store has an updatedAt index
    return (this.db as any).getAllFromIndex(store, 'updatedAt', range)
  }

  getPhotoBytes(size: 'full' | 'thumb', id: string) {
    return this.db.get(size === 'full' ? 'photoFull' : 'photoThumb', id)
  }

  async hasPhotoBytes(id: string) {
    return (await this.db.getKey('photoFull', id)) !== undefined
  }

  async putPhotoBytes(full: PhotoBytes, thumb: PhotoBytes) {
    const tx = this.db.transaction(['photoFull', 'photoThumb'], 'readwrite')
    tx.objectStore('photoFull').put(full)
    tx.objectStore('photoThumb').put(thumb)
    await tx.done
  }

  async deletePhotoBytes(ids: string[]) {
    if (ids.length === 0) return
    const tx = this.db.transaction(['photoFull', 'photoThumb'], 'readwrite')
    for (const id of ids) {
      tx.objectStore('photoFull').delete(id)
      tx.objectStore('photoThumb').delete(id)
    }
    await tx.done
  }

  async getMeta<K extends keyof Meta>(key: K) {
    const row = await this.db.get('meta', key)
    return row?.value as Meta[K] | undefined
  }

  async setMeta<K extends keyof Meta>(key: K, value: Meta[K]) {
    await this.db.put('meta', { key, value })
  }

  /** Dev tools only: removes fake records for good. The app itself only soft-deletes. */
  async hardDeleteByPrefix(prefix: string): Promise<number> {
    const names = [...STORE_NAMES, 'photoFull', 'photoThumb'] as const
    const tx = this.db.transaction([...names], 'readwrite')
    const range = IDBKeyRange.bound(prefix, `${prefix}￿`)
    let removed = 0
    for (const name of names) {
      const store = tx.objectStore(name)
      removed += await store.count(range)
      await store.delete(range)
    }
    await tx.done
    return removed
  }

  async clearAll(options: { keepMeta?: boolean } = {}) {
    const names = [...STORE_NAMES, 'photoFull', 'photoThumb'] as const
    const all = options.keepMeta ? [...names] : [...names, 'meta' as const]
    const tx = this.db.transaction(all, 'readwrite')
    for (const name of all) tx.objectStore(name).clear()
    await tx.done
  }
}
