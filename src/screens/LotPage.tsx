import { ChevronLeft, Gift, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { LabelArt } from '../components/LabelArt'
import { LotForm } from '../components/LotForm'
import { WrapperDot } from '../components/Monogram'
import { Pips } from '../components/Pips'
import { showToast } from '../components/toast'
import { restoreRecord, saveRecord, softDelete, startLog, useStore } from '../data/store'
import {
  cigarTitle,
  formatDate,
  formatDay,
  formatMinutes,
  formatMoney,
  plural,
} from '../domain/format'
import { daysAged, remaining, restInfo, smokedCountByLot } from '../domain/humidor'
import { levelLabel, shownScore, verdictFor } from '../domain/scoring'
import { smokeSize } from '../domain/sizes'

export function LotPage({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [editing, setEditing] = useState(false)
  const lot = state.lots.get(id)

  const smokes = useMemo(
    () =>
      [...state.smokes.values()]
        .filter((smoke) => smoke.lotId === id && !smoke.deletedAt)
        .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1)),
    [state.smokes, id],
  )

  if (!lot || lot.deletedAt) {
    return (
      <div className="detail">
        <p className="muted">This lot is not in your humidor.</p>
        <Link href="/humidor" className="btn btn-quiet">
          Back to humidor
        </Link>
      </div>
    )
  }

  const cigar = state.cigars.get(lot.cigarId)
  const smoked = smokedCountByLot(state.smokes.values())
  const left = remaining(lot, smoked)
  const total = lot.quantityPurchased
  const rest = restInfo(lot)
  const aged = daysAged(lot)

  const facts: [string, string | null][] = [
    ['Bought on', formatDay(lot.purchaseDate)],
    ['Where', lot.boughtAt || null],
    ['Price each', lot.priceEach === null ? null : formatMoney(lot.priceEach)],
    ['Value left', lot.priceEach === null ? null : formatMoney(left * lot.priceEach)],
    ['Aged', plural(aged, 'day')],
    ['Rest until', lot.restUntil ? formatDay(lot.restUntil) : null],
    ['Box date', lot.boxDate ? formatDay(lot.boxDate) : null],
    ['Box code', lot.boxCode || null],
    ['Smoked', String(smoked.get(lot.id) ?? 0)],
    ['Gave away or tossed', lot.quantityRemoved > 0 ? String(lot.quantityRemoved) : null],
  ]

  async function log() {
    if (!lot) return
    navigate(await startLog(lot.cigarId, lot.id))
  }

  function giveAway() {
    if (!lot) return
    void saveRecord('lots', { ...lot, quantityRemoved: lot.quantityRemoved + 1 })
    showToast({
      message: 'One taken out of the count',
      actionLabel: 'Undo',
      onAction: () => void saveRecord('lots', { ...lot, quantityRemoved: lot.quantityRemoved }),
    })
  }

  function remove() {
    void softDelete('lots', id)
    navigate('/humidor')
    showToast({
      message: 'Lot removed',
      actionLabel: 'Undo',
      onAction: () => void restoreRecord('lots', id),
    })
  }

  return (
    <article className="detail">
      <div className="detail-bar">
        <Link href="/humidor" className="icon-btn detail-back" aria-label="Back to humidor">
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      <LabelArt compact scene="humidor" />

      <header className="detail-head">
        <div>
          <p className="band-brand">{cigar?.brand || 'Unknown brand'}</p>
          <h1>{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</h1>
          <p className="detail-facts">
            <WrapperDot wrapper={cigar?.wrapperType ?? null} />
            {cigar?.strength && <span>{levelLabel(cigar.strength)}</span>}
            {cigar && (
              <Link href={`/cigars/${cigar.id}`} className="text-link">
                Cigar page
              </Link>
            )}
          </p>
        </div>
        <div className="detail-score">
          <span className="numeral numeral-lg num">{left}</span>
          <span className="verdict num">of {total} left</span>
        </div>
      </header>

      <Pips left={left} total={total} />

      {rest.resting ? (
        <div className="rest">
          <span className="rest-bar" aria-hidden="true">
            <span style={{ width: `${rest.progress * 100}%` }} />
          </span>
          <span className="muted">Resting. Ready in {plural(rest.daysLeft, 'day')}.</span>
        </div>
      ) : (
        left > 0 && <p className="ready-line">Ready to smoke</p>
      )}

      <div className="detail-actions detail-actions-top">
        <button
          type="button"
          className="btn btn-primary btn-log"
          disabled={left === 0}
          onClick={() => void log()}
        >
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
          Log a smoke from this lot
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setEditing(true)}>
          <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
          Edit
        </button>
        <button type="button" className="btn btn-quiet" disabled={left === 0} onClick={giveAway}>
          <Gift size={20} strokeWidth={1.5} aria-hidden="true" />
          Gave one away
        </button>
      </div>

      <section className="detail-section">
        <h2>Lot details</h2>
        <dl className="facts">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="num">{value}</dd>
              </div>
            ))}
        </dl>
        {lot.notes && <p className="detail-note">{lot.notes}</p>}
      </section>

      <section className="detail-section">
        <h2>Smoked from this lot</h2>
        {smokes.length === 0 ? (
          <p className="muted">None yet.</p>
        ) : (
          <ul className="mini-list">
            {smokes.map((smoke) => {
              const shown = smoke.score === null ? null : shownScore(smoke.score)
              const meta = [
                formatDate(smoke.smokedAt),
                smokeSize(smoke, cigar),
                formatMinutes(smoke.durationMin),
                smoke.status === 'draft' ? 'In progress' : '',
              ].filter(Boolean)
              return (
                <li key={smoke.id}>
                  <Link href={`/smokes/${smoke.id}`} className="mini-row">
                    <span className="mini-main">
                      <span className="num">{meta.join(' · ')}</span>
                    </span>
                    {shown === null ? (
                      <span className="muted">No score</span>
                    ) : (
                      <span className="mini-score">
                        <span className="numeral numeral-sm num">{shown}</span>
                        <span className="verdict" data-verdict={verdictFor(shown)}>
                          {verdictFor(shown)}
                        </span>
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="detail-actions">
        <button type="button" className="btn btn-quiet" onClick={remove}>
          <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
          Remove lot
        </button>
      </div>

      <LotForm
        open={editing}
        lot={lot}
        onClose={() => setEditing(false)}
        onSaved={() => showToast({ message: 'Lot saved' })}
      />
    </article>
  )
}
