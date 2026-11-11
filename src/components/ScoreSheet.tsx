import { useState } from 'react'
import { markSmoke } from '../data/store'
import type { RatingKey, Smoke } from '../data/types'
import { formatRating } from '../domain/format'
import { categoryRating, RUBRIC, sheetItems } from '../domain/scoring'

interface Props {
  smoke: Smoke
  /** Which parts of the sheet to show. The full log grades each part when it happens. */
  categories?: RatingKey[]
}

/**
 * The scoresheet: things you can see, feel, and taste, each answered by tapping the line
 * that fits. Tap the picked line again to clear it. Every answer saves at once.
 */
export function ScoreSheet({ smoke, categories }: Props) {
  const shown = RUBRIC.filter((category) => !categories || categories.includes(category.key))
  // A smoke scored on the old 1 to 10 scales keeps that score. The sheet only opens for it
  // when asked, so a stray tap can never change a score already in the journal.
  const [regrading, setRegrading] = useState(false)
  const scoredOldWay =
    smoke.rubricVersion === 1 && smoke.score !== null && Object.keys(smoke.marks).length === 0
  if (scoredOldWay && !regrading) {
    return (
      <div className="marksheet">
        <section className="marksheet-part">
          {shown.map((category) => (
            <div key={category.key} className="marksheet-head">
              <h2 className="eyebrow">{category.label}</h2>
              <span className="marksheet-rating num">
                {formatRating(smoke.ratings[category.key])} of 10
              </span>
            </div>
          ))}
          <p className="muted marksheet-note">
            Scored on the old 1 to 10 scales. That score stays unless you grade it again.
          </p>
          <button type="button" className="btn btn-quiet" onClick={() => setRegrading(true)}>
            Grade it again on the new sheet
          </button>
        </section>
      </div>
    )
  }
  return (
    <div className="marksheet">
      {shown.map((category) => {
        const fromSheet = categoryRating(category.key, smoke.marks)
        const rating = fromSheet ?? smoke.ratings[category.key]
        return (
          <section key={category.key} className="marksheet-part">
            <div className="marksheet-head">
              <h2 className="eyebrow">{category.label}</h2>
              <span className="marksheet-rating num" aria-live="polite">
                {rating === null ? '' : `${formatRating(rating)} of 10`}
              </span>
            </div>
            {fromSheet === null && rating !== null && (
              <p className="muted marksheet-note">
                Scored on the old 1 to 10 scale. Answer these to grade it the new way.
              </p>
            )}
            {sheetItems(category.key).map((item) => {
              const picked = smoke.marks[item.key]
              return (
                <fieldset key={item.key} className="scale mark">
                  <legend className="scale-legend">
                    <span className="scale-label">{item.label}</span>
                    <span className="scale-covers">{item.ask}</span>
                  </legend>
                  <div className="mark-levels" role="radiogroup" aria-label={item.label}>
                    {item.levels.map((level, index) => (
                      <button
                        key={level.label}
                        type="button"
                        className="chip mark-level"
                        role="radio"
                        aria-checked={picked === index}
                        onClick={() => void markSmoke(smoke.id, item.key, index)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
