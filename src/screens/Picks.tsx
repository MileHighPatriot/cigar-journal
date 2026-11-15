import { ChevronDown } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { LabelArt } from '../components/LabelArt'
import { Monogram, WrapperDot } from '../components/Monogram'
import { setShelfPrice, useStore } from '../data/store'
import type { PriceTier } from '../data/types'
import { priceLabel } from '../domain/cigars'
import { cigarTitle } from '../domain/format'
import {
  diamondCrown,
  GUESTS,
  type GuestKey,
  type PickRow,
  picksFor,
  pickWeek,
  pricedCount,
  weekPicks,
} from '../domain/picks'
import { levelLabel } from '../domain/scoring'

const TIERS: PriceTier[] = [1, 2, 3, 4]

/** The parts of a pick's description, in the order he would say them. */
const TELL: { key: 'story' | 'leaf' | 'taste' | 'proof'; label: string }[] = [
  { key: 'story', label: 'The story' },
  { key: 'leaf', label: 'The leaf' },
  { key: 'taste', label: 'The taste' },
  { key: 'proof', label: 'The proof' },
]

/** What to hand a guest: four sticks for each kind of smoker at each strength. */
export function Picks() {
  const state = useStore()
  const [view, setView] = useState<'week' | 'crown'>('week')
  const [guest, setGuest] = useState<GuestKey>('new')
  // Worked out on each visit, so a new set is there the first time he opens it on a Sunday.
  const week = pickWeek()
  const crown = view === 'crown'
  const series = useMemo(() => diamondCrown(state.cigars), [state.cigars])
  const weekTotal = useMemo(() => weekPicks(week, state.cigars).length, [week, state.cigars])
  const weekGroups = useMemo(() => picksFor(guest, state.cigars, week), [guest, state.cigars, week])
  const weekPriced = useMemo(() => pricedCount(state.cigars, week), [state.cigars, week])
  const seriesRows = series.flatMap((group) => group.rows)
  const groups = crown ? series : weekGroups
  const total = crown ? seriesRows.length : weekTotal
  const priced = crown
    ? seriesRows.filter((row) => row.cigar && row.cigar.priceCheckedAt !== null).length
    : weekPriced
  const tip = crown
    ? 'The only Diamond Crown lounge in Colorado, and the whole series is on the shelf. J.C. Newman owns the name and the Fuente family rolls every one.'
    : GUESTS.find((entry) => entry.key === guest)?.tip

  return (
    <div className="page">
      <header className="hero">
        <LabelArt compact scene="salon" />
        <div className="hero-top">
          <h1>Picks</h1>
        </div>
        <dl className="hero-facts">
          <div>
            <dt>Picks</dt>
            <dd className="num">{total}</dd>
          </div>
          <div>
            <dt>Priced</dt>
            <dd className="num">{priced}</dd>
          </div>
          <div>
            <dt>To price</dt>
            <dd className="num">{total - priced}</dd>
          </div>
        </dl>
      </header>

      <div className="filters">
        <div className="segmented" role="group" aria-label="Which picks">
          <button type="button" aria-pressed={!crown} onClick={() => setView('week')}>
            This week
          </button>
          <button type="button" aria-pressed={crown} onClick={() => setView('crown')}>
            Diamond Crown
          </button>
        </div>
        {!crown && (
          <div className="segmented segmented-3" role="group" aria-label="Guest">
            {GUESTS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                aria-pressed={guest === entry.key}
                onClick={() => setGuest(entry.key)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        )}
        <p className="muted picks-tip">{tip}</p>
      </div>

      <ul className="lounge-list">
        {groups.map((group) => (
          <Fragment key={group.strength}>
            <li className="lounge-head" data-group={group.strength}>
              <span className="lounge-head-mark" aria-hidden="true">
                {group.levels.map((level) => (
                  <span key={level} data-level={level} />
                ))}
              </span>
              <span>{group.label}</span>
            </li>
            {group.rows.map((row, index) => (
              <PickItem key={row.cigarId} row={row} guess={crown ? null : index + 1} />
            ))}
          </Fragment>
        ))}
      </ul>

      <p className="muted picks-foot">
        {crown
          ? 'This is the whole Diamond Crown series, mildest first. It stays put every week.'
          : "These are this week's picks. A new set comes up every Sunday. Each set runs from the cheapest to the priciest."}{' '}
        Tap a price when you have seen it on the shelf. Tap it again to clear it.
      </p>
    </div>
  )
}

/**
 * `guess` is the stick's place in its set of four, cheapest first, shown as money signs.
 * Null when the row is not part of a priced set.
 */
function PickItem({ row, guess }: { row: PickRow; guess: number | null }) {
  const { cigar } = row
  const [open, setOpen] = useState(false)
  const tell = (
    <>
      <span className="lounge-side">
        <button
          type="button"
          className="like-chip tell-chip"
          aria-expanded={open}
          onClick={() => setOpen((was) => !was)}
        >
          What to tell them
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </span>
      {open && (
        <dl className="lounge-more tell">
          {TELL.map(
            ({ key, label }) =>
              row[key] && (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{row[key]}</dd>
                </div>
              ),
          )}
        </dl>
      )}
    </>
  )
  if (!cigar) {
    return (
      <li className="lounge-item">
        <span className="lounge-row">
          <Monogram brand={row.name} />
          <span className="pick-main">
            <span className="pick-title">{row.name}</span>
            <span className="lounge-gap">{row.why}</span>
            <span className="lounge-gap">Not in your cigar list.</span>
          </span>
        </span>
        {tell}
      </li>
    )
  }
  const title = cigarTitle(cigar)
  const checked = cigar.priceCheckedAt !== null
  return (
    <li className="lounge-item">
      <Link href={`/cigars/${cigar.id}`} className="lounge-row">
        <Monogram brand={cigar.brand || cigar.line} />
        <span className="pick-main">
          <span className="pick-brand">{cigar.brand}</span>
          <span className="pick-title">{title}</span>
          <span className="pick-sub">
            <WrapperDot wrapper={cigar.wrapperType} />
            {cigar.strength && <span>{levelLabel(cigar.strength)}</span>}
            {!checked && guess !== null && <span>Likely {priceLabel(guess)}</span>}
            {!cigar.lounge && <span>Not on your lounge list</span>}
          </span>
          <span className="picks-why">{row.why}</span>
        </span>
      </Link>
      <span className="lounge-side">
        <span className="price-taps" role="radiogroup" aria-label={`Price of ${title}`}>
          {TIERS.map((tier) => {
            const on = checked && cigar.priceTier === tier
            return (
              <button
                key={tier}
                type="button"
                role="radio"
                className="chip num"
                aria-checked={on}
                aria-label={`${tier} of 4`}
                onClick={() => void setShelfPrice(cigar.id, on ? null : tier)}
              >
                {priceLabel(tier)}
              </button>
            )
          })}
        </span>
      </span>
      {tell}
    </li>
  )
}
