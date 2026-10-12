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
  'dark chocolate',
  'caramel',
  'baking spice',
  'toast',
  'dried fruit',
  'hay',
]

/** What a cigar tends to smell like before it is lit. */
export const AROMA_TAGS = [
  'hay',
  'barnyard',
  'cedar',
  'cocoa',
  'earth',
  'leather',
  'raisin',
  'sweet tobacco',
  'dried fruit',
  'coffee',
  'nuts',
  'pepper',
]

/** One-tap flavors: the ones used lately, then the starter set to fill the row. */
export function suggestedTags(smokes: Iterable<Smoke>, count = 16): string[] {
  const recent = recentTags(smokes, count)
  return [...recent, ...STARTER_TAGS.filter((tag) => !recent.includes(tag))].slice(0, count)
}

interface Props {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  /** Quick log allows 3. Thirds have no limit. */
  max?: number
  /** A fixed set of one-tap chips, in place of the recently used flavors. */
  suggest?: string[]
  /** How many one-tap chips to show. */
  count?: number
  /** The button that opens the whole list. */
  more?: string
}

/** Recent flavors as one-tap chips, with the full family picker behind "More flavors". */
export function FlavorField({
  label,
  tags,
  onChange,
  max,
  suggest,
  count,
  more = 'More flavors',
}: Props) {
  const state = useStore()
  const [picking, setPicking] = useState(false)
  // Worked out once when the screen opens: recent flavors first, topped up with a starter
  // set. Fixing the order means chips never jump while they are being tapped.
  const [base] = useState(() => suggest ?? suggestedTags(state.smokes.values(), count))
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
        {more}
      </button>
      <Sheet
        open={picking}
        title={label}
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
