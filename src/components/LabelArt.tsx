import { memo } from 'react'
import cigarSmall from '../assets/label-cigar-640.webp'
import cigarLarge from '../assets/label-cigar-1280.webp'
import humidorSmall from '../assets/label-humidor-640.webp'
import humidorLarge from '../assets/label-humidor-1280.webp'
import medalSmall from '../assets/label-medal-640.webp'
import medalLarge from '../assets/label-medal-1280.webp'
import pairSmall from '../assets/label-pair-640.webp'
import pairLarge from '../assets/label-pair-1280.webp'
import salonSmall from '../assets/label-salon-640.webp'
import salonLarge from '../assets/label-salon-1280.webp'
import villaSmall from '../assets/label-villa-640.webp'
import villaLarge from '../assets/label-villa-1280.webp'

const ART = {
  villa: {
    small: villaSmall,
    large: villaLarge,
    alt: 'Havana label. A villa and palms above a tobacco field, with the harbor behind.',
  },
  cigar: {
    small: cigarSmall,
    large: cigarLarge,
    alt: 'Havana label. A cigar lying on tobacco leaves.',
  },
  humidor: {
    small: humidorSmall,
    large: humidorLarge,
    alt: 'Havana label. An open box of cigars.',
  },
  salon: {
    small: salonSmall,
    large: salonLarge,
    alt: 'Havana label. A salon with chairs, coffee, and a cigar.',
  },
  pair: {
    small: pairSmall,
    large: pairLarge,
    alt: 'Havana label. Two cigars crossed on tobacco leaves.',
  },
  medal: {
    small: medalSmall,
    large: medalLarge,
    alt: 'Havana label. A prize medal ringed with tobacco leaves.',
  },
} as const

type Scene = keyof typeof ART

/**
 * A cigar-label lithograph. Compact is the band on a tab. Band is the small sidebar crop.
 * The picture comes in two sizes and the browser takes the one that fits. Its box is sized
 * in CSS before the file arrives, so nothing below it jumps.
 */
export const LabelArt = memo(function LabelArt({
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
      <img
        src={plate.small}
        srcSet={`${plate.small} 640w, ${plate.large} 1280w`}
        sizes={band ? '232px' : '(min-width: 1024px) 460px, 100vw'}
        width={1280}
        height={720}
        alt={plate.alt}
        decoding="async"
      />
    </figure>
  )
})
