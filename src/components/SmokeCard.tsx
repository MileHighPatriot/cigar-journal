import { Link } from 'wouter'
import type { Photo } from '../data/types'
import { cigarSubtitle, cigarTitle, formatDate, formatMinutes } from '../domain/format'
import { shownScore, verdictFor } from '../domain/scoring'
import type { SmokeRow } from '../domain/search'
import { effectiveTags } from '../domain/tags'
import { usePhotoUrl } from '../photos/usePhotoUrl'
import { useNearViewport } from './hooks'

interface Props {
  row: SmokeRow
  /** The photo to show, already picked by the list (band first). */
  photo: Photo | undefined
  selected?: boolean
}

export function SmokeCard({ row, photo, selected }: Props) {
  const { smoke, cigar } = row
  const [ref, near] = useNearViewport<HTMLAnchorElement>()
  const thumb = usePhotoUrl(photo?.id, 'thumb', near)
  const shown = smoke.score === null ? null : shownScore(smoke.score)
  const tags = effectiveTags(smoke).slice(0, 3)
  const meta = [formatDate(smoke.smokedAt), formatMinutes(smoke.durationMin)].filter(Boolean)

  return (
    <Link
      ref={ref}
      href={`/smokes/${smoke.id}`}
      className="smoke-card"
      aria-current={selected ? 'true' : undefined}
    >
      {/* The one signature detail: a brass band rule with the brand in small caps. */}
      <span className="band">
        <span className="band-brand">{cigar?.brand || 'Unknown brand'}</span>
      </span>
      <span className="smoke-card-body">
        {photo && (
          <span className="smoke-card-thumb">
            {thumb && <img src={thumb} alt="" width={72} height={72} />}
          </span>
        )}
        <span className="smoke-card-main">
          <span className="smoke-card-title">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
          {cigar && cigarSubtitle(cigar) && (
            <span className="smoke-card-sub">{cigarSubtitle(cigar)}</span>
          )}
          <span className="smoke-card-meta num">{meta.join(' · ')}</span>
          {tags.length > 0 && <span className="smoke-card-tags">{tags.join(' · ')}</span>}
        </span>
        <span className="smoke-card-score">
          {shown === null ? (
            <span className="smoke-card-noscore">No score</span>
          ) : (
            <>
              <span className="numeral num">{shown}</span>
              <span className="smoke-card-verdict">{verdictFor(shown)}</span>
            </>
          )}
        </span>
      </span>
    </Link>
  )
}
