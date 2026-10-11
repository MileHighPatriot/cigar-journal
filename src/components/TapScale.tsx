import { formatRating } from '../domain/format'
import type { RubricCategory } from '../domain/scoring'

interface Props {
  category: RubricCategory
  value: number | null
  onChange: (value: number) => void
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * A 1 to 10 tap scale in two rows of five. Tap a number to set it; tap it again for
 * the half point above it. No drag sliders: they misfire one-handed.
 */
export function TapScale({ category, value, onChange }: Props) {
  const anchors: Record<number, string> = {
    1: category.anchors.low,
    5: category.anchors.mid,
    10: category.anchors.high,
  }

  function tap(n: number) {
    if (value === n && n < 10) onChange(n + 0.5)
    else onChange(n)
  }

  return (
    <fieldset className="scale">
      <legend className="scale-legend">
        <span className="scale-label">{category.label}</span>
        <span className="scale-covers">{category.covers}</span>
      </legend>
      <div className="scale-grid">
        {NUMBERS.map((n) => {
          const selected = value !== null && Math.floor(value) === n
          const half = selected && value !== n
          return (
            <button
              key={n}
              type="button"
              className="scale-btn"
              aria-pressed={selected}
              aria-label={`${category.label}: ${selected ? formatRating(value) : n}${anchors[n] ? `, ${anchors[n]}` : ''}`}
              onClick={() => tap(n)}
            >
              <span className="scale-num num">{half ? formatRating(value) : n}</span>
              {anchors[n] && <span className="scale-anchor">{anchors[n]}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
