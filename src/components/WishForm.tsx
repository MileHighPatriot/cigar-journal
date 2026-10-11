import { type FormEvent, useState } from 'react'
import { nowIso } from '../data/repository'
import { saveRecord } from '../data/store'
import type { WishlistItem } from '../data/types'
import { CigarChooser } from './CigarChooser'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  /** The item to edit, or null to add one. */
  item: WishlistItem | null
  /** Pre-picked cigar when adding from a cigar's page. */
  cigarId?: string
  onClose: () => void
  onSaved: (item: WishlistItem) => void
}

export function newWish(cigarId: string): WishlistItem {
  const now = nowIso()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    cigarId,
    why: '',
    heardFrom: '',
    status: 'open',
    boughtLotId: null,
  }
}

export function WishForm({ open, item, cigarId, onClose, onSaved }: Props) {
  return (
    <Sheet open={open} title={item ? 'Edit wish' : 'Add to wishlist'} onClose={onClose}>
      {open && (
        <Form
          key={item?.id ?? cigarId ?? 'new'}
          item={item}
          cigarId={cigarId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  )
}

function Form({ item, cigarId, onClose, onSaved }: Omit<Props, 'open'>) {
  const [draft, setDraft] = useState<WishlistItem>(() => item ?? newWish(cigarId ?? ''))
  const valid = draft.cigarId !== ''

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!valid) return
    const saved = { ...draft, why: draft.why.trim(), heardFrom: draft.heardFrom.trim() }
    void saveRecord('wishlist', saved)
    onSaved(saved)
    onClose()
  }

  return (
    <form className="stack" onSubmit={submit}>
      <CigarChooser
        cigarId={draft.cigarId}
        locked={item !== null}
        onChange={(id) => setDraft({ ...draft, cigarId: id })}
      />
      {valid && (
        <>
          <label className="field">
            <span>Why you want it</span>
            <textarea
              className="input textarea"
              rows={2}
              value={draft.why}
              onChange={(event) => setDraft({ ...draft, why: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Where you heard about it</span>
            <input
              className="input"
              value={draft.heardFrom}
              onChange={(event) => setDraft({ ...draft, heardFrom: event.target.value })}
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
