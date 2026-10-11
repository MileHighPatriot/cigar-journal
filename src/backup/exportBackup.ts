import { strToU8 } from 'fflate'
import { DB_VERSION } from '../data/db'
import type { Repository } from '../data/repository'
import type { Cigar, CustomTag, Lot, Photo, Smoke, WishlistItem } from '../data/types'
import { ZipWriter } from './zip'

export const BACKUP_FORMAT = 'cigar-journal-backup'
export const BACKUP_FORMAT_VERSION = 1

export interface BackupData {
  cigars: Cigar[]
  smokes: Smoke[]
  lots: Lot[]
  wishlist: WishlistItem[]
  customTags: CustomTag[]
  photos: Photo[]
}

export interface BackupManifest {
  format: typeof BACKUP_FORMAT
  formatVersion: number
  dbVersion: number
  exportedAt: string
  counts: Record<keyof BackupData, number> & { photoFiles: number }
}

export function backupFileName(date = new Date()): string {
  const two = (n: number) => String(n).padStart(2, '0')
  const day = `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`
  return `cigar-journal-${day}-${two(date.getHours())}${two(date.getMinutes())}.cigarbak`
}

/**
 * One file with everything: every record (deleted ones included, so deletes carry over)
 * and the image bytes of every photo that is not deleted.
 */
export async function buildBackup(
  repo: Repository,
  onProgress?: (done: number, total: number) => void,
): Promise<{ blob: Blob; manifest: BackupManifest }> {
  const [cigars, smokes, lots, wishlist, customTags, photos] = await Promise.all([
    repo.getAll('cigars'),
    repo.getAll('smokes'),
    repo.getAll('lots'),
    repo.getAll('wishlist'),
    repo.getAll('customTags'),
    repo.getAll('photos'),
  ])
  const data: BackupData = { cigars, smokes, lots, wishlist, customTags, photos }
  const live = photos.filter((photo) => !photo.deletedAt)

  // Check which photos have bytes first (a cheap key lookup), so the manifest can say
  // exactly how many are inside before any image is read.
  const stored: string[] = []
  for (const photo of live) {
    if (await repo.hasPhotoBytes(photo.id)) stored.push(photo.id)
  }

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    dbVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    counts: {
      cigars: cigars.length,
      smokes: smokes.length,
      lots: lots.length,
      wishlist: wishlist.length,
      customTags: customTags.length,
      photos: photos.length,
      photoFiles: stored.length,
    },
  }
  const zip = new ZipWriter()
  zip.add('manifest.json', strToU8(JSON.stringify(manifest, null, 1)), true)
  zip.add('data.json', strToU8(JSON.stringify(data)), true)
  // One photo at a time, so only one is ever held in memory.
  let done = 0
  for (const id of stored) {
    const [full, thumb] = await Promise.all([
      repo.getPhotoBytes('full', id),
      repo.getPhotoBytes('thumb', id),
    ])
    if (full && thumb) {
      zip.add(`photos/${id}.jpg`, new Uint8Array(full.bytes), false)
      zip.add(`thumbs/${id}.jpg`, new Uint8Array(thumb.bytes), false)
    }
    done += 1
    onProgress?.(done, stored.length)
  }
  return { blob: await zip.finish(), manifest }
}
