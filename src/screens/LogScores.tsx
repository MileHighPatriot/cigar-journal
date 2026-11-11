import { ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { FlowLayout } from '../components/FlowLayout'
import { ScoreReadout } from '../components/ScoreReadout'
import { ScoreSheet } from '../components/ScoreSheet'
import { showToast } from '../components/toast'
import { patchSmoke, useStore } from '../data/store'
import { cigarTitle } from '../domain/format'
import { computeScore, sheetProgress } from '../domain/scoring'

/** Quick log, step one: the scoresheet. Ten taps and the score is in. */
export function LogScores({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const smoke = state.smokes.get(id)

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
  const score = computeScore(smoke.ratings)
  const { done, total } = sheetProgress(smoke.marks)

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
            {score ? 'Scored' : `${done} of ${total} answered`}
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
      <ScoreReadout smoke={smoke} />
      <ScoreSheet smoke={smoke} />
    </FlowLayout>
  )
}
