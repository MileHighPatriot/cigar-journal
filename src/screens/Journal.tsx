import { Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { LAPTOP, useMediaQuery } from '../components/hooks'
import { InstallHint } from '../components/InstallHint'
import { SmokeCard } from '../components/SmokeCard'
import { showToast } from '../components/toast'
import { deleteSmoke, useStore } from '../data/store'
import type { Photo } from '../data/types'
import { cigarSubtitle, cigarTitle } from '../domain/format'
import { shownScore } from '../domain/scoring'
import { buildRows, type SmokeRow, searchRows } from '../domain/search'
import { SmokeDetail } from './SmokeDetail'

const PAGE = 60

/** The photo shown on a card: the band if there is one, otherwise the first photo. */
function cardPhotos(photos: Map<string, Photo>): Map<string, Photo> {
  const bySmoke = new Map<string, Photo>()
  for (const photo of photos.values()) {
    if (photo.deletedAt) continue
    const current = bySmoke.get(photo.smokeId)
    const better =
      !current ||
      (photo.kind === 'band' && current.kind !== 'band') ||
      (photo.kind === current.kind && photo.order < current.order)
    if (better) bySmoke.set(photo.smokeId, photo)
  }
  return bySmoke
}

function ResumeCard({ row }: { row: SmokeRow }) {
  const { smoke, cigar } = row
  const step = smoke.draftStep ?? 'scores'

  function discard() {
    const { undo } = deleteSmoke(smoke.id)
    showToast({ message: 'Draft discarded', actionLabel: 'Undo', onAction: () => void undo() })
  }

  return (
    <div className="resume card">
      <div className="resume-text">
        <span className="resume-label">In progress</span>
        <span className="resume-title">
          {cigar ? [cigar.brand, cigarTitle(cigar)].filter(Boolean).join(' ') : 'Unknown cigar'}
        </span>
        {cigar && cigarSubtitle(cigar) && <span className="muted">{cigarSubtitle(cigar)}</span>}
      </div>
      <div className="resume-actions">
        <button type="button" className="icon-btn" aria-label="Discard draft" onClick={discard}>
          <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <Link href={`/log/${smoke.id}/${step}`} className="btn btn-primary">
          Resume
        </Link>
      </div>
    </div>
  )
}

export function Journal({ selectedId }: { selectedId?: string }) {
  const state = useStore()
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)

  const rows = useMemo(
    () => buildRows(state.smokes.values(), state.cigars),
    [state.smokes, state.cigars],
  )
  const drafts = useMemo(() => rows.filter((row) => row.smoke.status === 'draft'), [rows])
  const complete = useMemo(() => rows.filter((row) => row.smoke.status === 'complete'), [rows])
  const results = useMemo(() => searchRows(complete, query), [complete, query])
  const photoBySmoke = useMemo(() => cardPhotos(state.photos), [state.photos])

  const scored = complete.filter((row) => row.smoke.score !== null)
  const average =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, row) => sum + shownScore(row.smoke.score ?? 0), 0) / scored.length,
        )
      : null

  // Render 60 cards at a time and grow as the end nears.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the query resets the page
  useEffect(() => {
    setLimit(PAGE)
  }, [query])
  useEffect(() => {
    const element = sentinel.current
    if (!element || limit >= results.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setLimit((n) => n + PAGE)
      },
      { rootMargin: '600px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [limit, results.length])

  const visible = results.slice(0, limit)
  // On a laptop the right pane opens the newest smoke, so it never sits empty.
  const laptop = useMediaQuery(LAPTOP)
  const shownId = selectedId ?? (laptop ? visible[0]?.smoke.id : undefined)

  return (
    <div className={selectedId ? 'journal has-detail' : 'journal'}>
      <section className="journal-list" aria-label="Journal">
        <header className="page-head">
          <h1>Journal</h1>
          {complete.length > 0 && (
            <p className="muted num">
              {complete.length} {complete.length === 1 ? 'smoke' : 'smokes'}
              {average !== null && ` · average ${average}`}
            </p>
          )}
        </header>

        <InstallHint />

        {drafts.map((row) => (
          <ResumeCard key={row.smoke.id} row={row} />
        ))}

        {complete.length > 0 && (
          <div className="search">
            <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            <label className="sr-only" htmlFor="journal-search">
              Search your journal
            </label>
            <input
              id="journal-search"
              type="search"
              className="input"
              placeholder="Search brand, line, notes, flavors"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        )}

        {complete.length === 0 && drafts.length === 0 && (
          <div className="empty">
            <p className="empty-title">No smokes yet</p>
            <p className="muted">Tap Log to add your first one. It takes under a minute.</p>
            <Link href="/log" className="btn btn-primary">
              Log a smoke
            </Link>
          </div>
        )}

        {complete.length > 0 && results.length === 0 && (
          <p className="muted empty-search">Nothing matches that search.</p>
        )}

        <ul className="card-list">
          {visible.map((row) => (
            <li key={row.smoke.id}>
              <SmokeCard
                row={row}
                photo={photoBySmoke.get(row.smoke.id)}
                selected={row.smoke.id === shownId}
              />
            </li>
          ))}
        </ul>
        <div ref={sentinel} />
      </section>

      <section className="journal-detail" aria-label="Smoke detail">
        {shownId ? (
          <SmokeDetail key={shownId} id={shownId} />
        ) : (
          <p className="journal-detail-empty muted">Pick a smoke to see it here.</p>
        )}
      </section>
    </div>
  )
}
