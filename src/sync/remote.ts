import type { StoreName } from '../data/types'

/** One record as the server holds it. `data` is the whole record, exactly as stored on a device. */
export interface RemoteRow {
  store: StoreName
  id: string
  updatedAt: string
  deleted: boolean
  data: unknown
  /** When the server took it. Used as the "everything since" marker. */
  serverAt: string
}

export type OutgoingRow = Omit<RemoteRow, 'serverAt'>

/**
 * What the sync engine needs from a server. Supabase is one implementation; the tests
 * use an in-memory one. Swapping hosts later means writing another of these.
 */
export interface Remote {
  /** Rows the server took after `since`, oldest first. Null means everything. */
  pull(since: string | null): Promise<RemoteRow[]>
  /** The server keeps, per record, whichever copy has the newer updatedAt. */
  push(rows: OutgoingRow[]): Promise<void>
  uploadPhoto(id: string, full: ArrayBuffer, thumb: ArrayBuffer): Promise<void>
  /** Null when the other device has not uploaded it yet. */
  downloadPhoto(id: string): Promise<{ full: ArrayBuffer; thumb: ArrayBuffer } | null>
  removePhotos(ids: string[]): Promise<void>
}
