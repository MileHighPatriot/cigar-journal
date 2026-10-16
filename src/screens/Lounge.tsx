import { GraduationCap, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { FlavorTags } from '../components/FlavorTags'
import { Etching, HeroArt } from '../components/HeroArt'
import { LAPTOP, useMediaQuery } from '../components/hooks'
import { LoungeForm } from '../components/LoungeForm'
import { Monogram, WrapperDot } from '../components/Monogram'
import { ScoreRing } from '../components/ScoreRing'
import { StudyCards } from '../components/StudyCards'
import { showToast } from '../components/toast'
import { patchLounge, useStore } from '../data/store'
import type { KnownLevel } from '../data/types'
import { type CigarStats, priceLabel, statsByCigar } from '../domain/cigars'
import { cigarTitle, formatMoney } from '../domain/format'
import {
  cigarFlavors,
  EMPTY_LOUNGE_FILTER,
  filterLounge,
  flavorOptions,
  type GroupKey,
  groupByStrength,
  isFiltered,
  KNOWN_LABELS,
  type LoungeCigar,
  type LoungeFilter,
  loungeCigars,
  loungeTotals,
  nextKnown,
  STRENGTH_GROUPS,
  studyDeck,
  wrapperOptionsOf,
} from '../domain/lounge'
import { levelLabel } from '../domain/scoring'
import { CigarPage } from './CigarPage'

const GROUP_CHOICES: { key: GroupKey | null; label: string }[] = [
  { key: null, label: 'Any' },
  ...STRENGTH_GROUPS.filter((group) => group.key !== 'unknown').map((group) => ({
    key: group.key,
    label: group.label,
  })),
]

const KNOWN_KEYS: KnownLevel[] = ['new', 'learning', 'known']

/** The list at the lounge, split by strength so a guest's ask lands in one group. */
export function Lounge({ selectedId }: { selectedId?: string }) {
  const state = useStore()
  const [filter, setFilter] = useState<LoungeFilter>(EMPTY_LOUNGE_FILTER)
  const [picking, setPicking] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deck, setDeck] = useState<LoungeCigar[] | null>(null)

  const stocked = useMemo(() => loungeCigars(state.cigars.values()), [state.cigars])
  const results = useMemo(() => filterLounge(stocked, filter), [stocked, filter])
  const groups = useMemo(() => groupByStrength(results), [results])
  const totals = useMemo(() => loungeTotals(stocked), [stocked])
  const wrappers = useMemo(() => wrapperOptionsOf(stocked), [stocked])
  const flavors = useMemo(() => flavorOptions(stocked), [stocked])
  const stats = useMemo(() => statsByCigar(state.smokes.values()), [state.smokes])

  const laptop = useMediaQuery(LAPTOP)
  const shownId = selectedId ?? (laptop ? groups[0]?.cigars[0]?.id : undefined)
  const filtered = isFiltered(filter)

  function cycleKnown(cigar: LoungeCigar) {
    void patchLounge(cigar.id, { known: nextKnown(cigar.lounge.known) })
  }

  return (
    <div className={selectedId ? 'journal has-detail' : 'journal'}>
      <section className="journal-list" aria-label="Lounge humidor">
        <header className="hero">
          <HeroArt />
          <div className="hero-top">
            <h1>Lounge</h1>
            <Etching art="box" className="hero-etch" />
            <button type="button" className="btn btn-quiet" onClick={() => setAdding(true)}>
              <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
              Add
            </button>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>In the lounge</dt>
              <dd className="num">{totals.total}</dd>
            </div>
            <div>
              <dt>Know it</dt>
              <dd className="num">{totals.known}</dd>
            </div>
            <div>
              <dt>Learning</dt>
              <dd className="num">{totals.learning}</dd>
            </div>
          </dl>
        </header>

        {stocked.length === 0 ? (
          <div className="empty">
            <Etching art="emptybox" className="empty-art" />
            <p className="empty-title">Nothing on the lounge list yet</p>
            <p className="muted">
              Walk the humidor and add each stick you see. Then study them here, by strength.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
              Add a lounge stick
            </button>
          </div>
        ) : (
          <>
            <div className="search">
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
              <label className="sr-only" htmlFor="lounge-search">
                Search the lounge list
              </label>
              <input
                id="lounge-search"
                type="search"
                className="input"
                placeholder="Search name, wrapper, flavor, shelf"
                value={filter.query}
                onChange={(event) => setFilter({ ...filter, query: event.target.value })}
                autoComplete="off"
                autoCorrect="off"
                enterKeyHint="search"
              />
            </div>

            <div className="filters">
              <div className="segmented segmented-4" role="group" aria-label="Strength">
                {GROUP_CHOICES.map((choice) => (
                  <button
                    key={choice.label}
                    type="button"
                    aria-pressed={filter.group === choice.key}
                    onClick={() => setFilter({ ...filter, group: choice.key })}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <div className="lounge-tools">
                <button
                  type="button"
                  className="btn btn-quiet"
                  aria-expanded={picking}
                  aria-controls="lounge-finder"
                  onClick={() => setPicking((open) => !open)}
                >
                  <SlidersHorizontal size={20} strokeWidth={1.5} aria-hidden="true" />
                  Help me pick
                </button>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setDeck(studyDeck(results))}
                  disabled={results.length === 0}
                >
                  <GraduationCap size={20} strokeWidth={1.5} aria-hidden="true" />
                  Study {filtered ? 'these' : 'all'}
                </button>
              </div>
              {picking && (
                <div id="lounge-finder" className="finder">
                  <div className="form-row">
                    <label className="field">
                      <span>Wrapper</span>
                      <select
                        className="input"
                        value={filter.wrapper ?? ''}
                        onChange={(event) =>
                          setFilter({ ...filter, wrapper: event.target.value || null })
                        }
                      >
                        <option value="">Any</option>
                        {wrappers.map((wrapper) => (
                          <option key={wrapper} value={wrapper}>
                            {wrapper}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Flavor</span>
                      <select
                        className="input"
                        value={filter.flavor ?? ''}
                        onChange={(event) =>
                          setFilter({ ...filter, flavor: event.target.value || null })
                        }
                      >
                        <option value="">Any</option>
                        {flavors.map(({ flavor, count }) => (
                          <option key={flavor} value={flavor}>
                            {flavor} ({count})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <label className="field">
                      <span>Price tier</span>
                      <select
                        className="input"
                        value={filter.priceTier ?? ''}
                        onChange={(event) =>
                          setFilter({
                            ...filter,
                            priceTier: event.target.value ? Number(event.target.value) : null,
                          })
                        }
                      >
                        <option value="">Any</option>
                        <option value="1">$</option>
                        <option value="2">$$</option>
                        <option value="3">$$$</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Lounge price under</span>
                      <input
                        className="input num"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={1}
                        placeholder="$"
                        value={filter.maxPrice ?? ''}
                        onChange={(event) =>
                          setFilter({
                            ...filter,
                            maxPrice: event.target.value === '' ? null : Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <div
                    className="segmented segmented-4"
                    role="group"
                    aria-label="How well you know it"
                  >
                    <button
                      type="button"
                      aria-pressed={filter.known === null}
                      onClick={() => setFilter({ ...filter, known: null })}
                    >
                      Any
                    </button>
                    {KNOWN_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={filter.known === key}
                        onClick={() => setFilter({ ...filter, known: key })}
                      >
                        {KNOWN_LABELS[key]}
                      </button>
                    ))}
                  </div>
                  {filtered && (
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => setFilter(EMPTY_LOUNGE_FILTER)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="muted num result-count" aria-live="polite">
              {filtered
                ? `${results.length} of ${stocked.length} fit`
                : `All ${stocked.length}, mild to full`}
            </p>

            {results.length === 0 && (
              <div className="empty">
                <p className="empty-title">Nothing in the lounge fits</p>
                <p className="muted">Loosen one of the picks, or try another flavor.</p>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setFilter(EMPTY_LOUNGE_FILTER)}
                >
                  Clear
                </button>
              </div>
            )}

            <ul className="lounge-list">
              {groups.map(({ group, cigars }) => (
                <Fragment key={group.key}>
                  <li className="lounge-head" data-group={group.key}>
                    <span className="lounge-head-mark" aria-hidden="true">
                      {group.levels.map((level) => (
                        <span key={level} data-level={level} />
                      ))}
                    </span>
                    <span>{group.label}</span>
                    <span className="num lounge-head-count">{cigars.length}</span>
                  </li>
                  {cigars.map((cigar) => (
                    <LoungeRow
                      key={cigar.id}
                      cigar={cigar}
                      mine={stats.get(cigar.id)}
                      selected={cigar.id === shownId}
                      onKnown={() => cycleKnown(cigar)}
                      onEdit={() => setEditingId(cigar.id)}
                    />
                  ))}
                </Fragment>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="journal-detail" aria-label="Cigar detail">
        {shownId ? (
          <CigarPage key={shownId} id={shownId} backHref="/lounge" />
        ) : (
          <p className="journal-detail-empty muted">Pick a lounge stick to see it here.</p>
        )}
      </section>

      <LoungeForm
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(cigar) => showToast({ message: `${cigarTitle(cigar)} is on the lounge list` })}
      />
      <LoungeForm
        open={editingId !== null}
        cigarId={editingId ?? undefined}
        onClose={() => setEditingId(null)}
        onSaved={() => showToast({ message: 'Lounge note saved' })}
      />
      <StudyCards open={deck !== null} deck={deck ?? []} onClose={() => setDeck(null)} />
    </div>
  )
}

interface RowProps {
  cigar: LoungeCigar
  mine: CigarStats | undefined
  selected: boolean
  onKnown: () => void
  onEdit: () => void
}

function LoungeRow({ cigar, mine, selected, onKnown, onEdit }: RowProps) {
  const flavors = cigarFlavors(cigar).slice(0, 3)
  const known = cigar.lounge.known
  const title = cigarTitle(cigar)
  return (
    <li className="lounge-item">
      <Link
        href={`/lounge/${cigar.id}`}
        className="lounge-row"
        aria-current={selected ? 'true' : undefined}
      >
        <Monogram brand={cigar.brand || cigar.line} />
        <span className="pick-main">
          <span className="pick-brand">{cigar.brand}</span>
          <span className="pick-title">{title}</span>
          <span className="pick-sub">
            <WrapperDot wrapper={cigar.wrapperType} />
            {cigar.strength && <span>{levelLabel(cigar.strength)}</span>}
            {cigar.priceTier && <span>{priceLabel(cigar.priceTier)}</span>}
            {cigar.lounge.price !== null && (
              <span className="num">{formatMoney(cigar.lounge.price)}</span>
            )}
            {cigar.lounge.shelf && <span>{cigar.lounge.shelf}</span>}
          </span>
          {flavors.length > 0 && <FlavorTags tags={flavors} />}
        </span>
        {mine?.average !== null && mine?.average !== undefined && (
          <span className="cigar-row-score">
            <ScoreRing shown={mine.average} size={48} stroke={3}>
              <span className="ring-num num">{mine.average}</span>
            </ScoreRing>
            <span className="verdict num">
              {mine.count} {mine.count === 1 ? 'smoke' : 'smokes'}
            </span>
          </span>
        )}
      </Link>
      <span className="lounge-side">
        <button
          type="button"
          className="know-chip"
          data-known={known}
          aria-label={`${title}: ${KNOWN_LABELS[known]}. Tap to change`}
          onClick={onKnown}
        >
          {KNOWN_LABELS[known]}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Edit the lounge note for ${title}`}
          onClick={onEdit}
        >
          <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </span>
    </li>
  )
}
