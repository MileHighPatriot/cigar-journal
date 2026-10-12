/** Tab icons drawn for this app, in the same 24 px grid and line weight as the rest. */

interface IconProps {
  size?: number
  strokeWidth?: number
}

function Icon({
  size = 24,
  strokeWidth = 1.5,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** A lit cigar with its band, and a curl of smoke off the foot. */
export function CigarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <g transform="rotate(-32 12 13)">
        <path d="M4.5 10.5H19v5H4.5a2.5 2.5 0 0 1 0-5Z" />
        <path d="M8 10.5v5M10.5 10.5v5M16.5 10.5v5" />
      </g>
      <path d="M20 5.2c.9-1.1-.7-1.7 0-3" />
    </Icon>
  )
}

/** A humidor with its lid standing open. */
export function HumidorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 11.5h18V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M3 11.5 5.2 4.6a.9.9 0 0 1 .9-.6h11.8a.9.9 0 0 1 .9.6L21 11.5" />
      <path d="M10.5 11.5v2.2a1.5 1.5 0 0 0 3 0v-2.2" />
      <path d="M9 7.6h6" />
    </Icon>
  )
}

/** Two cigars stood side by side. */
export function CompareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 20.5V6a2.5 2.5 0 0 1 5 0v14.5Z" />
      <path d="M14 20.5V6a2.5 2.5 0 0 1 5 0v14.5Z" />
      <path d="M5 9.5h5M5 12h5M14 9.5h5M14 12h5" />
    </Icon>
  )
}

/** The CJ mark in one line weight, for the Home tab. */
export function MarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.9 6.4a6 6 0 1 0 0 8.2" />
      <path d="M18.5 3v10.8c0 3.6-3.2 5.4-7.6 5.2-3-.2-5.6-1.4-7.4-3.4" />
    </Icon>
  )
}
