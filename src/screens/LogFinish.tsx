import { ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { FlowLayout } from '../components/FlowLayout'
import { useAutosaveText } from '../components/hooks'
import { PhotoSection } from '../components/PhotoSection'
import { Sheet } from '../components/Sheet'
import { TagPicker } from '../components/TagPicker'
import { showToast } from '../components/toast'
import { patchSmoke, useStore, whenSaved } from '../data/store'
import { cigarTitle } from '../domain/format'
import { computeScore, verdictFor } from '../domain/scoring'
import { recentTags } from '../domain/tags'

const QUICK_TAG_LIMIT = 3

/** Shown until there is some history to draw recent tags from. */
const STARTER_TAGS = [
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

export function LogFinish({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const smoke = state.smokes.get(id)

  const recent = useMemo(() => recentTags(state.smokes.values()), [state.smokes])
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
        <Link href="/" className="btn btn-quiet">
          Back to journal
        </Link>
      </div>
    )
  }

  const cigar = state.cigars.get(smoke.cigarId)
  const score = computeScore(smoke.ratings)
  const tags = smoke.quickTags
  const full = tags.length >= QUICK_TAG_LIMIT
  // Chips keep their place when picked. Tags from the full picker go in front.
  const base = recent.length > 0 ? recent : STARTER_TAGS
  const suggestions = [...tags.filter((tag) => !base.includes(tag)), ...base]

  function toggle(tag: string) {
    if (tags.includes(tag)) void patchSmoke(id, { quickTags: tags.filter((t) => t !== tag) })
    else if (!full) void patchSmoke(id, { quickTags: [...tags, tag] })
  }

  async function save() {
    setSaving(true)
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
          onClick={() => void save()}
        >
          Save
        </button>
      }
    >
      {score && (
        <div className="readout readout-static">
          <span className="numeral numeral-lg num">{score.shown}</span>
          <span className="readout-text">
            <span className="readout-verdict">{verdictFor(score.shown)}</span>
            <span className="muted">Lounge 100</span>
          </span>
        </div>
      )}

      <div className="finish-grid">
        <section className="stack">
          <div className="section-head">
            <h2>Flavors</h2>
            <span className="muted num">
              {tags.length} of {QUICK_TAG_LIMIT}
            </span>
          </div>
          <div className="chip-row" role="group" aria-label="Flavors, up to 3">
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
        </section>

        <div className="finish-side">
          <PhotoSection smokeId={id} />

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
        <TagPicker
          selected={tags}
          max={QUICK_TAG_LIMIT}
          onChange={(next) => void patchSmoke(id, { quickTags: next })}
        />
      </Sheet>
    </FlowLayout>
  )
}
