import { ChevronLeft, Copy, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { FlavorTags } from '../components/FlavorTags'
import { useCountUp } from '../components/hooks'
import { LabelArt } from '../components/LabelArt'
import { WrapperDot } from '../components/Monogram'
import { PHOTO_KINDS } from '../components/PhotoSection'
import { ScoreRing } from '../components/ScoreRing'
import { showToast } from '../components/toast'
import { deleteSmoke, photosForSmoke, useStore } from '../data/store'
import type { Photo, Third } from '../data/types'
import {
  cigarTitle,
  formatDateLong,
  formatMinutes,
  formatMoney,
  formatRating,
  formatTime,
} from '../domain/format'
import { earlierSmoke, hitAndMiss, noteDelta } from '../domain/journal'
import { levelLabel, RUBRIC, shownScore, verdictFor } from '../domain/scoring'
import { smokeSize } from '../domain/sizes'
import { smokeSummary } from '../domain/summary'
import { usePhotoUrl } from '../photos/usePhotoUrl'

const SETTING_LABELS = {
  lounge: 'Stanley Pappas lounge',
  home: 'Home',
  patio: 'Patio',
  other: 'Other',
} as const

function burnLine(third: Third): string {
  return [
    third.draw && `Draw ${third.draw}`,
    third.burn && `Burn ${third.burn}`,
    third.ashFirmness && `Ash ${third.ashFirmness}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

function Facts({ title, facts }: { title: string; facts: [string, string][] }) {
  if (facts.length === 0) return null
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <dl className="facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function NoteGroup({ title, tags }: { title: string; tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <>
      <h3>{title}</h3>
      <FlavorTags tags={tags} />
    </>
  )
}

function Gallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const current = photos[Math.min(index, photos.length - 1)]
  const url = usePhotoUrl(current?.id, 'full')
  if (!current) return null
  const kind = PHOTO_KINDS.find((k) => k.key === current.kind)?.label ?? 'Photo'
  return (
    <div className="gallery">
      <div className="gallery-main" style={{ aspectRatio: `${current.width} / ${current.height}` }}>
        {url && <img src={url} alt={kind} />}
      </div>
      {photos.length > 1 && (
        <div className="chip-row" role="group" aria-label="Photos">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              className="chip"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {PHOTO_KINDS.find((k) => k.key === photo.kind)?.label ?? 'Photo'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SmokeDetail({ id }: { id: string }) {
  const state = useStore()
  const [, navigate] = useLocation()
  const smoke = state.smokes.get(id)
  const shown = smoke && smoke.score !== null ? shownScore(smoke.score) : null
  const counted = useCountUp(shown)

  if (!smoke || smoke.deletedAt) {
    return (
      <div className="detail">
        <p className="muted">This smoke is not in your journal.</p>
        <Link href="/journal" className="btn btn-quiet">
          Back to journal
        </Link>
      </div>
    )
  }

  const cigar = state.cigars.get(smoke.cigarId)
  const photos = photosForSmoke(state.photos, smoke.id)
  const size = smokeSize(smoke, cigar)
  const verdict = shown === null ? null : verdictFor(shown)
  const strength = levelLabel(smoke.strength ?? cigar?.strength ?? null)
  const where = smoke.setting === 'other' ? smoke.settingOther : SETTING_LABELS[smoke.setting]
  const meta = [
    formatDateLong(smoke.smokedAt),
    formatTime(smoke.smokedAt),
    where,
    formatMinutes(smoke.durationMin),
  ].filter(Boolean)

  const THIRD_LABELS = [
    ['first', 'First third'],
    ['second', 'Second third'],
    ['final', 'Final third'],
  ] as const
  const thirdRows = THIRD_LABELS.map(([key, label]) => ({
    key,
    label,
    third: smoke.thirds[key],
  })).filter(({ third }) => {
    const burning = [third.draw, third.burn, third.ashFirmness].filter(Boolean).join(' · ')
    return (
      third.tags.length > 0 ||
      third.offTags.length > 0 ||
      third.strength ||
      third.body ||
      third.retrohale ||
      third.retrohaleTags.length > 0 ||
      third.note ||
      third.issues.length > 0 ||
      burning !== ''
    )
  })
  const taste = hitAndMiss(smoke, cigar)
  const hasTaste = taste.hit.length + taste.missed.length + taste.added.length > 0
  const earlier = earlierSmoke(smoke, state.smokes.values())
  const delta = earlier ? noteDelta(smoke, earlier) : null
  const hasDelta = delta !== null && (delta.arrived.length > 0 || delta.dropped.length > 0)
  const BUY_LABELS = { no: 'No', single: 'A single', few: 'A few', box: 'A box' } as const
  const fact = (label: string, value: string | number | null | undefined): [string, string][] =>
    value === null || value === undefined || value === '' ? [] : [[label, String(value)]]
  // Picked flavors first, then anything typed.
  const both = (tags: string[], typed: string) =>
    [tags.join(', '), typed].filter(Boolean).join('. ')
  const groups = [
    {
      title: 'Pre-light',
      facts: [
        ...fact('Wrapper', smoke.prelight.wrapperNotes),
        ...fact('Foot aroma', both(smoke.prelight.aromaTags, smoke.prelight.footAroma)),
        ...fact('Cold draw', both(smoke.prelight.coldDrawTags, smoke.prelight.coldDraw)),
        ...fact('Cut', smoke.prelight.cutType),
        ...fact('Light', smoke.prelight.lightMethod),
        ...fact('Note', smoke.prelight.note),
      ],
    },
    {
      title: 'Construction',
      facts: [
        ...fact('Draw', smoke.draw),
        ...fact('Burn', smoke.burn),
        ...fact('Ash', [smoke.ashFirmness, smoke.ashColor].filter(Boolean).join(', ')),
        ...fact('Smoke volume', smoke.smokeVolume),
        ...fact('Relights', smoke.relights > 0 ? smoke.relights : null),
        ...fact('Touch-ups', smoke.touchUps > 0 ? smoke.touchUps : null),
        ...fact('Body', levelLabel(smoke.body)),
        ...fact('Note', smoke.constructionNote),
      ],
    },
    {
      title: 'Pairing and setting',
      facts: [
        ...fact('Pairing', [smoke.pairingType, smoke.pairingName].filter(Boolean).join(', ')),
        ...fact('Pairing note', smoke.pairingNote),
        ...fact('Indoor or outdoor', smoke.environment),
        ...fact('Company', smoke.company),
        ...fact('Conditions', smoke.conditions),
        ...fact('Mood', smoke.mood),
        ...fact('Would buy again', smoke.wouldBuyAgain ? BUY_LABELS[smoke.wouldBuyAgain] : null),
        ...fact('Price paid', smoke.pricePaid === null ? null : formatMoney(smoke.pricePaid)),
      ],
    },
  ].filter((group) => group.facts.length > 0)

  async function copy() {
    if (!smoke) return
    const summary = smokeSummary(smoke, cigar)
    try {
      await navigator.clipboard.writeText(summary)
      showToast({ message: 'Summary copied' })
    } catch {
      showToast({ message: 'Could not copy. Your browser blocked it.' })
    }
  }

  function remove() {
    const { undo } = deleteSmoke(id)
    navigate('/journal')
    showToast({ message: 'Smoke deleted', actionLabel: 'Undo', onAction: () => void undo() })
  }

  return (
    <article className="detail">
      <div className="detail-bar">
        <Link href="/journal" className="icon-btn detail-back" aria-label="Back to journal">
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      <LabelArt compact scene="salon" />

      <header className="detail-head">
        <div>
          <p className="band-brand">{cigar?.brand || 'Unknown brand'}</p>
          <h1>{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</h1>
          {size && <p className="muted">{size}</p>}
          <p className="muted num detail-meta">{meta.join(' · ')}</p>
          <p className="detail-facts">
            <WrapperDot wrapper={cigar?.wrapperType ?? null} />
            {strength && <span>{strength}</span>}
            {cigar?.country && <span>{cigar.country}</span>}
          </p>
        </div>
        <div className="detail-score">
          {shown === null ? (
            <span className="muted">No score</span>
          ) : (
            <>
              <ScoreRing shown={shown} size={112} stroke={5}>
                <span className="numeral numeral-lg num">{counted}</span>
              </ScoreRing>
              <span className="verdict verdict-lg" data-verdict={verdict}>
                {verdict}
              </span>
            </>
          )}
        </div>
      </header>

      {smoke.status === 'draft' && (
        <div className="banner">
          <p>This one is still in progress.</p>
          <Link
            href={`/log/${smoke.id}/${smoke.draftStep ?? 'scores'}`}
            className="btn btn-primary"
          >
            Resume
          </Link>
        </div>
      )}

      <div className={photos.length > 0 ? 'detail-cols has-photos' : 'detail-cols'}>
        <Gallery photos={photos} />
        <div className="detail-info">
          {groups
            .filter((group) => group.title === 'Pre-light')
            .map((group) => (
              <Facts key={group.title} title={group.title} facts={group.facts} />
            ))}

          {thirdRows.length > 0 && (
            <section className="detail-section">
              <h2>By third</h2>
              <ol className="thirds">
                {thirdRows.map(({ key, label, third }) => {
                  const burning = burnLine(third)
                  return (
                    <li key={key}>
                      <h3>{label}</h3>
                      <FlavorTags tags={third.tags} />
                      {third.offTags.length > 0 && <p>Off: {third.offTags.join(', ')}</p>}
                      {(third.strength || third.body) && (
                        <p className="muted">
                          {[
                            third.strength && `Strength ${levelLabel(third.strength)}`,
                            third.body && `Body ${levelLabel(third.body)}`,
                          ]
                            .filter(Boolean)
                            .join(' \u00B7 ')}
                        </p>
                      )}
                      {burning && <p className="muted">{burning}</p>}
                      {(third.retrohale || third.retrohaleTags.length > 0) && (
                        <p>Retrohale: {both(third.retrohaleTags, third.retrohale)}</p>
                      )}
                      {third.note && <p className="detail-note">{third.note}</p>}
                      {third.issues.length > 0 && (
                        <p className="muted">{third.issues.join(', ')}</p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {hasTaste && (
            <section className="detail-section">
              <h2>Hit and missed</h2>
              {taste.hit.length === 0 && taste.missed.length === 0 ? (
                <NoteGroup title="You tasted" tags={taste.added} />
              ) : (
                <>
                  <NoteGroup title="You tasted" tags={taste.hit} />
                  <NoteGroup title="You missed" tags={taste.missed} />
                  <NoteGroup title="Added" tags={taste.added} />
                </>
              )}
            </section>
          )}

          {hasDelta && delta && (
            <section className="detail-section">
              <h2>New this time</h2>
              <NoteGroup title="Showed up" tags={delta.arrived} />
              <NoteGroup title="Dropped off" tags={delta.dropped} />
            </section>
          )}

          <section className="detail-section">
            <h2>Lounge 100</h2>
            <dl className="ratings">
              {RUBRIC.map((category) => {
                const rating = smoke.ratings[category.key]
                return (
                  <div key={category.key} className="rating-row">
                    <dt>{category.label}</dt>
                    <dd className="num">{rating === null ? 'Not rated' : formatRating(rating)}</dd>
                    <span className="rating-bar" aria-hidden="true">
                      <span style={{ width: `${((rating ?? 0) / 10) * 100}%` }} />
                    </span>
                  </div>
                )
              })}
            </dl>
            {smoke.scoreNote && <p className="detail-note">{smoke.scoreNote}</p>}
          </section>

          {groups
            .filter((group) => group.title !== 'Pre-light')
            .map((group) => (
              <Facts key={group.title} title={group.title} facts={group.facts} />
            ))}

          {smoke.summary && (
            <section className="detail-section">
              <h2>Note</h2>
              <p className="detail-note">{smoke.summary}</p>
            </section>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <Link href={`/log/${smoke.id}/full/prelight`} className="btn btn-quiet">
          <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
          {smoke.mode === 'full' ? 'Edit' : 'Add detail'}
        </Link>
        <button type="button" className="btn btn-quiet" onClick={() => void copy()}>
          <Copy size={20} strokeWidth={1.5} aria-hidden="true" />
          Copy summary
        </button>
        <button type="button" className="btn btn-quiet" onClick={remove}>
          <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  )
}
