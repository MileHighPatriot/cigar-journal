import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { nowIso } from '../data/repository'
import { saveRecord, useStore } from '../data/store'
import { familiesWithCustom, normalizeTag, OFF_NOTES, recentTags } from '../domain/tags'

interface Props {
  selected: string[]
  onChange: (tags: string[]) => void
  /** Quick log allows up to 3. Thirds have no limit. */
  max?: number
}

/** Family first, then the word. Recently used tags come first. Custom tags can be added. */
export function TagPicker({ selected, onChange, max }: Props) {
  const state = useStore()
  const [openFamily, setOpenFamily] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const families = useMemo(() => familiesWithCustom(state.customTags.values()), [state.customTags])
  const recent = useMemo(() => recentTags(state.smokes.values()), [state.smokes])
  const full = max !== undefined && selected.length >= max

  function toggle(word: string) {
    if (selected.includes(word)) onChange(selected.filter((tag) => tag !== word))
    else if (!full) onChange([...selected, word])
  }

  function addCustom(family: string) {
    const label = normalizeTag(custom)
    if (!label) return
    const known = families.some((f) => f.words.includes(label))
    if (!known) {
      const now = nowIso()
      void saveRecord('customTags', {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        label,
        family,
      })
    }
    if (!selected.includes(label) && !full) onChange([...selected, label])
    setCustom('')
  }

  const chip = (word: string) => (
    <button
      key={word}
      type="button"
      className="chip"
      aria-pressed={selected.includes(word)}
      disabled={full && !selected.includes(word)}
      onClick={() => toggle(word)}
    >
      {word}
    </button>
  )

  const offNoteTips = OFF_NOTES.filter((note) => selected.includes(note.word))

  return (
    <div className="tagpicker">
      {max !== undefined && (
        <p className="muted num" aria-live="polite">
          {selected.length} of {max} picked
        </p>
      )}
      {selected.length > 0 && (
        <div className="chip-row" role="group" aria-label="Picked flavors">
          {selected.map(chip)}
        </div>
      )}
      {recent.length > 0 && (
        <section>
          <h3 className="tagpicker-heading">Recent</h3>
          <div className="chip-row">{recent.filter((w) => !selected.includes(w)).map(chip)}</div>
        </section>
      )}
      <section>
        <h3 className="tagpicker-heading">Flavor families</h3>
        <ul className="family-list">
          {families.map((family) => {
            const open = openFamily === family.key
            return (
              <li key={family.key}>
                <button
                  type="button"
                  className="family-row"
                  aria-expanded={open}
                  onClick={() => setOpenFamily(open ? null : family.key)}
                >
                  <span>{family.label}</span>
                  <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
                {open && (
                  <div className="family-words">
                    <div className="chip-row">{family.words.map(chip)}</div>
                    <form
                      className="family-add"
                      onSubmit={(event) => {
                        event.preventDefault()
                        addCustom(family.key)
                      }}
                    >
                      <label className="sr-only" htmlFor={`add-${family.key}`}>
                        Add your own {family.label} flavor
                      </label>
                      <input
                        id={`add-${family.key}`}
                        className="input"
                        placeholder="Add your own"
                        value={custom}
                        onChange={(event) => setCustom(event.target.value)}
                        autoCapitalize="none"
                      />
                      <button type="submit" className="btn btn-quiet" disabled={!custom.trim()}>
                        Add
                      </button>
                    </form>
                  </div>
                )}
              </li>
            )
          })}
          <li>
            <button
              type="button"
              className="family-row"
              aria-expanded={openFamily === 'off'}
              onClick={() => setOpenFamily(openFamily === 'off' ? null : 'off')}
            >
              <span>Off-notes</span>
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
            {openFamily === 'off' && (
              <div className="family-words">
                <div className="chip-row">{OFF_NOTES.map((note) => chip(note.word))}</div>
              </div>
            )}
          </li>
        </ul>
      </section>
      {offNoteTips.map((note) => (
        <p key={note.word} className="banner">
          <span>
            <strong>{note.word}:</strong> {note.tip}
          </span>
        </p>
      ))}
    </div>
  )
}
