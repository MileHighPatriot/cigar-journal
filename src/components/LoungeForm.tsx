import { Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { addToLounge, patchLounge, removeFromLounge, useStore } from '../data/store'
import type { Cigar, LoungeEntry } from '../data/types'
import { newLoungeEntry } from '../domain/lounge'
import { CigarChooser } from './CigarChooser'
import { Sheet } from './Sheet'
import { showToast } from './toast'

interface Props {
  open: boolean
  /** Pre-picked cigar: from a cigar's page, or a lounge row being edited. */
  cigarId?: string
  onClose: () => void
  onSaved: (cigar: Cigar) => void
}

/** Put a cigar on the lounge list, with the lounge's price and where it sits in the humidor. */
export function LoungeForm({ open, cigarId, onClose, onSaved }: Props) {
  const state = useStore()
  const editing = cigarId ? Boolean(state.cigars.get(cigarId)?.lounge) : false
  return (
    <Sheet open={open} title={editing ? 'In the lounge' : 'Add to the lounge'} onClose={onClose}>
      {open && (
        <Form key={cigarId ?? 'new'} cigarId={cigarId} onClose={onClose} onSaved={onSaved} />
      )}
    </Sheet>
  )
}

type Fields = Pick<LoungeEntry, 'price' | 'shelf' | 'note'>

function Form({ cigarId, onClose, onSaved }: Omit<Props, 'open'>) {
  const state = useStore()
  const [chosenId, setChosenId] = useState(cigarId ?? '')
  const cigar = state.cigars.get(chosenId)
  const [fields, setFields] = useState<Fields>(() => {
    const was = cigarId ? state.cigars.get(cigarId)?.lounge : null
    return was ? { price: was.price, shelf: was.shelf, note: was.note } : newLoungeEntry()
  })
  // Picking a cigar that is already on the list edits its entry instead of starting over.
  const existing = cigar?.lounge ?? null
  const [loadedFor, setLoadedFor] = useState(cigarId ?? '')
  if (cigar && loadedFor !== cigar.id) {
    setLoadedFor(cigar.id)
    if (existing) setFields({ price: existing.price, shelf: existing.shelf, note: existing.note })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!cigar) return
    const clean = { ...fields, shelf: fields.shelf.trim(), note: fields.note.trim() }
    if (existing) void patchLounge(cigar.id, clean)
    else void addToLounge(cigar.id, clean)
    onSaved(cigar)
    onClose()
  }

  function remove() {
    if (!cigar) return
    const { undo } = removeFromLounge(cigar.id)
    onClose()
    showToast({
      message: 'Taken off the lounge list',
      actionLabel: 'Undo',
      onAction: () => void undo(),
    })
  }

  return (
    <form className="stack" onSubmit={submit}>
      <CigarChooser cigarId={chosenId} locked={cigarId !== undefined} onChange={setChosenId} />
      {cigar && (
        <>
          <div className="form-row">
            <label className="field">
              <span>Lounge price</span>
              <input
                className="input num"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                placeholder="$"
                value={fields.price ?? ''}
                onChange={(event) =>
                  setFields({
                    ...fields,
                    price: event.target.value === '' ? null : Number(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Where it sits</span>
              <input
                className="input"
                placeholder="Top shelf, left"
                value={fields.shelf}
                onChange={(event) => setFields({ ...fields, shelf: event.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>Note to self</span>
            <textarea
              className="input textarea"
              rows={2}
              placeholder="How to pitch it, who asks for it"
              value={fields.note}
              onChange={(event) => setFields({ ...fields, note: event.target.value })}
            />
          </label>
        </>
      )}
      <div className="form-actions">
        {existing && (
          <button type="button" className="btn btn-quiet lounge-remove" onClick={remove}>
            <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
            Take off the list
          </button>
        )}
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!cigar}>
          Save
        </button>
      </div>
    </form>
  )
}
