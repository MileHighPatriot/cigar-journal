import { ChevronLeft, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { PHOTO_KINDS } from '../components/PhotoSection'
import { showToast } from '../components/toast'
import { deleteSmoke, photosForSmoke, useStore } from '../data/store'
import type { Photo } from '../data/types'
import {
  cigarSubtitle,
  cigarTitle,
  formatDateLong,
  formatMinutes,
  formatMoney,
  formatRating,
  formatTime,
} from '../domain/format'
import { RUBRIC, shownScore, verdictFor } from '../domain/scoring'
import { effectiveTags } from '../domain/tags'
import { usePhotoUrl } from '../photos/usePhotoUrl'

const SETTING_LABELS = {
  lounge: 'Stanley Pappas lounge',
  home: 'Home',
  patio: 'Patio',
  other: 'Other',
} as const

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

  if (!smoke || smoke.deletedAt) {
    return (
      <div className="detail">
        <p className="muted">This smoke is not in your journal.</p>
        <Link href="/" className="btn btn-quiet">
          Back to journal
        </Link>
      </div>
    )
  }

  const cigar = state.cigars.get(smoke.cigarId)
  const photos = photosForSmoke(state.photos, smoke.id)
  const shown = smoke.score === null ? null : shownScore(smoke.score)
  const tags = effectiveTags(smoke)
  const where = smoke.setting === 'other' ? smoke.settingOther : SETTING_LABELS[smoke.setting]
  const meta = [
    formatDateLong(smoke.smokedAt),
    formatTime(smoke.smokedAt),
    where,
    formatMinutes(smoke.durationMin),
  ].filter(Boolean)

  function remove() {
    const { undo } = deleteSmoke(id)
    navigate('/')
    showToast({ message: 'Smoke deleted', actionLabel: 'Undo', onAction: () => void undo() })
  }

  return (
    <article className="detail">
      <div className="detail-bar">
        <Link href="/" className="icon-btn detail-back" aria-label="Back to journal">
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      <header className="detail-head">
        <div>
          <p className="band-brand">{cigar?.brand || 'Unknown brand'}</p>
          <h1>{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</h1>
          {cigar && cigarSubtitle(cigar) && <p className="muted">{cigarSubtitle(cigar)}</p>}
          <p className="muted num detail-meta">{meta.join(' · ')}</p>
        </div>
        <div className="detail-score">
          {shown === null ? (
            <span className="muted">No score</span>
          ) : (
            <>
              <span className="numeral numeral-lg num">{shown}</span>
              <span className="detail-verdict">{verdictFor(shown)}</span>
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
          </section>

          {tags.length > 0 && (
            <section className="detail-section">
              <h2>Flavors</h2>
              <ul className="tag-list">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>
          )}

          {(smoke.pairingType || smoke.pairingName) && (
            <section className="detail-section">
              <h2>Pairing</h2>
              <p>{[smoke.pairingType, smoke.pairingName].filter(Boolean).join(', ')}</p>
            </section>
          )}

          {smoke.summary && (
            <section className="detail-section">
              <h2>Note</h2>
              <p className="detail-note">{smoke.summary}</p>
            </section>
          )}

          {smoke.pricePaid !== null && (
            <section className="detail-section">
              <h2>Price paid</h2>
              <p className="num">{formatMoney(smoke.pricePaid)}</p>
            </section>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <button type="button" className="btn btn-quiet" onClick={remove}>
          <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  )
}
