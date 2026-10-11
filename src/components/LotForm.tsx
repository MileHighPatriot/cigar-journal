import { Minus, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { newLot } from '../data/factories'
import { saveRecord, useStore } from '../data/store'
import type { Cigar, Lot } from '../data/types'
import { addDays } from '../domain/humidor'
import { CigarChooser } from './CigarChooser'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  /** The lot to edit, or null to add one. */
  lot: Lot | null
  /** Pre-picked cigar when adding from a cigar's page. */
  cigarId?: string
  onClose: () => void
  onSaved: (lot: Lot) => void
}

const REST_CHOICES: { label: string; days: number }[] = [
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 182 },
]

export function LotForm({ open, lot, cigarId, onClose, onSaved }: Props) {
  return (
    <Sheet open={open} title={lot ? 'Edit lot' : 'Add to humidor'} onClose={onClose}>
      {open && (
        <Form
          key={lot?.id ?? cigarId ?? 'new'}
          lot={lot}
          cigarId={cigarId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  )
}

function Form({ lot, cigarId, onClose, onSaved }: Omit<Props, 'open'>) {
  const state = useStore()
  const [draft, setDraft] = useState<Lot>(() => lot ?? newLot(cigarId ?? ''))
  const [price, setPrice] = useState(lot?.priceEach === null || !lot ? '' : String(lot.priceEach))
  const cigar: Cigar | undefined = state.cigars.get(draft.cigarId)
  const valid = Boolean(cigar) && draft.quantityPurchased >= 1

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!valid) return
    const amount = Number.parseFloat(price.replace(/[^0-9.]/g, ''))
    const saved = { ...draft, priceEach: Number.isFinite(amount) ? amount : null }
    void saveRecord('lots', saved)
    onSaved(saved)
    onClose()
  }

  const setQuantity = (value: number) =>
    setDraft({ ...draft, quantityPurchased: Math.max(1, Math.min(999, Math.round(value) || 1)) })

  return (
    <form className="stack" onSubmit={submit}>
      <CigarChooser
        cigarId={draft.cigarId}
        locked={lot !== null}
        onChange={(id) => setDraft({ ...draft, cigarId: id })}
      />

      {cigar && (
        <>
          <div className="field">
            <span id="lot-quantity-label">How many</span>
            <div className="stepper">
              <button
                type="button"
                className="btn btn-quiet"
                aria-label="One fewer"
                onClick={() => setQuantity(draft.quantityPurchased - 1)}
              >
                <Minus size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <input
                className="input num"
                inputMode="numeric"
                aria-labelledby="lot-quantity-label"
                value={draft.quantityPurchased}
                onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10))}
              />
              <button
                type="button"
                className="btn btn-quiet"
                aria-label="One more"
                onClick={() => setQuantity(draft.quantityPurchased + 1)}
              >
                <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Price each</span>
              <input
                className="input num"
                inputMode="decimal"
                placeholder="$"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Bought on</span>
              <input
                type="date"
                className="input num"
                value={draft.purchaseDate}
                onChange={(event) =>
                  setDraft({ ...draft, purchaseDate: event.target.value || draft.purchaseDate })
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Where bought</span>
            <input
              className="input"
              value={draft.boughtAt}
              onChange={(event) => setDraft({ ...draft, boughtAt: event.target.value })}
              autoCapitalize="words"
            />
          </label>

          <div className="field">
            <span id="lot-rest-label">Let it rest</span>
            <div className="chip-row" role="group" aria-labelledby="lot-rest-label">
              <button
                type="button"
                className="chip"
                aria-pressed={draft.restUntil === null}
                onClick={() => setDraft({ ...draft, restUntil: null })}
              >
                Ready now
              </button>
              {REST_CHOICES.map((choice) => {
                const date = addDays(draft.purchaseDate, choice.days)
                return (
                  <button
                    key={choice.label}
                    type="button"
                    className="chip"
                    aria-pressed={draft.restUntil === date}
                    onClick={() => setDraft({ ...draft, restUntil: date })}
                  >
                    {choice.label}
                  </button>
                )
              })}
            </div>
            <label className="field">
              <span>Rest until</span>
              <input
                type="date"
                className="input num"
                value={draft.restUntil ?? ''}
                onChange={(event) => setDraft({ ...draft, restUntil: event.target.value || null })}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Box date</span>
              <input
                type="date"
                className="input num"
                value={draft.boxDate ?? ''}
                onChange={(event) => setDraft({ ...draft, boxDate: event.target.value || null })}
              />
            </label>
            <label className="field">
              <span>Box code</span>
              <input
                className="input"
                value={draft.boxCode}
                onChange={(event) => setDraft({ ...draft, boxCode: event.target.value })}
                autoCapitalize="characters"
              />
            </label>
          </div>

          {lot && (
            <label className="field">
              <span>Gave away or tossed</span>
              <input
                className="input num"
                inputMode="numeric"
                value={draft.quantityRemoved}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    quantityRemoved: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                  })
                }
              />
            </label>
          )}

          <label className="field">
            <span>Notes</span>
            <textarea
              className="input textarea"
              rows={2}
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </label>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!valid}>
          Save
        </button>
      </div>
    </form>
  )
}
