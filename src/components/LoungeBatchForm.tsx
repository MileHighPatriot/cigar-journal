import { Armchair } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { addManyToLounge } from '../data/store'
import type { Cigar } from '../data/types'
import { cigarTitle } from '../domain/format'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  /** The ticked cigars, in list order. */
  cigars: Cigar[]
  onClose: () => void
  onDone: (added: number, undo: () => Promise<void>) => void
}

/** Puts every ticked cigar on the lounge list at once, all with the same spot in the humidor. */
export function LoungeBatchForm({ open, cigars, onClose, onDone }: Props) {
  return (
    <Sheet open={open} title={`Add ${cigars.length} to the lounge`} onClose={onClose}>
      {open && (
        <Form
          key={cigars.map((cigar) => cigar.id).join()}
          cigars={cigars}
          onClose={onClose}
          onDone={onDone}
        />
      )}
    </Sheet>
  )
}

function Form({ cigars, onClose, onDone }: Omit<Props, 'open'>) {
  const [shelf, setShelf] = useState('')
  const already = cigars.filter((cigar) => cigar.lounge).length
  const shown = cigars.slice(0, 6)

  function submit(event: FormEvent) {
    event.preventDefault()
    const { added, undo } = addManyToLounge(
      cigars.map((cigar) => cigar.id),
      { shelf: shelf.trim() },
    )
    onDone(added, undo)
    onClose()
  }

  return (
    <form className="stack" onSubmit={submit}>
      <ul className="batch-names">
        {shown.map((cigar) => (
          <li key={cigar.id}>{cigarTitle(cigar)}</li>
        ))}
        {cigars.length > shown.length && (
          <li className="muted num">and {cigars.length - shown.length} more</li>
        )}
      </ul>
      <label className="field">
        <span>Where they sit</span>
        <input
          className="input"
          placeholder="Padron case, top shelf"
          value={shelf}
          onChange={(event) => setShelf(event.target.value)}
          autoComplete="off"
        />
        <span className="muted field-help">
          One spot for all of them. Leave it blank if they are spread around.
        </span>
      </label>
      {already > 0 && (
        <p className="muted num">
          {already === 1 ? '1 is' : `${already} are`} already on the list. They keep their notes and
          take this spot when you give one.
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          <Armchair size={20} strokeWidth={1.5} aria-hidden="true" />
          Add {cigars.length}
        </button>
      </div>
    </form>
  )
}
