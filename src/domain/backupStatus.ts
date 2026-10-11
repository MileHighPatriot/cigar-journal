import type { Cigar, SyncFields } from '../data/types'

export const BACKUP_STALE_DAYS = 7

export interface BackupRecords {
  cigars: Iterable<Cigar>
  smokes: Iterable<SyncFields>
  lots: Iterable<SyncFields>
  wishlist: Iterable<SyncFields>
  customTags: Iterable<SyncFields>
  photos: Iterable<SyncFields>
}

export interface BackupStatus {
  /** Whole days since the last export, or null when there has never been one. */
  daysSince: number | null
  /** Journal entries added or changed since then. */
  smokes: number
  /** Everything else that changed: lots, wishlist, photos, tags, edited cigars. */
  other: number
  /** True when it has been over a week (or never) and something has changed. */
  due: boolean
}

function countAfter(records: Iterable<SyncFields>, since: string | null): number {
  let count = 0
  for (const record of records) {
    if (since === null ? !record.deletedAt : record.updatedAt > since) count += 1
  }
  return count
}

export function backupStatus(
  records: BackupRecords,
  lastExportAt: string | null,
  now = new Date(),
): BackupStatus {
  let cigars = 0
  for (const cigar of records.cigars) {
    // Untouched seeded cigars ship with the app, so they never count as unsaved work.
    const mine = cigar.source === 'manual' || cigar.updatedAt !== cigar.createdAt
    if (mine && (lastExportAt === null ? !cigar.deletedAt : cigar.updatedAt > lastExportAt)) {
      cigars += 1
    }
  }
  const smokes = countAfter(records.smokes, lastExportAt)
  const other =
    cigars +
    countAfter(records.lots, lastExportAt) +
    countAfter(records.wishlist, lastExportAt) +
    countAfter(records.customTags, lastExportAt) +
    countAfter(records.photos, lastExportAt)
  const daysSince =
    lastExportAt === null
      ? null
      : Math.max(0, Math.floor((now.getTime() - Date.parse(lastExportAt)) / 86_400_000))
  const stale = daysSince === null || daysSince > BACKUP_STALE_DAYS
  return { daysSince, smokes, other, due: stale && smokes + other > 0 }
}

export function backupReminderText(status: BackupStatus): string {
  const entries = `${status.smokes} ${status.smokes === 1 ? 'entry' : 'entries'}`
  if (status.daysSince === null) {
    return status.smokes > 0
      ? `No backup yet. ${entries} live only on this device.`
      : 'No backup yet. Your changes live only on this device.'
  }
  const days = `${status.daysSince} ${status.daysSince === 1 ? 'day' : 'days'}`
  return status.smokes > 0
    ? `Last backup ${days} ago. ${entries} new or changed since.`
    : `Last backup ${days} ago. You have changes since then.`
}
