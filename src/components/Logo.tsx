/**
 * The mark: a C and a J. The C is a crescent. The J is a cigar, and the curve under the C
 * is the J's tail. Bone on ink, with the band and the lit foot in ember.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `logo ${className}` : 'logo'}
      viewBox="80 68 320 378"
      aria-hidden="true"
    >
      <path
        className="logo-ink"
        d="M322 141.5A132 132 0 1 0 322 334.5L308.2 324.2A104 104 0 1 1 308.2 151.8Z"
      />
      <path className="logo-cut" d="M316.8 147.6A118 118 0 1 0 316.8 328.4" />
      <path
        className="logo-ink"
        d="M388 340A93 93 0 0 1 295 433C226 433 132 424 92 344C144 404 226 410 295 406A47 66 0 0 0 342 340Z"
      />
      <path className="logo-ink" d="M342 340V103A23 23 0 0 1 388 103V340Z" />
      <path
        className="logo-cut"
        d="M349 306L381 282M349 262L381 238M349 218L381 194M345 107Q365 117 385 107"
      />
      <rect className="logo-ember" x="342" y="138" width="46" height="44" />
      <path className="logo-band-edge" d="M342 138H388M342 182H388" />
      <path className="logo-ink" d="M365 149l11 11-11 11-11-11Z" />
      <rect className="logo-ember" x="342" y="324" width="46" height="16" />
    </svg>
  )
}
