import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type {
  Cigar,
  CustomTag,
  Lot,
  Photo,
  PhotoBytes,
  Smoke,
  StoreName,
  WishlistItem,
} from './types'

// Other sites share this address, so the name must stay unique to this app.
export const DB_NAME = 'cigar-journal'
export const DB_VERSION = 1

export interface JournalDB extends DBSchema {
  cigars: { key: string; value: Cigar; indexes: { updatedAt: string } }
  smokes: {
    key: string
    value: Smoke
    indexes: { updatedAt: string; cigarId: string; lotId: string }
  }
  lots: { key: string; value: Lot; indexes: { updatedAt: string; cigarId: string } }
  wishlist: { key: string; value: WishlistItem; indexes: { updatedAt: string } }
  customTags: { key: string; value: CustomTag; indexes: { updatedAt: string } }
  photos: { key: string; value: Photo; indexes: { updatedAt: string; smokeId: string } }
  photoFull: { key: string; value: PhotoBytes }
  photoThumb: { key: string; value: PhotoBytes }
  meta: { key: string; value: { key: string; value: unknown } }
}

export type JournalDatabase = IDBPDatabase<JournalDB>

const EXTRA_INDEXES: Partial<Record<StoreName, string[]>> = {
  smokes: ['cigarId', 'lotId'],
  lots: ['cigarId'],
  photos: ['smokeId'],
}

/**
 * Schema changes after the first deploy must bump DB_VERSION and add a forward-only
 * step here, with a test. Never drop a store: real journal data lives on the phone.
 */
export function openJournalDb(name = DB_NAME): Promise<JournalDatabase> {
  return openDB<JournalDB>(name, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const synced: StoreName[] = ['cigars', 'smokes', 'lots', 'wishlist', 'customTags', 'photos']
        for (const name of synced) {
          const store = db.createObjectStore(name, { keyPath: 'id' })
          // biome-ignore lint/suspicious/noExplicitAny: idb's index typing is per-store
          const s = store as any
          s.createIndex('updatedAt', 'updatedAt')
          for (const index of EXTRA_INDEXES[name] ?? []) s.createIndex(index, index)
        }
        db.createObjectStore('photoFull', { keyPath: 'id' })
        db.createObjectStore('photoThumb', { keyPath: 'id' })
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    },
  })
}
