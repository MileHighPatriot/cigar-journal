import { Armchair, ChevronRight, ListChecks, Plus, Search, X } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { CigarForm } from '../components/CigarForm'
import { LAPTOP, useMediaQuery } from '../components/hooks'
import { LoungeBatchForm } from '../components/LoungeBatchForm'
import { Monogram, WrapperDot } from '../components/Monogram'
import { ScoreRing } from '../components/ScoreRing'
import { showToast } from '../components/toast'
import { addToLounge, removeFromLounge, useStore } from '../data/store'
import type { Cigar } from '../data/types'
import {
  type CigarFilter,
  filterCigars,
  statsByCigar,
  strengthCounts,
  wrapperOptions,
} from '../domain/cigars'
import { cigarSubtitle, cigarTitle } from '../domain/format'
import { LEVEL_LABELS, levelLabel } from '../domain/scoring'
import { closestCigars } from '../domain/search'
import { CigarPage } from './CigarPage'

const PAGE = 80
/** "Select all" is offered up to this many matches; past that, narrow the search first. */
const SELECT_ALL_MAX = 200

const ONLY: { key: CigarFilter['only']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'smoked', label: 'Smoked' },
  { key: 'mine', label: 'Added by me' },
]

/** Browse every cigar in the list without starting a log. */
export function Cigars({ selectedId }: { selectedId?: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [filter, setFilter] = useState<CigarFilter>({
    query: '',
    strength: null,
    wrapper: null,
    only: 'all',
  })
  const [limit, setLimit] = useState(PAGE)
  const [adding, setAdding] = useState(false)
  // Select mode: tick several sticks, then put them all on the lounge list with one spot.
  const [selecting, setSelecting] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(() => new Set())
  const [batching, setBatching] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  const stats = useMemo(() => statsByCigar(state.smokes.values()), [state.smokes])
  const exact = useMemo(
    () => filterCigars(state.cigars.values(), filter, stats),
    [state.cigars, filter, stats],
  )
  // Nothing matched every word: offer the nearest names instead of an empty page.
  const closest = useMemo(
    () => (exact.length === 0 ? closestCigars(state.cigars.values(), filter.query) : []),
    [state.cigars, filter.query, exact],
  )
  const results = exact.length > 0 ? exact : closest
  const wrappers = useMemo(() => wrapperOptions(state.cigars.values()), [state.cigars])
  const totals = useMemo(() => {
    const live = [...state.cigars.values()].filter((cigar) => !cigar.deletedAt)
    return {
      cigars: live.length,
      brands: new Set(live.map((cigar) => cigar.brand)).size,
      strengths: strengthCounts(live),
    }
  }, [state.cigars])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new filter starts the list over
  useEffect(() => {
    setLimit(PAGE)
  }, [filter])
  useEffect(() => {
    const element = sentinel.current
    if (!element || limit >= results.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setLimit((n) => n + PAGE)
      },
      { rootMargin: '800px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [limit, results.length])

  const visible = results.slice(0, limit)
  const laptop = useMediaQuery(LAPTOP)

  // One tap puts a stick on the lounge list; a second takes it off. Both can be undone.
  function toggleLounge(cigar: Cigar) {
    const title = cigarTitle(cigar)
    if (cigar.lounge) {
      const { undo } = removeFromLounge(cigar.id)
      showToast({
        message: `${title} is off the lounge list`,
        actionLabel: 'Undo',
        onAction: () => void undo(),
      })
    } else {
      void addToLounge(cigar.id)
      showToast({
        message: `${title} is on the lounge list`,
        actionLabel: 'Undo',
        onAction: () => void removeFromLounge(cigar.id),
      })
    }
  }
  function togglePick(id: string) {
    setPicked((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function stopSelecting() {
    setSelecting(false)
    setPicked(new Set())
  }
  const pickedCigars = useMemo(
    () => results.filter((cigar) => picked.has(cigar.id)),
    [results, picked],
  )

  // On a laptop the right pane opens the cigar smoked most recently, or the first one.
  const recent = useMemo(() => {
    let best: string | undefined
    let when = ''
    for (const [id, entry] of stats) {
      if (entry.lastSmokedAt && entry.lastSmokedAt > when && state.cigars.get(id)) {
        best = id
        when = entry.lastSmokedAt
      }
    }
    return best
  }, [stats, state.cigars])
  const shownId = selectedId ?? (laptop ? (recent ?? visible[0]?.id) : undefined)
  const strengthTotal = totals.strengths.reduce((sum, n) => sum + n, 0)
  const filtered =
    filter.query.trim() !== '' ||
    filter.strength !== null ||
    filter.wrapper !== null ||
    filter.only !== 'all'

  return (
    <div className={selectedId ? 'journal has-detail' : 'journal'}>
      <section className="journal-list" aria-label="Cigars">
        <header className="hero">
          <div className="hero-top">
            <h1>Cigars</h1>
            <button type="button" className="btn btn-quiet" onClick={() => setAdding(true)}>
              <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
              Add new
            </button>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>Cigars</dt>
              <dd className="num">{totals.cigars}</dd>
            </div>
            <div>
              <dt>Brands</dt>
              <dd className="num">{totals.brands}</dd>
            </div>
            <div>
              <dt>Smoked</dt>
              <dd className="num">{stats.size}</dd>
            </div>
          </dl>
          {strengthTotal > 0 && (
            <div className="strength">
              <div className="strength-bar" aria-hidden="true">
                {totals.strengths.map((count, index) => (
                  <span
                    key={LEVEL_LABELS[index]}
                    data-level={index + 1}
                    style={{ flexGrow: count }}
                  />
                ))}
              </div>
              <span className="hero-label">
                The list by strength, mild to full:{' '}
                <span className="num">{totals.strengths.join(', ')}</span>
              </span>
            </div>
          )}
        </header>

        <div className="search">
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
          <label className="sr-only" htmlFor="cigar-list-search">
            Search cigars
          </label>
          <input
            id="cigar-list-search"
            type="search"
            className="input"
            placeholder="Search name, blend, factory, flavor"
            value={filter.query}
            onChange={(event) => setFilter({ ...filter, query: event.target.value })}
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
        </div>

        <div className="filters">
          <div className="segmented segmented-3" role="group" aria-label="Which cigars">
            {ONLY.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={filter.only === option.key}
                onClick={() => setFilter({ ...filter, only: option.key })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label className="field">
              <span>Strength</span>
              <select
                className="input"
                value={filter.strength ?? ''}
                onChange={(event) =>
                  setFilter({
                    ...filter,
                    strength: event.target.value ? Number(event.target.value) : null,
                  })
                }
              >
                <option value="">Any</option>
                {LEVEL_LABELS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Wrapper</span>
              <select
                className="input"
                value={filter.wrapper ?? ''}
                onChange={(event) => setFilter({ ...filter, wrapper: event.target.value || null })}
              >
                <option value="">Any</option>
                {wrappers.map((wrapper) => (
                  <option key={wrapper} value={wrapper}>
                    {wrapper}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="list-tools">
          <p className="muted num result-count" aria-live="polite">
            {closest.length > 0
              ? 'No exact match. These are the closest.'
              : filtered
                ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}`
                : `All ${results.length} cigars, A to Z by brand`}
          </p>
          {selecting ? (
            results.length <= SELECT_ALL_MAX &&
            results.length > 0 && (
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => setPicked(new Set(results.map((cigar) => cigar.id)))}
              >
                Select all {results.length}
              </button>
            )
          ) : (
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setSelecting(true)}
              disabled={results.length === 0}
            >
              <ListChecks size={20} strokeWidth={1.5} aria-hidden="true" />
              Select
            </button>
          )}
        </div>

        {results.length === 0 && (
          <div className="empty">
            <p className="empty-title">No cigars match</p>
            <p className="muted">Try fewer words, or add it yourself.</p>
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
              Add new cigar
            </button>
          </div>
        )}

        <ul className="brand-list">
          {visible.map((cigar, index) => {
            const newBrand = visible[index - 1]?.brand !== cigar.brand
            const mine = stats.get(cigar.id)
            const sub = cigarSubtitle(cigar)
            return (
              <Fragment key={cigar.id}>
                {newBrand && (
                  <li className="brand-head">
                    <Monogram brand={cigar.brand || cigar.line} />
                    <span>{cigar.brand || 'No brand'}</span>
                  </li>
                )}
                <li className="cigar-item">
                  {selecting ? (
                    <label className="cigar-row cigar-pick">
                      <input
                        type="checkbox"
                        checked={picked.has(cigar.id)}
                        onChange={() => togglePick(cigar.id)}
                      />
                      <span className="pick-main">
                        <span className="pick-title">{cigarTitle(cigar)}</span>
                        <span className="pick-sub">
                          {sub && <span>{sub}</span>}
                          <WrapperDot wrapper={cigar.wrapperType} />
                          {cigar.strength && <span>{levelLabel(cigar.strength)}</span>}
                        </span>
                      </span>
                      {cigar.lounge && (
                        <span className="in-lounge-mark" title="Already on the lounge list">
                          <Armchair size={20} strokeWidth={1.5} aria-hidden="true" />
                          <span className="sr-only">Already on the lounge list</span>
                        </span>
                      )}
                    </label>
                  ) : (
                    <>
                      <Link
                        href={`/cigars/${cigar.id}`}
                        className="cigar-row"
                        aria-current={cigar.id === shownId ? 'true' : undefined}
                      >
                        <span className="pick-main">
                          <span className="pick-title">{cigarTitle(cigar)}</span>
                          <span className="pick-sub">
                            {sub && <span>{sub}</span>}
                            <WrapperDot wrapper={cigar.wrapperType} />
                            {cigar.strength && <span>{levelLabel(cigar.strength)}</span>}
                          </span>
                        </span>
                        {mine ? (
                          <span className="cigar-row-score">
                            {mine.average !== null && (
                              <ScoreRing shown={mine.average} size={48} stroke={3}>
                                <span className="ring-num num">{mine.average}</span>
                              </ScoreRing>
                            )}
                            <span className="verdict num">
                              {mine.count} {mine.count === 1 ? 'smoke' : 'smokes'}
                            </span>
                          </span>
                        ) : (
                          <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                        )}
                      </Link>
                      <button
                        type="button"
                        className="icon-btn lounge-toggle"
                        aria-pressed={cigar.lounge !== null}
                        aria-label={
                          cigar.lounge
                            ? `Take ${cigarTitle(cigar)} off the lounge list`
                            : `Add ${cigarTitle(cigar)} to the lounge list`
                        }
                        onClick={() => toggleLounge(cigar)}
                      >
                        <Armchair size={20} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ul>
        <div ref={sentinel} />

        {selecting && (
          <div className="select-bar" role="toolbar" aria-label="Selected cigars">
            <span className="num" aria-live="polite">
              {picked.size} selected
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Stop selecting"
              onClick={stopSelecting}
            >
              <X size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pickedCigars.length === 0}
              onClick={() => setBatching(true)}
            >
              <Armchair size={20} strokeWidth={1.5} aria-hidden="true" />
              Add to lounge
            </button>
          </div>
        )}
      </section>

      <section className="journal-detail" aria-label="Cigar detail">
        {shownId ? (
          <CigarPage key={shownId} id={shownId} />
        ) : (
          <p className="journal-detail-empty muted">Pick a cigar to see it here.</p>
        )}
      </section>

      <LoungeBatchForm
        open={batching}
        cigars={pickedCigars}
        onClose={() => setBatching(false)}
        onDone={(added, undo) => {
          stopSelecting()
          showToast({
            message:
              added === 0
                ? 'Spot saved on the lounge list'
                : `${added} ${added === 1 ? 'stick is' : 'sticks are'} on the lounge list`,
            actionLabel: 'Undo',
            onAction: () => void undo(),
          })
        }}
      />

      <CigarForm
        open={adding}
        cigar={null}
        wrappers={wrappers}
        onClose={() => setAdding(false)}
        onSaved={(cigar) => {
          navigate(`/cigars/${cigar.id}`)
          showToast({ message: 'Cigar added' })
        }}
      />
    </div>
  )
}
