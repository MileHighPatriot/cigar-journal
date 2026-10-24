import { Link } from 'wouter'
import type { Photo } from '../data/types'
import { cigarTitle, formatDate, formatMinutes } from '../domain/format'
import { cardFlavors } from '../domain/journal'
import { shownScore, verdictFor } from '../domain/scoring'
import type { SmokeRow } from '../domain/search'
import { smokeSize } from '../domain/sizes'
import { usePhotoUrl } from '../photos/usePhotoUrl'
import { FlavorTags } from './FlavorTags'
import { useNearViewport } from './hooks'
import { ScoreRing } from './ScoreRing'

interface Props {
  row: SmokeRow
  /** The photo to show, already picked by the list (band first). */
  photo: Photo | undefined
  selected?: boolean
  /** The newest smoke gets a wide photo across the top. */
  featured?: boolean
}

export function SmokeCard({ row, photo, selected, featured }: Props) {
  const { smoke, cigar } = row
  const [ref, near] = useNearViewport<HTMLAnchorElement>()
  const wide = Boolean(featured && photo)
  const image = usePhotoUrl(photo?.id, wide ? 'full' : 'thumb', near)
  const shown = smoke.score === null ? null : shownScore(smoke.score)
  const flavors = cardFlavors(smoke)
  const size = smokeSize(smoke, cigar)
  const meta = [formatDate(smoke.smokedAt), formatMinutes(smoke.durationMin)].filter(Boolean)
  const verdict = shown === null ? null : verdictFor(shown)

  return (
    <Link
      ref={ref}
      href={`/smokes/${smoke.id}`}
      className={wide ? 'smoke-card is-featured' : 'smoke-card'}
      aria-current={selected ? 'true' : undefined}
    >
      {/* The one signature detail: a brass band rule with the brand in small caps. */}
      <span className="band">
        <span className="band-brand">{cigar?.brand || 'Unknown brand'}</span>
      </span>
      {wide && (
        <span className="smoke-card-photo">
          {image && <img src={image} alt="" loading="lazy" />}
        </span>
      )}
      <span className="smoke-card-body">
        {photo && !wide && (
          <span className="smoke-card-thumb">
            {image && <img src={image} alt="" width={88} height={88} />}
          </span>
        )}
        <span className="smoke-card-main">
          <span className="smoke-card-title">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
          {size && <span className="smoke-card-sub">{size}</span>}
          <span className="smoke-card-meta num">{meta.join(' · ')}</span>
          {flavors.mode === 'thirds' ? (
            <span className="smoke-card-thirds">{flavors.text}</span>
          ) : (
            <FlavorTags tags={flavors.tags} className="smoke-card-tags" />
          )}
        </span>
        <span className="smoke-card-score">
          {shown === null ? (
            <span className="smoke-card-noscore">No score</span>
          ) : (
            <>
              <ScoreRing shown={shown} size={68}>
                <span className="numeral numeral-sm num">{shown}</span>
              </ScoreRing>
              <span className="verdict" data-verdict={verdict}>
                {verdict}
              </span>
            </>
          )}
        </span>
      </span>
    </Link>
  )
}
