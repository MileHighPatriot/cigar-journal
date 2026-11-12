import { Fragment, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { LabelArt } from '../components/LabelArt'
import { Monogram, WrapperDot } from '../components/Monogram'
import { setShelfPrice, useStore } from '../data/store'
import type { PriceTier } from '../data/types'
import { priceLabel } from '../domain/cigars'
import { cigarTitle } from '../domain/format'
import { GUESTS, type GuestKey, PICKS, type PickRow, picksFor, pricedCount } from '../domain/picks'
import { levelLabel } from '../domain/scoring'

const TIERS: PriceTier[] = [1, 2, 3, 4]

/** What to hand a guest: four sticks for each kind of smoker at each strength. */
export function Picks() {
  const state = useStore()
  const [guest, setGuest] = useState<GuestKey>('new')
  const groups = useMemo(() => picksFor(guest, state.cigars), [guest, state.cigars])
  const priced = useMemo(() => pricedCount(state.cigars), [state.cigars])
  const tip = GUESTS.find((entry) => entry.key === guest)?.tip

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
            <dd className="num">{PICKS.length}</dd>
          </div>
          <div>
            <dt>Priced</dt>
            <dd className="num">{priced}</dd>
          </div>
          <div>
            <dt>To price</dt>
            <dd className="num">{PICKS.length - priced}</dd>
          </div>
        </dl>
      </header>

      <div className="filters">
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
            {group.rows.map((row) => (
              <PickItem key={row.cigarId} row={row} />
            ))}
          </Fragment>
        ))}
      </ul>

      <p className="muted picks-foot">
        Each set runs from the cheapest to the priciest, going by prices online. Tap a price when
        you have seen it on the shelf. Tap it again to clear it.
      </p>
    </div>
  )
}

function PickItem({ row }: { row: PickRow }) {
  const { cigar } = row
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
            {!checked && <span>About ${row.online} online</span>}
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
    </li>
  )
}
