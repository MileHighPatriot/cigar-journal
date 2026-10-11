import { useState } from 'react'
import { useStore } from '../data/store'
import type { Smoke } from '../data/types'
import { recentTags } from '../domain/tags'
import { Sheet } from './Sheet'
import { TagPicker } from './TagPicker'

/** Shown until there is some history to draw recent tags from. */
export const STARTER_TAGS = [
  'cedar',
  'leather',
  'earth',
  'cream',
  'coffee',
  'cocoa',
  'espresso',
  'black pepper',
  'white pepper',
  'nuts',
  'oak',
  'sweet',
]

/** Twelve one-tap flavors: the ones used lately, then the starter set to fill the row. */
export function suggestedTags(smokes: Iterable<Smoke>): string[] {
  const recent = recentTags(smokes)
  return [...recent, ...STARTER_TAGS.filter((tag) => !recent.includes(tag))].slice(0, 12)
}

interface Props {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  /** Quick log allows 3. Thirds have no limit. */
  max?: number
}

/** Recent flavors as one-tap chips, with the full family picker behind "More flavors". */
export function FlavorField({ label, tags, onChange, max }: Props) {
  const state = useStore()
  const [picking, setPicking] = useState(false)
  // Worked out once when the screen opens: recent flavors first, topped up with a starter
  // set. Fixing the order means chips never jump while they are being tapped.
  const [base] = useState(() => suggestedTags(state.smokes.values()))
  const full = max !== undefined && tags.length >= max
  // Tags picked in the full picker go in front.
  const suggestions = [...tags.filter((tag) => !base.includes(tag)), ...base]

  function toggle(tag: string) {
    if (tags.includes(tag)) onChange(tags.filter((t) => t !== tag))
    else if (!full) onChange([...tags, tag])
  }

  return (
    <section className="stack">
      <div className="section-head">
        <h2>{label}</h2>
        <span className="muted num">
          {max === undefined ? `${tags.length} picked` : `${tags.length} of ${max}`}
        </span>
      </div>
      <div className="chip-row" role="group" aria-label={label}>
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            className="chip"
            aria-pressed={tags.includes(tag)}
            disabled={full && !tags.includes(tag)}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-quiet" onClick={() => setPicking(true)}>
        More flavors
      </button>
      <Sheet
        open={picking}
        title="Flavors"
        onClose={() => setPicking(false)}
        footer={
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => setPicking(false)}
          >
            Done
          </button>
        }
      >
        <TagPicker selected={tags} max={max} onChange={onChange} />
      </Sheet>
    </section>
  )
}
