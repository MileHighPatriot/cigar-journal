import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { patchLounge } from '../data/store'
import { wrapperText } from '../domain/cigars'
import { answerCard, cigarFlavors, KNOWN_LABELS, type LoungeCigar } from '../domain/lounge'
import { FlavorTags } from './FlavorTags'
import { LevelMeter } from './LevelMeter'
import { Monogram, WrapperSwatch } from './Monogram'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  /** The deck, already in study order. Frozen while the sheet is open. */
  deck: LoungeCigar[]
  onClose: () => void
}

/** Flashcards: see the name, say what you know, flip to check, then Got it or Missed it. */
export function StudyCards({ open, deck, onClose }: Props) {
  return (
    <Sheet open={open} title="Study the lounge" onClose={onClose}>
      {open && <Cards key={deck.map((cigar) => cigar.id).join()} deck={deck} onClose={onClose} />}
    </Sheet>
  )
}

function Cards({ deck, onClose }: Omit<Props, 'open'>) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [right, setRight] = useState(0)
  const [round, setRound] = useState(1)
  const cigar = deck[index]

  function answer(gotIt: boolean) {
    if (!cigar) return
    void patchLounge(cigar.id, answerCard(cigar.lounge, gotIt))
    if (gotIt) setRight((n) => n + 1)
    setFlipped(false)
    setIndex((n) => n + 1)
  }

  function again() {
    setIndex(0)
    setRight(0)
    setFlipped(false)
    setRound((n) => n + 1)
  }

  if (deck.length === 0) {
    return (
      <div className="stack">
        <p className="muted">Nothing to study. Add a few lounge sticks first.</p>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!cigar) {
    return (
      <div className="stack study-done">
        <p className="numeral numeral-lg num">
          {right} of {deck.length}
        </p>
        <p className="verdict-lg">
          {right === deck.length
            ? 'Every one. You know this humidor.'
            : right >= deck.length / 2
              ? 'Good round. The misses come first next time.'
              : 'Keep at it. The misses come first next time.'}
        </p>
        <div className="form-actions">
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Done
          </button>
          <button type="button" className="btn btn-primary" onClick={again}>
            <RotateCcw size={20} strokeWidth={1.5} aria-hidden="true" />
            Study again
          </button>
        </div>
      </div>
    )
  }

  const flavors = cigarFlavors(cigar)
  const wrapper = wrapperText(cigar)
  const facts = [
    cigar.country ? ['Made in', cigar.country] : null,
    cigar.lounge.shelf ? ['Where it sits', cigar.lounge.shelf] : null,
    cigar.sheetPairings.length > 0 ? ['Pairs with', cigar.sheetPairings.join(', ')] : null,
    cigar.similarCigars ? ['If they like this, suggest', cigar.similarCigars] : null,
  ].filter((fact): fact is [string, string] => fact !== null)

  return (
    <div className="stack">
      <p className="hero-label num study-count" aria-live="polite">
        Card {index + 1} of {deck.length}
        {round > 1 && ` (round ${round})`}
        <span className="study-level">{KNOWN_LABELS[cigar.lounge.known]}</span>
      </p>
      <article className="card study-card" key={`${cigar.id}-${flipped}`}>
        <header className="study-head">
          <Monogram brand={cigar.brand || cigar.line} />
          <div>
            <p className="band-brand">{cigar.brand}</p>
            <h3 className="study-title">{cigar.line || cigar.brand}</h3>
          </div>
        </header>
        {flipped ? (
          <div className="stack study-back">
            <LevelMeter label="Strength" value={cigar.strength} />
            {wrapper && (
              <p className="study-wrapper">
                <span className="muted">Wrapper</span>
                <WrapperSwatch wrapper={cigar.wrapperType} />
                {wrapper}
              </p>
            )}
            {flavors.length > 0 ? (
              <FlavorTags tags={flavors.slice(0, 8)} className="flavors-boxed" />
            ) : (
              <p className="muted">No tasting notes on file.</p>
            )}
            {facts.length > 0 && (
              <dl className="facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {cigar.lounge.note && <p className="wish-why">{cigar.lounge.note}</p>}
          </div>
        ) : (
          <div className="study-front">
            <p className="muted">
              Strength, wrapper, where it is made, and a few notes. Say them out loud, then flip.
            </p>
          </div>
        )}
      </article>
      {flipped ? (
        <div className="study-answers">
          <button type="button" className="btn btn-quiet" onClick={() => answer(false)}>
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
            Missed it
          </button>
          <button type="button" className="btn btn-primary" onClick={() => answer(true)}>
            <Check size={20} strokeWidth={1.5} aria-hidden="true" />
            Got it
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setFlipped(true)}
        >
          Flip
        </button>
      )}
    </div>
  )
}
