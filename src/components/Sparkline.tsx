import { useId } from 'react'

interface Props {
  /** Oldest first. */
  values: number[]
  width?: number
  height?: number
  label: string
}

/** A small line chart of recent scores, drawn in SVG in the palette. */
export function Sparkline({ values, width = 320, height = 56, label }: Props) {
  const gradient = useId()
  if (values.length < 2) return null
  const pad = 4
  const low = Math.min(...values) - 1
  const high = Math.max(...values) + 1
  const x = (index: number) => pad + (index / (values.length - 1)) * (width - pad * 2)
  const y = (value: number) => height - pad - ((value - low) / (high - low)) * (height - pad * 2)
  const points = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`)
  const lastX = x(values.length - 1)
  const lastY = y(values[values.length - 1] ?? 0)
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="spark-stop-top" />
          <stop offset="1" className="spark-stop-bottom" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pad},${height} ${points.join(' ')} ${width - pad},${height}`}
        fill={`url(#${gradient})`}
      />
      <polyline className="spark-line" points={points.join(' ')} pathLength={1} />
      <circle className="spark-dot" cx={lastX} cy={lastY} r="3" />
    </svg>
  )
}
