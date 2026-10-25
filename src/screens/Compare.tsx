import { Plus, Search, X } from 'lucide-react'
import { type CSSProperties, type ReactNode, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'wouter'
import { FlavorTags } from '../components/FlavorTags'
import { Monogram } from '../components/Monogram'
import { ScoreRing } from '../components/ScoreRing'
import { Sheet } from '../components/Sheet'
import { useStore } from '../data/store'
import type { RatingKey } from '../data/types'
import { statsByCigar } from '../domain/cigars'
import { bestIndex, type CompareColumn, cigarColumn, smokeColumn } from '../domain/compare'
import { cigarTitle, formatDate, formatRating, plural } from '../domain/format'
import { RUBRIC, shownScore, verdictFor } from '../domain/scoring'
import { buildRows, searchCigars, searchRows } from '../domain/search'
import { smokeSize } from '../domain/sizes'

type Mode = 'smokes' | 'cigars'
const MAX = 3

// What is being compared survives leaving the screen and coming back.
let selection: { mode: Mode; ids: string[] } = { mode: 'smokes', ids: [] }
const listeners = new Set<() => void>()
function setSelection(next: typeof selection) {
  selection = next
  for (const listener of listeners) listener()
}
function useSelection() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selection,
  )
}

const dash = <span className="muted">Not noted</span>
const text = (value: string): ReactNode => value || dash

export function Compare() {
  const state = useStore()
  const { mode, ids } = useSelection()
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      buildRows(state.smokes.values(), state.cigars).filter(
        (row) => row.smoke.status === 'complete',
      ),
    [state.smokes, state.cigars],
  )
  const stats = useMemo(() => statsByCigar(state.smokes.values()), [state.smokes])

  const columns: CompareColumn[] = useMemo(() => {
    if (mode === 'smokes') {
      return ids.flatMap((id) => {
        const smoke = state.smokes.get(id)
        return smoke && !smoke.deletedAt
          ? [smokeColumn(smoke, state.cigars.get(smoke.cigarId))]
          : []
      })
    }
    const all = [...state.smokes.values()]
    return ids.flatMap((id) => {
      const cigar = state.cigars.get(id)
      return cigar && !cigar.deletedAt
        ? [
            cigarColumn(
              cigar,
              all.filter((smoke) => smoke.cigarId === id),
            ),
          ]
        : []
    })
  }, [mode, ids, state.smokes, state.cigars])

  const smokeChoices = searchRows(rows, query)
    .filter((row) => !ids.includes(row.smoke.id))
    .slice(0, 40)
  const cigarChoices = searchCigars(state.cigars.values(), query)
    .filter((cigar) => stats.has(cigar.id) && !ids.includes(cigar.id))
    .slice(0, 40)

  function add(id: string) {
    setSelection({ mode, ids: [...ids, id].slice(0, MAX) })
    setPicking(false)
    setQuery('')
  }

  const numberRow = (label: string, values: (number | null)[], format: (n: number) => string) => {
    const best = bestIndex(values)
    return (
      <tr key={label}>
        <th scope="row">{label}</th>
        {values.map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: columns keep their order
          <td key={index} className={index === best ? 'is-best num' : 'num'}>
            {value === null ? (
              dash
            ) : (
              <>
                <span className="compare-value">{format(value)}</span>
                <span className="rating-bar" aria-hidden="true">
                  <span style={{ width: `${(value / 10) * 100}%` }} />
                </span>
                {index === best && <span className="sr-only"> (highest)</span>}
              </>
            )}
          </td>
        ))}
      </tr>
    )
  }

  const row = (label: string, cell: (column: CompareColumn) => ReactNode) => (
    <tr key={label}>
      <th scope="row">{label}</th>
      {columns.map((column) => (
        <td key={column.key}>{cell(column)}</td>
      ))}
    </tr>
  )
  const section = (title: string) => (
    <tr className="compare-section" key={title}>
      <th scope="colgroup" colSpan={columns.length + 1}>
        <span className="compare-section-label">{title}</span>
      </th>
    </tr>
  )
  const flavors = (tags: string[]) => (tags.length > 0 ? <FlavorTags tags={tags} /> : dash)
  const scoreBest = bestIndex(columns.map((column) => column.score))
  const anyThirds = columns.some((column) => column.strengthByThird || column.bodyByThird)

  return (
    <div className="page compare">
      <header className="hero">
        <div className="hero-top">
          <h1>Compare</h1>
          <div className="segmented compare-mode" role="group" aria-label="What to compare">
            <button
              type="button"
              aria-pressed={mode === 'smokes'}
              onClick={() => setSelection({ mode: 'smokes', ids: [] })}
            >
              Smokes
            </button>
            <button
              type="button"
              aria-pressed={mode === 'cigars'}
              onClick={() => setSelection({ mode: 'cigars', ids: [] })}
            >
              Cigars
            </button>
          </div>
        </div>
        <p className="muted">
          {mode === 'smokes'
            ? 'Pick 2 or 3 smokes to see them side by side.'
            : 'Pick 2 or 3 cigars. Each column is the average of your smokes of it.'}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing to compare yet</p>
          <p className="muted">Log a couple of smokes first.</p>
          <Link href="/log" className="btn btn-primary btn-log">
            Log a smoke
          </Link>
        </div>
      ) : (
        // On a phone the columns scroll sideways inside this box while the labels stay put.
        <div className="compare-scroll">
          <table
            className="compare-table"
            style={{ '--cols': Math.min(MAX, columns.length + 1) } as CSSProperties}
          >
            <thead>
              <tr>
                <td />
                {columns.map((column, index) => (
                  <th key={column.key} scope="col">
                    <div className="compare-head">
                      <div className="compare-head-top">
                        <Link href={column.href} className="pick-main">
                          <span className="band-brand">{column.brand || 'No brand'}</span>
                          <span className="compare-title">{column.title}</span>
                          <span className="muted num">{column.subtitle}</span>
                        </Link>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Remove ${column.title} from the comparison`}
                          onClick={() =>
                            setSelection({ mode, ids: ids.filter((id) => id !== column.key) })
                          }
                        >
                          <X size={20} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                      {column.score === null ? (
                        <span className="muted">No score</span>
                      ) : (
                        <div className="compare-score">
                          <ScoreRing shown={column.score} size={84} stroke={4}>
                            <span className="numeral numeral-md num">{column.score}</span>
                          </ScoreRing>
                          <span className="readout-text">
                            <span
                              className="verdict verdict-lg"
                              data-verdict={verdictFor(column.score)}
                            >
                              {verdictFor(column.score)}
                            </span>
                            {index === scoreBest && (
                              <span className="ready-line">Highest score</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {columns.length < MAX && (
                  <th scope="col" className="compare-add">
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => setPicking(true)}
                    >
                      <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
                      {mode === 'smokes' ? 'Add a smoke' : 'Add a cigar'}
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            {columns.length > 0 && (
              <tbody>
                {section('Scores')}
                {RUBRIC.map((category) =>
                  numberRow(
                    category.label,
                    columns.map((column) => column.ratings[category.key as RatingKey]),
                    formatRating,
                  ),
                )}
                {section('Flavors')}
                {row('All flavors', (column) => flavors(column.tags.all))}
                {row('First third', (column) => flavors(column.tags.first))}
                {row('Second third', (column) => flavors(column.tags.second))}
                {row('Final third', (column) => flavors(column.tags.final))}
                {section('Strength and body')}
                {row('Strength', (column) => text(column.strength))}
                {row('Body', (column) => text(column.body))}
                {anyThirds && row('Strength by third', (column) => text(column.strengthByThird))}
                {anyThirds && row('Body by third', (column) => text(column.bodyByThird))}
                {section('Construction')}
                {row('Draw', (column) => text(column.draw))}
                {row('Burn', (column) => text(column.burn))}
                {row('Ash', (column) => text(column.ash))}
                {row('Smoke volume', (column) => text(column.smokeVolume))}
                {row('Relights', (column) => text(column.relights))}
                {row('Touch-ups', (column) => text(column.touchUps))}
                {row('Issues', (column) =>
                  column.issues.length > 0 ? (
                    column.issues.join(', ')
                  ) : (
                    <span className="muted">None noted</span>
                  ),
                )}
                {section('The rest')}
                {row('Wrapper', (column) => text(column.wrapper))}
                {row('Size', (column) => text(column.size))}
                {row('Smoke time', (column) => text(column.time))}
                {row('Pairing', (column) => text(column.pairing))}
                {row('Price paid', (column) => text(column.price))}
              </tbody>
            )}
          </table>
        </div>
      )}

      <Sheet
        open={picking}
        title={mode === 'smokes' ? 'Add a smoke' : 'Add a cigar'}
        onClose={() => setPicking(false)}
      >
        <div className="stack">
          <div className="search">
            <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            <label className="sr-only" htmlFor="compare-search">
              Search
            </label>
            <input
              id="compare-search"
              type="search"
              className="input"
              placeholder={
                mode === 'smokes' ? 'Search your smokes' : 'Search cigars you have smoked'
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
          </div>
          {mode === 'smokes' ? (
            smokeChoices.length === 0 ? (
              <p className="muted">No smokes match.</p>
            ) : (
              <ul className="pick-list">
                {smokeChoices.map(({ smoke, cigar }) => (
                  <li key={smoke.id}>
                    <button type="button" className="pick-row" onClick={() => add(smoke.id)}>
                      <Monogram brand={cigar?.brand || cigar?.line || '?'} />
                      <span className="pick-main">
                        <span className="pick-brand">{cigar?.brand}</span>
                        <span className="pick-title">
                          {cigar ? cigarTitle(cigar) : 'Unknown cigar'}
                        </span>
                        <span className="pick-sub num">
                          {[formatDate(smoke.smokedAt), smokeSize(smoke, cigar)]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <span className="pick-note num">
                        {smoke.score === null ? '' : shownScore(smoke.score)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : cigarChoices.length === 0 ? (
            <p className="muted">
              No smoked cigars match. Only cigars you have logged can be compared.
            </p>
          ) : (
            <ul className="pick-list">
              {cigarChoices.map((cigar) => (
                <li key={cigar.id}>
                  <button type="button" className="pick-row" onClick={() => add(cigar.id)}>
                    <Monogram brand={cigar.brand || cigar.line} />
                    <span className="pick-main">
                      <span className="pick-brand">{cigar.brand}</span>
                      <span className="pick-title">{cigarTitle(cigar)}</span>
                    </span>
                    <span className="pick-note num">
                      {plural(stats.get(cigar.id)?.count ?? 0, 'smoke')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Sheet>
    </div>
  )
}
