import { strFromU8 } from 'fflate'
import { mergeRecords } from '../data/merge'
import type { RecordBatch, Repository } from '../data/repository'
import { STORE_NAMES, type StoreName } from '../data/types'
import {
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  type BackupData,
  type BackupManifest,
} from './exportBackup'
import { scanZip } from './zip'

export class BackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupError'
  }
}

export interface BackupContents {
  manifest: BackupManifest
  data: BackupData
  /** Photos whose image bytes are inside the file. */
  photoIds: Set<string>
}

const PHOTO = /^photos\/(.+)\.jpg$/
const THUMB = /^thumbs\/(.+)\.jpg$/

/**
 * Reads the whole file and checks it before anything on the device is touched.
 * Throws BackupError with a plain message when the file is not a usable backup.
 */
export async function inspectBackup(file: Blob): Promise<BackupContents> {
  let manifest: BackupManifest | null = null
  let data: BackupData | null = null
  const photos = new Set<string>()
  const thumbs = new Set<string>()
  try {
    await scanZip(file, (name, bytes) => {
      if (name === 'manifest.json') manifest = JSON.parse(strFromU8(bytes))
      else if (name === 'data.json') data = JSON.parse(strFromU8(bytes))
      else {
        const photo = PHOTO.exec(name)
        const thumb = THUMB.exec(name)
        if (photo?.[1]) photos.add(photo[1])
        if (thumb?.[1]) thumbs.add(thumb[1])
      }
    })
  } catch {
    throw new BackupError('This file could not be read. It may be damaged or not a backup.')
  }
  const found = manifest as BackupManifest | null
  const records = data as BackupData | null
  if (!found || found.format !== BACKUP_FORMAT) {
    throw new BackupError('This is not a Cigar Journal backup file.')
  }
  if (found.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new BackupError('This backup was made by a newer version of the app. Update first.')
  }
  if (!records || STORE_NAMES.some((name) => !Array.isArray(records[name]))) {
    throw new BackupError('This backup is missing its data. It may be incomplete.')
  }
  const photoIds = new Set([...photos].filter((id) => thumbs.has(id)))
  if (photoIds.size !== found.counts.photoFiles) {
    throw new BackupError('This backup is missing some of its photos. It may be incomplete.')
  }
  return { manifest: found, data: records, photoIds }
}

export interface ImportSummary {
  added: number
  updated: number
  unchanged: number
  photosAdded: number
}

export function summaryText(summary: ImportSummary): string {
  return `Added ${summary.added}, updated ${summary.updated}, unchanged ${summary.unchanged}, photos added ${summary.photosAdded}.`
}

/**
 * Merge: per record, the newer updatedAt wins and ties keep the local copy.
 * Replace: everything on the device is cleared first. Call inspectBackup before this,
 * so a bad file is rejected while the device's data is still untouched.
 */
export async function applyBackup(
  repo: Repository,
  file: Blob,
  contents: BackupContents,
  mode: 'merge' | 'replace',
): Promise<ImportSummary> {
  const summary: ImportSummary = { added: 0, updated: 0, unchanged: 0, photosAdded: 0 }
  if (mode === 'replace') await repo.clearAll({ keepMeta: true })

  const batch: RecordBatch = {}
  for (const name of STORE_NAMES) {
    const local = await repo.getAll(name)
    // biome-ignore lint/suspicious/noExplicitAny: record type is paired with the store name
    const result = mergeRecords(local as any[], contents.data[name] as any[])
    // biome-ignore lint/suspicious/noExplicitAny: record type is paired with the store name
    ;(batch as any)[name as StoreName] = result.toWrite
    summary.added += result.added
    summary.updated += result.updated
    summary.unchanged += result.unchanged
  }
  // All records land in one transaction: either the whole import is there or none of it.
  await repo.putMany(batch)

  const livePhotos = new Set(
    (await repo.getAll('photos')).filter((photo) => !photo.deletedAt).map((photo) => photo.id),
  )
  let pendingFull: { id: string; bytes: Uint8Array } | null = null
  await scanZip(file, async (name, bytes) => {
    const full = PHOTO.exec(name)
    if (full?.[1]) {
      pendingFull = { id: full[1], bytes }
      return
    }
    const thumb = THUMB.exec(name)
    const id = thumb?.[1]
    const waiting = pendingFull as { id: string; bytes: Uint8Array } | null
    if (!id || !waiting || waiting.id !== id) return
    pendingFull = null
    // Image bytes never change, so they are only written when the device has none.
    if (!livePhotos.has(id) || (await repo.hasPhotoBytes(id))) return
    await repo.putPhotoBytes(
      { id, mime: 'image/jpeg', bytes: waiting.bytes.slice().buffer },
      { id, mime: 'image/jpeg', bytes: bytes.slice().buffer },
    )
    summary.photosAdded += 1
  })
  return summary
}
