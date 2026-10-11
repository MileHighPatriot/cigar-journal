import { Download, FileSpreadsheet, RotateCcw, Share, ShieldCheck, Upload } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  canShareFile,
  importFile,
  makeBackup,
  markExported,
  prefersShare,
  saveFileNow,
} from '../backup/actions'
import { smokesToCsv } from '../backup/csv'
import { backupFileName } from '../backup/exportBackup'
import {
  type BackupContents,
  BackupError,
  type ImportSummary,
  inspectBackup,
  summaryText,
} from '../backup/importBackup'
import { Sheet } from '../components/Sheet'
import { showToast } from '../components/toast'
import { describeError, getRepo, useMeta, useStore } from '../data/store'
import { backupStatus } from '../domain/backupStatus'
import { formatDateLong, formatTime, plural } from '../domain/format'
import { installSteps, isIos, isStandalone, requestPersist, storageEstimate } from '../pwa/storage'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const live = <T extends { deletedAt: string | null }>(records: Iterable<T>) =>
  [...records].filter((record) => !record.deletedAt)

type Pending = { file: File; contents: BackupContents; mode: 'merge' | 'replace' }

export function Settings() {
  const state = useStore()
  const lastExportAt = useMeta('lastExportAt')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState<{ file: File; url: string } | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [armed, setArmed] = useState(false)
  const [result, setResult] = useState<ImportSummary | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [usage, setUsage] = useState<{ usage: number | null; quota: number | null } | null>(null)
  const mergeInput = useRef<HTMLInputElement>(null)
  const restoreInput = useRef<HTMLInputElement>(null)

  const counts = useMemo(
    () => ({
      smokes: live(state.smokes.values()).length,
      lots: live(state.lots.values()).length,
      photos: live(state.photos.values()).length,
      cigars: live(state.cigars.values()).length,
      mine: live(state.cigars.values()).filter((cigar) => cigar.source === 'manual').length,
    }),
    [state.smokes, state.lots, state.photos, state.cigars],
  )
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
  const unsaved = status.smokes + status.other

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh the numbers after photos change
  useEffect(() => {
    navigator.storage
      ?.persisted?.()
      .then(setPersisted)
      .catch(() => setPersisted(false))
    void storageEstimate().then(setUsage)
  }, [state.photos])

  function closeReady() {
    if (ready) URL.revokeObjectURL(ready.url)
    setReady(null)
  }

  async function exportBackup() {
    setError(null)
    setBusy('Packing your journal')
    try {
      const { blob } = await makeBackup((done, total) =>
        setBusy(`Packing photos, ${done} of ${total}`),
      )
      const file = new File([blob], backupFileName(), { type: 'application/octet-stream' })
      // The file is handed over from a fresh tap in the sheet. Sharing straight from here
      // would fail, because the browser only allows it right after a tap.
      setReady({ file, url: URL.createObjectURL(file) })
    } catch (caught) {
      setError(describeError(caught))
    } finally {
      setBusy(null)
    }
  }

  async function share() {
    if (!ready) return
    try {
      await navigator.share({ files: [ready.file] })
      await markExported()
      closeReady()
      showToast({ message: 'Backup saved' })
    } catch {
      // Closing the share sheet without picking anything is not an error.
    }
  }

  async function picked(event: ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    setResult(null)
    setBusy('Checking the backup')
    try {
      const contents = await inspectBackup(file)
      setArmed(false)
      setPending({ file, contents, mode })
    } catch (caught) {
      setError(caught instanceof BackupError ? caught.message : describeError(caught))
    } finally {
      setBusy(null)
    }
  }

  async function runImport() {
    if (!pending) return
    if (pending.mode === 'replace' && !armed) {
      setArmed(true)
      return
    }
    setBusy(pending.mode === 'replace' ? 'Restoring' : 'Importing')
    try {
      setResult(await importFile(pending.file, pending.contents, pending.mode))
      setPending(null)
    } catch (caught) {
      setError(describeError(caught))
      setPending(null)
    } finally {
      setBusy(null)
    }
  }

  async function exportCsv() {
    const csv = smokesToCsv(state.smokes.values(), state.cigars)
    const day = backupFileName().slice('cigar-journal-'.length, 'cigar-journal-'.length + 10)
    const file = new File([csv], `cigar-journal-smokes-${day}.csv`, { type: 'text/csv' })
    if (await saveFileNow(file)) showToast({ message: 'CSV saved' })
  }

  const inBackup = pending
    ? {
        smokes: live(pending.contents.data.smokes).length,
        lots: live(pending.contents.data.lots).length,
        photos: pending.contents.photoIds.size,
      }
    : null
  const installed = isStandalone()

  return (
    <div className="page settings">
      <header className="hero">
        <span className="hero-glow" aria-hidden="true" />
        <h1>Settings</h1>
        <p className="backup-state">
          <span className={unsaved > 0 ? 'state-dot is-due' : 'state-dot'} aria-hidden="true" />
          {lastExportAt
            ? `Last backup ${formatDateLong(lastExportAt)} at ${formatTime(lastExportAt)}`
            : 'No backup yet'}
        </p>
        <dl className="hero-facts">
          <div>
            <dt>Smokes</dt>
            <dd className="num">{counts.smokes}</dd>
          </div>
          <div>
            <dt>Photos</dt>
            <dd className="num">{counts.photos}</dd>
          </div>
          <div>
            <dt>Not backed up</dt>
            <dd className="num">{unsaved}</dd>
          </div>
        </dl>
      </header>

      {busy && (
        <p className="banner" role="status">
          {busy}
        </p>
      )}
      {error && (
        <p className="banner error-text" role="alert">
          {error}
        </p>
      )}
      {result && (
        <p className="banner" role="status">
          <ShieldCheck size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Done. {summaryText(result)}</span>
        </p>
      )}

      <div className="settings-grid">
        <section className="card settings-card">
          <h2>Backup</h2>
          <p className="muted">
            One file holds everything, photos included. AirDrop it to your other device and import
            it there.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy !== null}
            onClick={() => void exportBackup()}
          >
            <Download size={20} strokeWidth={1.5} aria-hidden="true" />
            Export backup
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={busy !== null}
            onClick={() => mergeInput.current?.click()}
          >
            <Upload size={20} strokeWidth={1.5} aria-hidden="true" />
            Import backup
          </button>
          <p className="muted settings-note">
            Import adds what is new and keeps the newer copy of anything on both devices.
          </p>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={busy !== null}
            onClick={() => void exportCsv()}
          >
            <FileSpreadsheet size={20} strokeWidth={1.5} aria-hidden="true" />
            Export CSV
          </button>
          <p className="muted settings-note">A spreadsheet of your finished smokes, no photos.</p>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={busy !== null}
            onClick={() => restoreInput.current?.click()}
          >
            <RotateCcw size={20} strokeWidth={1.5} aria-hidden="true" />
            Restore (replace everything)
          </button>
          <p className="muted settings-note">
            Restore wipes this device and loads only what is in the backup file.
          </p>
          {/* No accept filter: iOS only lets you pick an AirDropped backup when any file is allowed. */}
          <input
            ref={mergeInput}
            type="file"
            hidden
            tabIndex={-1}
            aria-label="Backup file to import"
            onChange={(event) => void picked(event, 'merge')}
          />
          <input
            ref={restoreInput}
            type="file"
            hidden
            tabIndex={-1}
            aria-label="Backup file to restore"
            onChange={(event) => void picked(event, 'replace')}
          />
        </section>

        <section className="card settings-card">
          <h2>This device</h2>
          <dl className="facts facts-wide">
            <div>
              <dt>Storage protected</dt>
              <dd>{persisted === null ? 'Checking' : persisted ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt>Storage used (estimate for this address)</dt>
              <dd className="num">
                {usage?.usage == null ? 'Not available' : formatBytes(usage.usage)}
              </dd>
            </div>
            <div>
              <dt>Installed as an app</dt>
              <dd>{installed ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          {persisted === false && (
            <>
              <p className="muted">
                The browser has not promised to keep this data. An installed app is protected; a
                browser tab can be cleared after a week without a visit.
              </p>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => void requestPersist(getRepo()).then(setPersisted)}
              >
                Ask to protect it
              </button>
            </>
          )}
          {!installed && (
            <p className="muted">
              {isIos()
                ? `To install: ${installSteps()} Entries saved in a browser do not move to the Home Screen app, so install first.`
                : 'To install on a Mac: in Chrome use Install in the address bar, or in Safari use File, then Add to Dock.'}
            </p>
          )}
        </section>

        <section className="card settings-card">
          <h2>About</h2>
          <dl className="facts facts-wide">
            <div>
              <dt>Cigars in the list</dt>
              <dd className="num">
                {counts.cigars} ({counts.mine} added by you)
              </dd>
            </div>
            <div>
              <dt>Humidor lots</dt>
              <dd className="num">{counts.lots}</dd>
            </div>
            <div>
              <dt>This version was built</dt>
              <dd className="num">
                {formatDateLong(__BUILD_TIME__)} at {formatTime(__BUILD_TIME__)}
              </dd>
            </div>
          </dl>
          <p className="muted">
            When a newer version is ready, a bar with a Reload button appears at the top.
          </p>
        </section>
      </div>

      <Sheet open={ready !== null} title="Backup ready" onClose={closeReady}>
        {ready && (
          <div className="stack">
            <p className="num">
              {ready.file.name}
              <br />
              <span className="muted">
                {formatBytes(ready.file.size)}, {plural(counts.smokes, 'smoke')},{' '}
                {plural(counts.photos, 'photo')}
              </span>
            </p>
            {canShareFile(ready.file) && (
              <button
                type="button"
                className={prefersShare(ready.file) ? 'btn btn-primary' : 'btn btn-quiet'}
                onClick={() => void share()}
              >
                <Share size={20} strokeWidth={1.5} aria-hidden="true" />
                Share or AirDrop
              </button>
            )}
            <a
              href={ready.url}
              download={ready.file.name}
              className={prefersShare(ready.file) ? 'btn btn-quiet' : 'btn btn-primary'}
              onClick={() => {
                void markExported()
                showToast({ message: 'Backup saved' })
                setTimeout(closeReady, 500)
              }}
            >
              <Download size={20} strokeWidth={1.5} aria-hidden="true" />
              Download
            </a>
            <p className="muted">
              It is a normal zip file under another name. Rename it to .zip to look inside.
            </p>
          </div>
        )}
      </Sheet>

      <Sheet
        open={pending !== null}
        title={pending?.mode === 'replace' ? 'Replace everything?' : 'Import this backup?'}
        onClose={() => setPending(null)}
      >
        {pending && inBackup && (
          <div className="stack">
            <p>
              This backup was made {formatDateLong(pending.contents.manifest.exportedAt)} at{' '}
              {formatTime(pending.contents.manifest.exportedAt)}. It holds{' '}
              <span className="num">
                {plural(inBackup.smokes, 'smoke')}, {plural(inBackup.lots, 'humidor lot')}, and{' '}
                {plural(inBackup.photos, 'photo')}
              </span>
              .
            </p>
            {pending.mode === 'merge' ? (
              <>
                <p className="muted">
                  Nothing on this device is removed. New entries are added, and where both have the
                  same entry the newer one is kept.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy !== null}
                  onClick={() => void runImport()}
                >
                  Import
                </button>
              </>
            ) : (
              <>
                <p className="error-text">
                  This wipes what is on this device now:{' '}
                  <span className="num">
                    {plural(counts.smokes, 'smoke')}, {plural(counts.lots, 'humidor lot')}, and{' '}
                    {plural(counts.photos, 'photo')}
                  </span>
                  . It cannot be undone.
                </p>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => {
                    setPending(null)
                    void exportBackup()
                  }}
                >
                  Export current data first
                </button>
                <button
                  type="button"
                  className="btn btn-destructive"
                  disabled={busy !== null}
                  onClick={() => void runImport()}
                >
                  {armed ? 'Tap again to replace everything' : 'Replace everything'}
                </button>
              </>
            )}
            <button type="button" className="btn btn-quiet" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
