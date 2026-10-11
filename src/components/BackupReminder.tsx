import { ShieldAlert } from 'lucide-react'
import { Link } from 'wouter'
import { setMeta, useMeta, useStore } from '../data/store'
import { backupReminderText, backupStatus } from '../domain/backupStatus'
import { useSync } from '../sync/auto'

/** A quiet banner on the journal when the last backup is over a week old and things changed. */
export function BackupReminder() {
  const state = useStore()
  const lastExportAt = useMeta('lastExportAt')
  const snoozedUntil = useMeta('backupBannerSnoozedUntil')
  const sync = useSync()

  const status = backupStatus(
    {
      cigars: state.cigars.values(),
      smokes: state.smokes.values(),
      lots: state.lots.values(),
      wishlist: state.wishlist.values(),
      customTags: state.customTags.values(),
      photos: state.photos.values(),
    },
    lastExportAt ?? null,
  )
  const snoozed = snoozedUntil !== undefined && snoozedUntil > new Date().toISOString()
  // With sync on and working, the server already holds a second copy.
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const synced = sync.email !== null && sync.lastAt !== null && sync.lastAt > weekAgo
  if (!status.due || snoozed || synced) return null

  function later() {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString()
    void setMeta('backupBannerSnoozedUntil', tomorrow)
  }

  return (
    <div className="banner backup-reminder">
      <ShieldAlert size={20} strokeWidth={1.5} aria-hidden="true" />
      <p>{backupReminderText(status)}</p>
      <div className="banner-actions">
        <button type="button" className="btn btn-quiet" onClick={later}>
          Later
        </button>
        <Link href="/settings" className="btn btn-primary">
          Back up now
        </Link>
      </div>
    </div>
  )
}
