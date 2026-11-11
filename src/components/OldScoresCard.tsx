import { convertKeptScores, restoreOldScores, useStore } from '../data/store'
import { usePending } from './hooks'
import { showToast } from './toast'

/**
 * Smokes scored before the scoresheet were moved onto it when the journal opened. This card
 * says how many, and puts the old scores back, or converts them again, in one tap.
 */
export function OldScoresCard() {
  const state = useStore()
  const [working, run] = usePending()
  let converted = 0
  let kept = 0
  for (const smoke of state.smokes.values()) {
    if (smoke.deletedAt) continue
    if (smoke.oldScore !== null) converted += 1
    else if (smoke.scoreKept) kept += 1
  }
  if (converted === 0 && kept === 0) return null

  const count = (n: number) => `${n} ${n === 1 ? 'smoke' : 'smokes'}`

  return (
    <section className="card settings-card">
      <h2>Old scores</h2>
      {converted > 0 && (
        <>
          <p className="muted">
            <span className="num">{count(converted)}</span> scored on the old 1 to 10 scales{' '}
            {converted === 1 ? 'was' : 'were'} moved to the new sheet. Each got the closest answers
            to the numbers you gave, so a score may have moved a point or two. The original numbers
            are kept.
          </p>
          <button
            type="button"
            className="btn btn-quiet"
            aria-busy={working}
            onClick={() =>
              run(async () => {
                const n = await restoreOldScores()
                showToast({ message: `${count(n)} back to the old score` })
              })
            }
          >
            Put the old scores back
          </button>
        </>
      )}
      {kept > 0 && (
        <>
          <p className="muted">
            <span className="num">{count(kept)}</span> {kept === 1 ? 'is' : 'are'} still on the old
            1 to 10 score.
          </p>
          <button
            type="button"
            className="btn btn-quiet"
            aria-busy={working}
            onClick={() =>
              run(async () => {
                const n = await convertKeptScores()
                showToast({ message: `${count(n)} moved to the new sheet` })
              })
            }
          >
            Move them to the new sheet
          </button>
        </>
      )}
    </section>
  )
}
