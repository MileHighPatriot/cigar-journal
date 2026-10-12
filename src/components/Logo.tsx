import { useId } from 'react'

/**
 * The mark: a C and a J. The C is a gold crescent. The J is a cigar, band and all, and the
 * smoke off its lit foot sweeps under the C to make the J's tail. The same drawing, on its
 * framed tile, is the app icon in public/icon.svg.
 */
export function Logo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const stop = (offset: number, color: string) => (
    <stop offset={offset} style={{ stopColor: `var(--${color})` }} />
  )
  return (
    <svg
      className={className ? `logo ${className}` : 'logo'}
      viewBox="80 68 320 378"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0.35" y2="1">
          {stop(0, 'gold-hi')}
          {stop(0.38, 'brass')}
          {stop(0.62, 'gold-lo')}
          {stop(1, 'gold-mid')}
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="0">
          {stop(0, 'gold-lo')}
          {stop(0.3, 'gold-hi')}
          {stop(0.55, 'brass')}
          {stop(1, 'gold-lo')}
        </linearGradient>
        <linearGradient id={`${id}t`} x1="1" y1="0" x2="0" y2="0">
          {stop(0, 'brass')}
          {stop(0.5, 'gold-mid')}
          {stop(1, 'gold-hi')}
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, 'ember-deep')}
          {stop(0.45, 'ember-mid')}
          {stop(1, 'ember-hot')}
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id}g)`}
        d="M322 141.5A132 132 0 1 0 322 334.5L308.2 324.2A104 104 0 1 1 308.2 151.8Z"
      />
      <path className="logo-cut" d="M316.8 147.6A118 118 0 1 0 316.8 328.4" />
      <path
        className="logo-tail"
        fill={`url(#${id}t)`}
        d="M388 340A93 93 0 0 1 295 433C226 433 132 424 92 344C144 404 226 410 295 406A47 66 0 0 0 342 340Z"
      />
      <path fill={`url(#${id}h)`} d="M342 340V103A23 23 0 0 1 388 103V340Z" />
      <path
        className="logo-cut"
        d="M349 306L381 282M349 262L381 238M349 218L381 194M345 107Q365 117 385 107"
      />
      <rect className="logo-band" x="342" y="138" width="46" height="44" />
      <path className="logo-band-edge" d="M342 138H388M342 182H388" />
      <path fill={`url(#${id}g)`} d="M365 149l11 11-11 11-11-11Z" />
      <rect className="logo-ember" fill={`url(#${id}e)`} x="342" y="324" width="46" height="16" />
    </svg>
  )
}
