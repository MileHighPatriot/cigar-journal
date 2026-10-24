import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { AROMA_TAGS, FlavorField } from '../components/FlavorField'
import { FlavorTags } from '../components/FlavorTags'
import { AutoText, ChipChoice, ChipMulti, Counter, LevelPicker } from '../components/fields'
import { useAutosaveText } from '../components/hooks'
import { PhotoSection } from '../components/PhotoSection'
import { SavedBadge } from '../components/SavedBadge'
import { ScoreRing } from '../components/ScoreRing'
import { SizePicker } from '../components/SizePicker'
import { TapScale } from '../components/TapScale'
import { TimerBar } from '../components/TimerBar'
import { showToast } from '../components/toast'
import { getState, patchPrelight, patchSmoke, patchThird, useStore, whenSaved } from '../data/store'
import type {
  BuyAgain,
  Cigar,
  CutType,
  Issue,
  LightMethod,
  PairingType,
  Setting,
  Smoke,
  ThirdKey,
} from '../data/types'
import { cigarTitle } from '../domain/format'
import { carryTags, OFF_THIRD_NOTES, previousThird } from '../domain/journal'
import { computeScore, RUBRIC, verdictFor } from '../domain/scoring'
import { cigarFlavorTags } from '../domain/tags'
import { fromLocalInput, toLocalInput } from '../domain/timer'

const STEPS = [
  { key: 'prelight', label: 'Pre-light' },
  { key: 'first', label: 'First third' },
  { key: 'second', label: 'Second third' },
  { key: 'final', label: 'Final third' },
  { key: 'construction', label: 'Construction' },
  { key: 'setting', label: 'Setting' },
  { key: 'scores', label: 'Scores' },
  { key: 'wrapup', label: 'Wrap up' },
] as const
type StepKey = (typeof STEPS)[number]['key']

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
const ISSUES = opts<Issue>(
  ['tight draw', 'Tight draw'],
  ['loose draw', 'Loose draw'],
  ['canoe', 'Canoe'],
  ['tunneling', 'Tunneling'],
  ['run', 'Run'],
  ['relight', 'Relight'],
  ['touch-up', 'Touch-up'],
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
const BUY = opts<BuyAgain>(['no', 'No'], ['single', 'A single'], ['few', 'A few'], ['box', 'A box'])
const OFF = opts<(typeof OFF_THIRD_NOTES)[number]>(
  ['harsh', 'Harsh'],
  ['bitter', 'Bitter'],
  ['tar', 'Tar'],
  ['sour', 'Sour'],
)
const DRAW = opts<NonNullable<Smoke['draw']>>(
  ['tight', 'Tight'],
  ['ideal', 'Ideal'],
  ['loose', 'Loose'],
)
const BURN = opts<NonNullable<Smoke['burn']>>(
  ['even', 'Even'],
  ['wavy', 'Wavy'],
  ['uneven', 'Uneven'],
)
const ASH = opts<NonNullable<Smoke['ashFirmness']>>(['firm', 'Firm'], ['flaky', 'Flaky'])

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
  const notes = cigarFlavorTags(cigar)
  const hasNotes = notes.length > 0
  return (
    <div className="form-cols">
      <div className="stack">
        <ExpectToTaste cigar={cigar} />
        <AutoText
          label="Wrapper look and feel"
          placeholder="Oily, toothy, veiny, firm"
          value={prelight.wrapperNotes}
          onCommit={(wrapperNotes) => void patchPrelight(id, { wrapperNotes })}
        />
        <FlavorField
          label="Foot aroma"
          more="More aromas"
          suggest={hasNotes ? notes : AROMA_TAGS}
          hint={
            hasNotes ? 'These are the notes on file. Tap the ones you actually smell.' : undefined
          }
          tags={prelight.aromaTags}
          onChange={(aromaTags) => void patchPrelight(id, { aromaTags })}
        />
        <AutoText
          label="Foot aroma, in your words"
          placeholder="Anything else you smell"
          value={prelight.footAroma}
          onCommit={(footAroma) => void patchPrelight(id, { footAroma })}
        />
        <FlavorField
          label="Cold draw"
          suggest={hasNotes ? notes : AROMA_TAGS}
          hint={
            hasNotes ? 'These are the notes on file. Tap the ones you actually taste.' : undefined
          }
          tags={prelight.coldDrawTags}
          onChange={(coldDrawTags) => void patchPrelight(id, { coldDrawTags })}
        />
        <AutoText
          label="Cold draw, in your words"
          placeholder="A little tight, sweet on the lips"
          value={prelight.coldDraw}
          onCommit={(coldDraw) => void patchPrelight(id, { coldDraw })}
        />
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
        <AutoText
          label="Pre-light note"
          multiline
          placeholder="Anything else before you light it"
          value={prelight.note}
          onCommit={(note) => void patchPrelight(id, { note })}
        />
      </div>
      {/* Before it is lit is the time to shoot the stick and the wrapper. */}
      <PhotoSection smokeId={id} defaultKind="stick" />
    </div>
  )
}

function sameTags(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((tag, index) => tag === right[index])
}

function Third({
  smoke,
  third,
  cigar,
}: {
  smoke: Smoke
  third: ThirdKey
  cigar: Cigar | undefined
}) {
  const { id } = smoke
  const data = smoke.thirds[third]
  const notes = cigarFlavorTags(cigar)
  const prev = previousThird(third)
  const earlier = prev ? smoke.thirds[prev].tags : []
  // Show the copy on the first paint, before the save lands.
  const pendingCarry = !data.tagsSeeded && data.tags.length === 0 && earlier.length > 0
  const shownTags = pendingCarry ? earlier : data.tags
  const carried =
    pendingCarry || (data.tagsSeeded && earlier.length > 0 && sameTags(shownTags, earlier))

  // Copy the previous third's taste notes the first time this step is opened.
  useEffect(() => {
    const latest = getState().smokes.get(id)
    if (!latest) return
    const patch = carryTags(third, latest)
    if (patch) void patchThird(id, third, patch)
  }, [id, third])

  return (
    <div className="form-cols">
      <div className="stack">
        <FlavorField
          label="Notes in this third"
          suggest={notes.length > 0 ? notes : undefined}
          hint={
            carried
              ? 'Started from the last third. Take off what faded and tap what showed up.'
              : notes.length > 0
                ? 'These are the notes on file. Tap the ones you actually taste.'
                : 'No notes on file for this cigar. Tap any you taste.'
          }
          tags={shownTags}
          onChange={(tags) => void patchThird(id, third, { tags, tagsSeeded: true })}
        />
        <ChipMulti
          label="Off notes"
          options={OFF}
          values={data.offTags.filter((tag): tag is (typeof OFF_THIRD_NOTES)[number] =>
            (OFF_THIRD_NOTES as readonly string[]).includes(tag),
          )}
          onChange={(offTags) => void patchThird(id, third, { offTags })}
        />
        <FlavorField
          label="Retrohale"
          suggest={notes.length > 0 ? notes : undefined}
          hint={
            notes.length > 0
              ? 'These are the notes on file. Tap what comes through the nose.'
              : 'Tap what comes through the nose.'
          }
          tags={data.retrohaleTags}
          onChange={(retrohaleTags) => void patchThird(id, third, { retrohaleTags })}
        />
        <ChipChoice
          label="Draw"
          options={DRAW}
          value={data.draw}
          onChange={(draw) => void patchThird(id, third, { draw })}
        />
        <ChipChoice
          label="Burn"
          options={BURN}
          value={data.burn}
          onChange={(burn) => void patchThird(id, third, { burn })}
        />
        <ChipChoice
          label="Ash"
          options={ASH}
          value={data.ashFirmness}
          onChange={(ashFirmness) => void patchThird(id, third, { ashFirmness })}
        />
        <ChipMulti
          label="Construction issues"
          options={ISSUES}
          values={data.issues}
          onChange={(issues) => void patchThird(id, third, { issues })}
        />
      </div>
      <div className="stack">
        <LevelPicker
          label="Strength"
          value={data.strength}
          onChange={(strength) => void patchThird(id, third, { strength })}
        />
        <LevelPicker
          label="Body"
          value={data.body}
          onChange={(body) => void patchThird(id, third, { body })}
        />
        <AutoText
          label="Note"
          multiline
          placeholder="What changed in this third"
          value={data.note}
          onCommit={(note) => void patchThird(id, third, { note })}
        />
        <AutoText
          label="Retrohale, in your words"
          placeholder="Smooth, sharp, long finish"
          value={data.retrohale}
          onCommit={(retrohale) => void patchThird(id, third, { retrohale })}
        />
      </div>
    </div>
  )
}

function Construction({ smoke }: { smoke: Smoke }) {
  const { id } = smoke
  return (
    <div className="form-cols">
      <div className="stack">
        <ChipChoice
          label="Draw"
          options={opts<NonNullable<Smoke['draw']>>(
            ['tight', 'Tight'],
            ['ideal', 'Ideal'],
            ['loose', 'Loose'],
          )}
          value={smoke.draw}
          onChange={(draw) => void patchSmoke(id, { draw })}
        />
        <ChipChoice
          label="Burn"
          options={opts<NonNullable<Smoke['burn']>>(
            ['even', 'Even'],
            ['wavy', 'Wavy'],
            ['uneven', 'Uneven'],
          )}
          value={smoke.burn}
          onChange={(burn) => void patchSmoke(id, { burn })}
        />
        <ChipChoice
          label="Ash"
          options={opts<NonNullable<Smoke['ashFirmness']>>(['firm', 'Firm'], ['flaky', 'Flaky'])}
          value={smoke.ashFirmness}
          onChange={(ashFirmness) => void patchSmoke(id, { ashFirmness })}
        />
        <ChipChoice
          label="Ash color"
          options={opts<NonNullable<Smoke['ashColor']>>(['light', 'Light'], ['dark', 'Dark'])}
          value={smoke.ashColor}
          onChange={(ashColor) => void patchSmoke(id, { ashColor })}
        />
        <ChipChoice
          label="Smoke volume"
          options={opts<NonNullable<Smoke['smokeVolume']>>(
            ['light', 'Light'],
            ['medium', 'Medium'],
            ['full', 'Full'],
          )}
          value={smoke.smokeVolume}
          onChange={(smokeVolume) => void patchSmoke(id, { smokeVolume })}
        />
      </div>
      <div className="stack">
        <div className="form-row">
          <Counter
            label="Relights"
            value={smoke.relights}
            onChange={(relights) => void patchSmoke(id, { relights })}
          />
          <Counter
            label="Touch-ups"
            value={smoke.touchUps}
            onChange={(touchUps) => void patchSmoke(id, { touchUps })}
          />
        </div>
        <LevelPicker
          label="Strength, whole cigar"
          value={smoke.strength}
          onChange={(strength) => void patchSmoke(id, { strength })}
        />
        <LevelPicker
          label="Body, whole cigar"
          value={smoke.body}
          onChange={(body) => void patchSmoke(id, { body })}
        />
        <AutoText
          label="Construction note"
          multiline
          placeholder="Burn line, ash, anything you had to fix"
          value={smoke.constructionNote}
          onCommit={(constructionNote) => void patchSmoke(id, { constructionNote })}
        />
      </div>
    </div>
  )
}

function SettingStep({ smoke }: { smoke: Smoke }) {
  const { id } = smoke
  return (
    <div className="form-cols">
      <div className="stack">
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
        <AutoText
          label="Pairing note"
          multiline
          placeholder="How the drink went with the cigar"
          value={smoke.pairingNote}
          onCommit={(pairingNote) => void patchSmoke(id, { pairingNote })}
        />
      </div>
      <div className="stack">
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
        <ChipChoice
          label="Indoor or outdoor"
          options={opts<NonNullable<Smoke['environment']>>(
            ['indoor', 'Indoor'],
            ['outdoor', 'Outdoor'],
          )}
          value={smoke.environment}
          onChange={(environment) => void patchSmoke(id, { environment })}
        />
        <AutoText
          label="Company"
          placeholder="Solo, regulars, a friend"
          value={smoke.company}
          onCommit={(company) => void patchSmoke(id, { company })}
        />
        <AutoText
          label="Conditions"
          placeholder="Windy patio, humid night"
          value={smoke.conditions}
          onCommit={(conditions) => void patchSmoke(id, { conditions })}
        />
        <AutoText
          label="Mood"
          value={smoke.mood}
          onCommit={(mood) => void patchSmoke(id, { mood })}
        />
      </div>
    </div>
  )
}

function ScoresStep({ smoke }: { smoke: Smoke }) {
  const { id } = smoke
  const score = computeScore(smoke.ratings)
  return (
    <>
      <div className="readout readout-static">
        <ScoreRing shown={score?.shown ?? null} size={72} stroke={4}>
          <span className="numeral numeral-sm num">{score?.shown ?? ''}</span>
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
          <TapScale
            key={category.key}
            category={category}
            value={smoke.ratings[category.key]}
            onChange={(value) =>
              void patchSmoke(id, { ratings: { ...smoke.ratings, [category.key]: value } })
            }
          />
        ))}
      </div>
      <ChipChoice
        label="Would buy again"
        options={BUY}
        value={smoke.wouldBuyAgain}
        onChange={(wouldBuyAgain) => void patchSmoke(id, { wouldBuyAgain })}
      />
      <AutoText
        label="Score note"
        multiline
        placeholder="Why it earned this score"
        value={smoke.scoreNote}
        onCommit={(scoreNote) => void patchSmoke(id, { scoreNote })}
      />
    </>
  )
}

function WrapUp({ smoke }: { smoke: Smoke }) {
  const { id } = smoke
  const price = useAutosaveText(smoke.pricePaid === null ? '' : String(smoke.pricePaid), (text) => {
    const amount = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
    void patchSmoke(id, { pricePaid: Number.isFinite(amount) ? amount : null })
  })
  return (
    <div className="form-cols">
      <div className="stack">
        <AutoText
          label="Summary note"
          multiline
          placeholder="How it held together, start to finish"
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
        <SizePicker smoke={smoke} />
      </div>
      <PhotoSection smokeId={id} />
    </div>
  )
}

export function LogFull({ id, step }: { id: string; step: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const strip = useRef<HTMLDivElement>(null)
  const smoke = state.smokes.get(id)
  const index = Math.max(
    0,
    STEPS.findIndex((entry) => entry.key === step),
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
    if (isDraft) void patchSmoke(id, { status: 'complete', draftStep: null })
    await whenSaved()
    navigate(`/smokes/${id}`, { replace: true })
    showToast({ message: isDraft ? 'Saved to your journal' : 'Changes saved' })
  }

  const thirds = current.key === 'first' || current.key === 'second' || current.key === 'final'

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
        {thirds && (
          <Third key={current.key} smoke={smoke} third={current.key as ThirdKey} cigar={cigar} />
        )}
        {current.key === 'construction' && <Construction smoke={smoke} />}
        {current.key === 'setting' && <SettingStep smoke={smoke} />}
        {current.key === 'scores' && <ScoresStep smoke={smoke} />}
        {current.key === 'wrapup' && <WrapUp smoke={smoke} />}
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
          <button type="button" className="btn btn-primary" onClick={() => void finish()}>
            {isDraft ? 'Finish' : 'Done'}
          </button>
        )}
      </div>
    </div>
  )
}
