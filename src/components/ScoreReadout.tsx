import type { Smoke } from '../data/types'
import { computeScore, sheetProgress, verdictFor } from '../domain/scoring'
import { useCountUp } from './hooks'
import { ScoreRing } from './ScoreRing'

/** The running score. It stays in view while the sheet scrolls under it, unless static. */
export function ScoreReadout({ smoke, fixed = false }: { smoke: Smoke; fixed?: boolean }) {
  const score = computeScore(smoke.ratings)
  const counted = useCountUp(score?.shown ?? null)
  const { done, total } = sheetProgress(smoke.marks)
  return (
    <div className={fixed ? 'readout readout-static' : 'readout'}>
      <ScoreRing shown={score?.shown ?? null} size={72} stroke={4}>
        <span className="numeral numeral-sm num">{score ? counted : ''}</span>
      </ScoreRing>
      <span className="readout-text" aria-live="polite">
        {score ? (
          <>
            <span className="verdict verdict-lg" data-verdict={verdictFor(score.shown)}>
              {verdictFor(score.shown)}
            </span>
            <span className="muted">Lounge 100</span>
          </>
        ) : (
          <>
            <span className="readout-verdict">Grade it</span>
            <span className="muted num">
              {done === 0
                ? 'Tap the line that fits. The score builds as you go.'
                : `${done} of ${total} answered`}
            </span>
          </>
        )}
      </span>
    </div>
  )
}
