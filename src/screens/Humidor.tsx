import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { LAPTOP, useMediaQuery } from '../components/hooks'
import { LabelArt } from '../components/LabelArt'
import { LotForm } from '../components/LotForm'
import { Monogram, WrapperDot } from '../components/Monogram'
import { Pips } from '../components/Pips'
import { showToast } from '../components/toast'
import { useStore } from '../data/store'
import type { Cigar, Lot } from '../data/types'
import { cigarTitle, formatMoney, plural } from '../domain/format'
import { daysAged, humidorTotals, remaining, restInfo, smokedCountByLot } from '../domain/humidor'
import { LotPage } from './LotPage'

interface Row {
  lot: Lot
  cigar: Cigar | undefined
  left: number
  aged: number
  rest: ReturnType<typeof restInfo>
}

function LotCard({ row, selected, index }: { row: Row; selected: boolean; index: number }) {
  const { lot, cigar, left, aged, rest } = row
  return (
    <li className="card-item" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link
        href={`/humidor/${lot.id}`}
        className={left === 0 ? 'lot-card is-empty' : 'lot-card'}
        aria-current={selected ? 'true' : undefined}
      >
        <span className="lot-card-top">
          <Monogram brand={cigar?.brand || cigar?.line || '?'} />
          <span className="pick-main">
            <span className="pick-brand">{cigar?.brand || 'Unknown brand'}</span>
            <span className="pick-title">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
            <span className="pick-sub">
              <WrapperDot wrapper={cigar?.wrapperType ?? null} />
            </span>
          </span>
          <span className="lot-count">
            <span className="numeral numeral-sm num">{left}</span>
            <span className="verdict num">of {lot.quantityPurchased} left</span>
          </span>
        </span>
        <Pips left={left} total={lot.quantityPurchased} />
        {rest.resting ? (
          <span className="rest">
            <span className="rest-bar" aria-hidden="true">
              <span style={{ width: `${rest.progress * 100}%` }} />
            </span>
            <span className="lot-meta num">Ready in {plural(rest.daysLeft, 'day')}</span>
          </span>
        ) : (
          <span className="lot-meta num">
            {left > 0 && <span className="ready-line">Ready</span>}
            <span>Aged {plural(aged, 'day')}</span>
            {lot.priceEach !== null && left > 0 && <span>{formatMoney(left * lot.priceEach)}</span>}
          </span>
        )}
      </Link>
    </li>
  )
}

export function Humidor({ selectedId }: { selectedId?: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [adding, setAdding] = useState(false)
  const laptop = useMediaQuery(LAPTOP)

  const { ready, resting, empty, totals } = useMemo(() => {
    const smoked = smokedCountByLot(state.smokes.values())
    const rows: Row[] = [...state.lots.values()]
      .filter((lot) => !lot.deletedAt)
      .map((lot) => ({
        lot,
        cigar: state.cigars.get(lot.cigarId),
        left: remaining(lot, smoked),
        aged: daysAged(lot),
        rest: restInfo(lot),
      }))
    const withSome = rows.filter((row) => row.left > 0)
    return {
      // Longest-aged first: those are the ones to reach for.
      ready: withSome.filter((row) => !row.rest.resting).sort((a, b) => b.aged - a.aged),
      resting: withSome
        .filter((row) => row.rest.resting)
        .sort((a, b) => a.rest.daysLeft - b.rest.daysLeft),
      empty: rows.filter((row) => row.left === 0),
      totals: humidorTotals(state.lots.values(), smoked),
    }
  }, [state.lots, state.smokes, state.cigars])

  const all = [...ready, ...resting, ...empty]
  const shownId = selectedId ?? (laptop ? all[0]?.lot.id : undefined)

  const section = (title: string, rows: Row[], offset: number) =>
    rows.length > 0 && (
      <>
        <li className="month-head">
          <span>
            {title} ({rows.length})
          </span>
        </li>
        {rows.map((row, index) => (
          <LotCard
            key={row.lot.id}
            row={row}
            index={offset + index}
            selected={row.lot.id === shownId}
          />
        ))}
      </>
    )

  return (
    <div className={selectedId ? 'journal has-detail' : 'journal'}>
      <section className="journal-list" aria-label="Humidor">
        <header className="hero">
          <LabelArt compact scene="humidor" />
          <div className="hero-top">
            <h1>Humidor</h1>
            <button type="button" className="btn btn-quiet" onClick={() => setAdding(true)}>
              <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
              Add
            </button>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>On hand</dt>
              <dd className="num">{totals.onHand}</dd>
            </div>
            <div>
              <dt>Ready</dt>
              <dd className="num">{totals.ready}</dd>
            </div>
            <div>
              <dt>Value</dt>
              <dd className="num">{formatMoney(Math.round(totals.value))}</dd>
            </div>
          </dl>
          {totals.onHand > 0 && (
            <div className="strength">
              <div className="split-bar" aria-hidden="true">
                <span className="split-ready" style={{ flexGrow: totals.ready }} />
                <span className="split-resting" style={{ flexGrow: totals.resting }} />
              </div>
              <span className="hero-label num">
                {totals.ready} ready to smoke, {totals.resting} resting
              </span>
            </div>
          )}
        </header>

        {all.length === 0 && (
          <div className="empty">
            <p className="empty-title">Your humidor is empty</p>
            <p className="muted">
              Add what you have on hand. Logging a smoke from it counts it down.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
              Add to humidor
            </button>
          </div>
        )}

        <ul className="card-list">
          {section('Ready to smoke', ready, 0)}
          {section('Resting', resting, ready.length)}
          {section('Finished', empty, ready.length + resting.length)}
        </ul>
      </section>

      <section className="journal-detail" aria-label="Lot detail">
        {shownId ? (
          <LotPage key={shownId} id={shownId} />
        ) : (
          <p className="journal-detail-empty muted">Pick a lot to see it here.</p>
        )}
      </section>

      <LotForm
        open={adding}
        lot={null}
        onClose={() => setAdding(false)}
        onSaved={(lot) => {
          if (laptop) navigate(`/humidor/${lot.id}`)
          showToast({ message: 'Added to your humidor' })
        }}
      />
    </div>
  )
}
