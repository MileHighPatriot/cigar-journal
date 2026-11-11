import { ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { SmokeFlavors } from '../components/FlavorField'
import { FlowLayout } from '../components/FlowLayout'
import { flushPendingSaves, useAutosaveText, usePending } from '../components/hooks'
import { PhotoSection } from '../components/PhotoSection'
import { ScoreReadout } from '../components/ScoreReadout'
import { SizePicker } from '../components/SizePicker'
import { Standing } from '../components/Standing'
import { showToast } from '../components/toast'
import { patchSmoke, useStore, whenSaved } from '../data/store'
import { cigarTitle } from '../domain/format'
import { computeScore } from '../domain/scoring'

export function LogFinish({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [saving, runSave] = usePending()
  const smoke = state.smokes.get(id)

  const price = useAutosaveText(
    smoke?.pricePaid === null || smoke?.pricePaid === undefined ? '' : String(smoke.pricePaid),
    (text) => {
      const amount = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
      void patchSmoke(id, { pricePaid: Number.isFinite(amount) ? amount : null })
    },
  )

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
  async function save() {
    flushPendingSaves()
    price.onBlur()
    void patchSmoke(id, { status: 'complete', draftStep: null })
    await whenSaved()
    navigate(`/smokes/${id}`, { replace: true })
    showToast({ message: 'Saved to your journal' })
  }

  return (
    <FlowLayout
      lead={
        <Link href={`/log/${id}/scores`} className="icon-btn" aria-label="Back to scores">
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      }
      title={
        <>
          <span className="band-brand">{cigar?.brand}</span>
          <span className="flow-cigar">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
        </>
      }
      actions={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!score || saving}
          onClick={() => runSave(save)}
        >
          Save
        </button>
      }
    >
      <ScoreReadout smoke={smoke} fixed />
      <Standing smoke={smoke} />

      <div className="finish-grid">
        <SmokeFlavors smoke={smoke} cigar={cigar} label="What stood out" />

        <div className="finish-side">
          <PhotoSection smokeId={id} />

          <SizePicker smoke={smoke} />

          {smoke.lotId === null && (
            <section className="stack">
              <label className="field">
                <span>Price paid (optional)</span>
                <input
                  className="input num"
                  inputMode="decimal"
                  placeholder="$"
                  value={price.value}
                  onChange={(event) => price.onChange(event.target.value)}
                  onBlur={price.onBlur}
                />
              </label>
            </section>
          )}
        </div>
      </div>
    </FlowLayout>
  )
}
