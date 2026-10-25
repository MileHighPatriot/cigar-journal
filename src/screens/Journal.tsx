import { Search, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { BackupReminder } from '../components/BackupReminder'
import { LAPTOP, useMediaQuery } from '../components/hooks'
import { InstallHint } from '../components/InstallHint'
import { LabelArt } from '../components/LabelArt'
import { ScoreRing } from '../components/ScoreRing'
import { SmokeCard } from '../components/SmokeCard'
import { Sparkline } from '../components/Sparkline'
import { showToast } from '../components/toast'
import { deleteSmoke, useStore } from '../data/store'
import type { Photo } from '../data/types'
import { cigarTitle } from '../domain/format'
import { shownScore } from '../domain/scoring'
import { buildRows, type SmokeRow, searchRows } from '../domain/search'
import { smokeSize } from '../domain/sizes'
import { SmokeDetail } from './SmokeDetail'

const PAGE = 60
const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

/** The photo shown on a card: the band if there is one, otherwise the first photo. */
export function cardPhotos(photos: Map<string, Photo>): Map<string, Photo> {
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
  const size = smokeSize(smoke, cigar)

  function discard() {
    const { undo } = deleteSmoke(smoke.id)
    showToast({ message: 'Draft discarded', actionLabel: 'Undo', onAction: () => void undo() })
  }

  return (
    <div className="resume card">
      <span className="resume-pulse" aria-hidden="true" />
      <div className="resume-text">
        <span className="resume-label">In progress</span>
        <span className="resume-title">
          {cigar ? [cigar.brand, cigarTitle(cigar)].filter(Boolean).join(' ') : 'Unknown cigar'}
        </span>
        {size && <span className="muted">{size}</span>}
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

/** The header: average as a ring, counts, and a line of recent scores. */
function Hero({ complete }: { complete: SmokeRow[] }) {
  const scored = complete.filter((row) => row.smoke.score !== null)
  const scores = scored.map((row) => shownScore(row.smoke.score ?? 0))
  const average =
    scores.length > 0 ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length) : null
  const month = new Date().toISOString().slice(0, 7)
  const thisMonth = complete.filter((row) => row.smoke.smokedAt.slice(0, 7) === month).length
  const best = scores.length > 0 ? Math.max(...scores) : null
  const recent = scores.slice(0, 12).reverse()

  return (
    <header className="hero">
      <LabelArt compact scene="salon" />
      <div className="hero-top">
        <h1>Journal</h1>
      </div>
      {complete.length > 0 && (
        <div className="hero-stats">
          <div className="hero-average">
            <ScoreRing shown={average} size={84} stroke={4}>
              <span className="numeral numeral-md num">{average ?? ''}</span>
            </ScoreRing>
            <span className="hero-label">Average</span>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>Smokes</dt>
              <dd className="num">{complete.length}</dd>
            </div>
            <div>
              <dt>This month</dt>
              <dd className="num">{thisMonth}</dd>
            </div>
            <div>
              <dt>Best</dt>
              <dd className="num">{best ?? 'None'}</dd>
            </div>
          </dl>
          {recent.length > 1 && (
            <div className="hero-spark">
              <Sparkline
                values={recent}
                label={`Your last ${recent.length} scores, oldest to newest: ${recent.join(', ')}`}
              />
              <span className="hero-label">Last {recent.length} scores</span>
            </div>
          )}
        </div>
      )}
    </header>
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
  const searching = query.trim().length > 0

  return (
    <div className={selectedId ? 'journal has-detail' : 'journal'}>
      <section className="journal-list" aria-label="Journal">
        <Hero complete={complete} />

        <InstallHint />
        <BackupReminder />

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
            <p className="muted">Tap Log a smoke to add your first one.</p>
            <Link href="/log" className="btn btn-primary btn-log">
              Log a smoke
            </Link>
          </div>
        )}

        {complete.length > 0 && results.length === 0 && (
          <p className="muted empty-search">Nothing matches that search.</p>
        )}

        <ul className="card-list">
          {visible.map((row, index) => {
            const month = monthName.format(new Date(row.smoke.smokedAt))
            const previous = visible[index - 1]
            const newMonth =
              !previous || monthName.format(new Date(previous.smoke.smokedAt)) !== month
            return (
              <Fragment key={row.smoke.id}>
                {newMonth && (
                  <li className="month-head">
                    <span>{month}</span>
                  </li>
                )}
                <li
                  className="card-item"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <SmokeCard
                    row={row}
                    photo={photoBySmoke.get(row.smoke.id)}
                    selected={row.smoke.id === shownId}
                    featured={index === 0 && !searching}
                  />
                </li>
              </Fragment>
            )
          })}
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
