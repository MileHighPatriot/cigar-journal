import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { SmokeFlavors } from '../components/FlavorField'
import { FlavorTags } from '../components/FlavorTags'
import { AutoText, ChipChoice, Counter, LevelPicker } from '../components/fields'
import { flushPendingSaves, useAutosaveText, usePending } from '../components/hooks'
import { PhotoSection } from '../components/PhotoSection'
import { SavedBadge } from '../components/SavedBadge'
import { ScoreReadout } from '../components/ScoreReadout'
import { ScoreSheet } from '../components/ScoreSheet'
import { SizePicker } from '../components/SizePicker'
import { Standing } from '../components/Standing'
import { TimerBar } from '../components/TimerBar'
import { showToast } from '../components/toast'
import { patchPrelight, patchSmoke, useStore, whenSaved } from '../data/store'
import type { Cigar, CutType, LightMethod, PairingType, Setting, Smoke } from '../data/types'
import { cigarTitle } from '../domain/format'
import { cigarFlavorTags } from '../domain/tags'
import { fromLocalInput, toLocalInput } from '../domain/timer'

// Three short steps, each done when it happens: look it over before lighting, note how it
// smokes, then call it. Each one grades its own part of the scoresheet.
const STEPS = [
  { key: 'prelight', label: 'Before you light' },
  { key: 'smoke', label: 'The smoke' },
  { key: 'grade', label: 'The verdict' },
] as const
type StepKey = (typeof STEPS)[number]['key']

/** Where a draft saved under the old eight steps picks up. */
const OLD_STEPS: Record<string, StepKey> = {
  first: 'smoke',
  second: 'smoke',
  final: 'smoke',
  construction: 'smoke',
  setting: 'smoke',
  scores: 'grade',
  wrapup: 'grade',
}

const opts = <T extends string>(...values: [T, string][]) =>
  values.map(([value, label]) => ({ value, label }))

const CUTS = opts<CutType>(
  ['straight', 'Straight'],
  ['v-cut', 'V-cut'],
  ['punch', 'Punch'],
  ['other', 'Other'],
)
const LIGHTS = opts<LightMethod>(
  ['torch', 'Torch'],
  ['soft flame', 'Soft flame'],
  ['match', 'Match'],
  ['cedar spill', 'Cedar spill'],
  ['other', 'Other'],
)
const PAIRINGS = opts<PairingType>(
  ['coffee', 'Coffee'],
  ['espresso', 'Espresso'],
  ['tea', 'Tea'],
  ['bourbon', 'Bourbon'],
  ['rye', 'Rye'],
  ['scotch', 'Scotch'],
  ['rum', 'Rum'],
  ['tequila', 'Tequila'],
  ['cognac', 'Cognac'],
  ['beer', 'Beer'],
  ['wine', 'Wine'],
  ['port', 'Port'],
  ['soda', 'Soda'],
  ['water', 'Water'],
  ['other', 'Other'],
)
const SETTINGS = opts<Setting>(
  ['lounge', 'Stanley Pappas lounge'],
  ['home', 'Home'],
  ['patio', 'Patio'],
  ['other', 'Other'],
)
function ExpectToTaste({ cigar }: { cigar: Cigar | undefined }) {
  const notes = cigarFlavorTags(cigar)
  return (
    <section className="stack">
      <div className="section-head">
        <h2>Expect to taste</h2>
      </div>
      {notes.length > 0 ? (
        <FlavorTags tags={notes} className="flavors-boxed" />
      ) : (
        <p className="muted">No tasting notes on file for this cigar.</p>
      )}
    </section>
  )
}

function Prelight({ smoke, cigar }: { smoke: Smoke; cigar: Cigar | undefined }) {
  const { id, prelight } = smoke
  return (
    <div className="form-cols">
      <div className="stack">
        <ScoreSheet smoke={smoke} categories={['appearance']} />
        <ChipChoice
          label="Cut"
          options={CUTS}
          value={prelight.cutType}
          onChange={(cutType) => void patchPrelight(id, { cutType })}
        />
        <ChipChoice
          label="Light"
          options={LIGHTS}
          value={prelight.lightMethod}
          onChange={(lightMethod) => void patchPrelight(id, { lightMethod })}
        />
        <SizePicker smoke={smoke} />
      </div>
      <div className="stack">
        {/* Before it is lit is the time to shoot the stick and the band. */}
        <PhotoSection smokeId={id} defaultKind="stick" />
        <ExpectToTaste cigar={cigar} />
      </div>
    </div>
  )
}

function SmokeStep({ smoke }: { smoke: Smoke }) {
  const { id } = smoke
  return (
    <div className="form-cols">
      <div className="stack">
        <ScoreSheet smoke={smoke} categories={['smoking']} />
        <Counter
          label="Relights"
          value={smoke.relights}
          onChange={(relights) => void patchSmoke(id, { relights })}
        />
      </div>
      <div className="stack">
        <LevelPicker
          label="Strength"
          value={smoke.strength}
          onChange={(strength) => void patchSmoke(id, { strength })}
        />
        <LevelPicker
          label="Body"
          value={smoke.body}
          onChange={(body) => void patchSmoke(id, { body })}
        />
        <ChipChoice
          label="Drink"
          options={PAIRINGS}
          value={smoke.pairingType}
          onChange={(pairingType) => void patchSmoke(id, { pairingType })}
        />
        <AutoText
          label="Which one"
          placeholder="Eagle Rare, a cortado"
          value={smoke.pairingName}
          onCommit={(pairingName) => void patchSmoke(id, { pairingName })}
        />
        <ChipChoice
          label="Where"
          options={SETTINGS}
          value={smoke.setting}
          onChange={(setting) => void patchSmoke(id, { setting: setting ?? 'lounge' })}
        />
        {smoke.setting === 'other' && (
          <AutoText
            label="Where was it"
            value={smoke.settingOther}
            onCommit={(settingOther) => void patchSmoke(id, { settingOther })}
          />
        )}
      </div>
    </div>
  )
}

function Grade({ smoke, cigar }: { smoke: Smoke; cigar: Cigar | undefined }) {
  const { id } = smoke
  const price = useAutosaveText(smoke.pricePaid === null ? '' : String(smoke.pricePaid), (text) => {
    const amount = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
    void patchSmoke(id, { pricePaid: Number.isFinite(amount) ? amount : null })
  })
  return (
    <>
      <ScoreReadout smoke={smoke} />
      <Standing smoke={smoke} />
      <div className="form-cols">
        <div className="stack">
          <ScoreSheet smoke={smoke} categories={['flavor', 'overall']} />
        </div>
        <div className="stack">
          <SmokeFlavors smoke={smoke} cigar={cigar} label="What stood out" />
          <AutoText
            label="Note"
            multiline
            placeholder="Anything worth remembering about this one"
            value={smoke.summary}
            onCommit={(summary) => void patchSmoke(id, { summary })}
          />
          <label className="field">
            <span>When</span>
            <input
              type="datetime-local"
              className="input num"
              value={toLocalInput(smoke.smokedAt)}
              onChange={(event) => {
                const smokedAt = fromLocalInput(event.target.value)
                if (smokedAt) void patchSmoke(id, { smokedAt })
              }}
            />
          </label>
          {smoke.lotId === null && (
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
          )}
        </div>
      </div>
    </>
  )
}

export function LogFull({ id, step }: { id: string; step: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const strip = useRef<HTMLDivElement>(null)
  const [finishing, runFinish] = usePending()
  const smoke = state.smokes.get(id)
  const wanted = OLD_STEPS[step] ?? step
  const index = Math.max(
    0,
    STEPS.findIndex((entry) => entry.key === wanted),
  )
  const current = STEPS[index] ?? STEPS[0]
  const isDraft = smoke?.status === 'draft'

  // Remember the step so Resume reopens exactly here, and mark a quick log as a full one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the step changes
  useEffect(() => {
    if (!smoke || smoke.deletedAt) return
    const patch: Partial<Smoke> = {}
    if (smoke.mode !== 'full') patch.mode = 'full'
    if (isDraft && smoke.draftStep !== `full/${current.key}`)
      patch.draftStep = `full/${current.key}`
    if (Object.keys(patch).length > 0) void patchSmoke(id, patch)
    strip.current
      ?.querySelector('[aria-current="step"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [id, current.key])

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
  const go = (key: StepKey) => navigate(`/log/${id}/full/${key}`)
  const previous = STEPS[index - 1]
  const next = STEPS[index + 1]

  function close() {
    if (isDraft) {
      navigate('/journal')
      showToast({ message: 'Draft kept. Resume it from your journal.' })
    } else navigate(`/smokes/${id}`)
  }

  async function finish() {
    flushPendingSaves()
    if (isDraft) void patchSmoke(id, { status: 'complete', draftStep: null })
    await whenSaved()
    navigate(`/smokes/${id}`, { replace: true })
    showToast({ message: isDraft ? 'Saved to your journal' : 'Changes saved' })
  }

  return (
    <div className="flow flow-full">
      <header className="flow-head">
        <button
          type="button"
          className="icon-btn"
          aria-label={isDraft ? 'Close and keep draft' : 'Back to the smoke'}
          onClick={close}
        >
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <div className="flow-title">
          <span className="band-brand">{cigar?.brand}</span>
          <span className="flow-cigar">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
        </div>
        <SavedBadge />
      </header>

      <nav className="steps" aria-label="Steps" ref={strip}>
        {STEPS.map((entry, position) => (
          <button
            key={entry.key}
            type="button"
            className="step"
            aria-current={entry.key === current.key ? 'step' : undefined}
            onClick={() => go(entry.key)}
          >
            <span className="step-num num" aria-hidden="true">
              {position + 1}
            </span>
            {entry.label}
          </button>
        ))}
      </nav>

      <div className="flow-body">
        <TimerBar smoke={smoke} />
        <h1 className="flow-h1">{current.label}</h1>
        {current.key === 'prelight' && <Prelight smoke={smoke} cigar={cigar} />}
        {current.key === 'smoke' && <SmokeStep smoke={smoke} />}
        {current.key === 'grade' && <Grade smoke={smoke} cigar={cigar} />}
      </div>

      <div className="actionbar">
        {previous && (
          <button type="button" className="btn btn-quiet" onClick={() => go(previous.key)}>
            Back
          </button>
        )}
        <span className="actionbar-note muted num">
          Step {index + 1} of {STEPS.length}
        </span>
        {next ? (
          <button type="button" className="btn btn-primary" onClick={() => go(next.key)}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            aria-busy={finishing}
            onClick={() => runFinish(finish)}
          >
            {isDraft ? 'Finish' : 'Done'}
          </button>
        )}
      </div>
    </div>
  )
}
