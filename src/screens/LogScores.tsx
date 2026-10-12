import { ChevronLeft } from 'lucide-react'
import { useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { FlowLayout } from '../components/FlowLayout'
import { prefersReducedMotion, TABLET_UP, useCountUp } from '../components/hooks'
import { ScoreRing } from '../components/ScoreRing'
import { TapScale } from '../components/TapScale'
import { showToast } from '../components/toast'
import { patchSmoke, useStore } from '../data/store'
import type { RatingKey } from '../data/types'
import { cigarTitle } from '../domain/format'
import { computeScore, RUBRIC, verdictFor } from '../domain/scoring'

export function LogScores({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const sections = useRef(new Map<RatingKey, HTMLDivElement>())
  const smoke = state.smokes.get(id)
  const score = smoke ? computeScore(smoke.ratings) : null
  const counted = useCountUp(score?.shown ?? null)

  if (!smoke || smoke.deletedAt) {
    return (
      <div className="detail">
        <p className="muted">This log is not in your journal.</p>
        <Link href="/journal" className="btn btn-quiet">
          Back to journal
        </Link>
      </div>
    )
  }

  const cigar = state.cigars.get(smoke.cigarId)
  const rated = RUBRIC.filter((category) => smoke.ratings[category.key] !== null).length

  function rate(key: RatingKey, value: number) {
    if (!smoke) return
    const wasEmpty = smoke.ratings[key] === null
    void patchSmoke(id, { ratings: { ...smoke.ratings, [key]: value }, draftStep: 'scores' })
    // From tablet width up the four scales sit in a grid and need no scrolling.
    if (!wasEmpty || window.matchMedia(TABLET_UP).matches) return
    // Keep the scale just rated in full view under the score readout, so a second tap
    // for a half point is still in reach. The next scale then lands mid-screen.
    const index = RUBRIC.findIndex((category) => category.key === key)
    const current = sections.current.get(key)
    if (!current || !RUBRIC[index + 1]) return
    const readoutBottom = document.querySelector('.readout')?.getBoundingClientRect().bottom ?? 0
    const top = current.getBoundingClientRect().top + window.scrollY - readoutBottom - 12
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  function close() {
    navigate('/journal')
    showToast({ message: 'Draft kept. Resume it from your journal.' })
  }

  return (
    <FlowLayout
      lead={
        <button
          type="button"
          className="icon-btn"
          aria-label="Close and keep draft"
          onClick={close}
        >
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </button>
      }
      title={
        <>
          <span className="band-brand">{cigar?.brand}</span>
          <span className="flow-cigar">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
        </>
      }
      actions={
        <>
          <span className="actionbar-note muted num" aria-live="polite">
            {rated < 4 ? `${rated} of 4 rated` : 'All four rated'}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!score}
            onClick={() => {
              void patchSmoke(id, { draftStep: 'finish' })
              navigate(`/log/${id}/finish`)
            }}
          >
            Next
          </button>
        </>
      }
    >
      <div className="readout">
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
              <span className="readout-verdict">Score it</span>
              <span className="muted">Tap a number. Tap it again for a half point.</span>
            </>
          )}
        </span>
      </div>

      <div className="scales">
        {RUBRIC.map((category) => (
          <div
            key={category.key}
            ref={(element) => {
              if (element) sections.current.set(category.key, element)
              else sections.current.delete(category.key)
            }}
          >
            <TapScale
              category={category}
              value={smoke.ratings[category.key]}
              onChange={(value) => rate(category.key, value)}
            />
          </div>
        ))}
      </div>
    </FlowLayout>
  )
}
