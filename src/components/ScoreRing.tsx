import type { ReactNode } from 'react'

interface Props {
  /** Shown score, or null for an empty ring. */
  shown: number | null
  size?: number
  stroke?: number
  children?: ReactNode
}

/**
 * A ring that fills with the score. It maps 70 to 100 onto the full circle so that
 * an 82 and a 91 look clearly different.
 */
export function ScoreRing({ shown, size = 64, stroke = 3, children }: Props) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const fill = shown === null ? 0 : Math.min(1, Math.max(0.04, (shown - 70) / 30))
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={`${fill * circumference} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-center">{children}</span>
    </span>
  )
}
