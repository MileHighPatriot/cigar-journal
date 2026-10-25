import villa from '../assets/havana-label.jpg'
import cigar from '../assets/label-cigar.jpg'
import humidor from '../assets/label-humidor.jpg'
import medal from '../assets/label-medal.jpg'
import pair from '../assets/label-pair.jpg'
import salon from '../assets/label-salon.jpg'

const ART = {
  villa: {
    src: villa,
    alt: 'Havana label. A villa and palms above a tobacco field, with the harbor behind.',
  },
  cigar: {
    src: cigar,
    alt: 'Havana label. A cigar lying on tobacco leaves.',
  },
  humidor: {
    src: humidor,
    alt: 'Havana label. An open box of cigars.',
  },
  salon: {
    src: salon,
    alt: 'Havana label. A salon with chairs, coffee, and a cigar.',
  },
  pair: {
    src: pair,
    alt: 'Havana label. Two cigars crossed on tobacco leaves.',
  },
  medal: {
    src: medal,
    alt: 'Havana label. A prize medal ringed with tobacco leaves.',
  },
} as const

type Scene = keyof typeof ART

/** A cigar-label lithograph. Compact is the band on a tab. Band is the small sidebar crop. */
export function LabelArt({
  scene = 'villa',
  compact = false,
  band = false,
}: {
  scene?: Scene
  compact?: boolean
  band?: boolean
}) {
  const plate = ART[scene]
  const kind = band
    ? 'label-art label-art-band'
    : compact
      ? 'label-art label-art-compact'
      : 'label-art'
  return (
    <figure className={kind}>
      <img src={plate.src} alt={plate.alt} />
    </figure>
  )
}
