import type { ReactNode } from 'react'
import { niceMax } from '../domain/stats'

/*
 * Small charts drawn with plain HTML and CSS in the app's palette. One hue (brass) for
 * magnitude; text always wears text colors. Every mark can be hovered, tapped, or tabbed
 * to for its exact value, and the values are in the markup for screen readers.
 */

export interface ColumnItem {
  key: string
  /** Short label under the column. */
  label: string
  value: number
  /** Full sentence for the tooltip and screen readers. */
  tip: string
}

interface ColumnChartProps {
  items: ColumnItem[]
  formatTick: (value: number) => string
  label: string
  /** Many columns: on a phone only every other label is shown. */
  dense?: boolean
}

/** Columns from a zero baseline, with a few quiet gridlines carrying the scale. */
export function ColumnChart({ items, formatTick, label, dense }: ColumnChartProps) {
  const top = niceMax(Math.max(...items.map((item) => item.value), 0))
  const ticks = [top, top / 2, 0]
  return (
    <div
      className={dense ? 'chart-columns is-dense' : 'chart-columns'}
      role="group"
      aria-label={label}
    >
      <div className="chart-grid" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} className="chart-gridline">
            <span className="chart-tick num">{formatTick(tick)}</span>
          </span>
        ))}
      </div>
      <ul className="chart-cols">
        {items.map((item) => (
          // biome-ignore lint/a11y/noNoninteractiveTabindex: each column can be focused to read its value
          <li key={item.key} className="chart-col" tabIndex={0} aria-label={item.tip}>
            <span className="chart-col-plot" aria-hidden="true">
              <span
                className={item.value > 0 ? 'chart-bar' : 'chart-bar is-zero'}
                style={{ height: `${(item.value / top) * 100}%` }}
              />
            </span>
            <span className="chart-col-label num" aria-hidden="true">
              {item.label}
            </span>
            <span className="chart-tip" aria-hidden="true">
              {item.tip}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface DotItem {
  label: string
  value: number
  note: string
}

interface DotPlotProps {
  items: DotItem[]
  min: number
  max: number
  label: string
}

/**
 * A dot on a shared scale per row. Averages sit close together, so position on a
 * 70 to 100 scale shows the gaps honestly where bars from zero would all look alike.
 */
export function DotPlot({ items, min, max, label }: DotPlotProps) {
  return (
    <div className="chart-dots" role="group" aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.label} className="chart-dot-row">
            <span className="chart-row-label">{item.label}</span>
            <span className="chart-track" aria-hidden="true">
              <span
                className="chart-dot"
                style={{ left: `${((item.value - min) / (max - min)) * 100}%` }}
              />
            </span>
            <span className="chart-row-value num">
              {item.value.toFixed(1)}
              <span className="chart-row-note">{item.note}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="chart-dot-axis num" aria-hidden="true">
        <span />
        <span className="chart-axis-ends">
          <span>{min}</span>
          <span>{(min + max) / 2}</span>
          <span>{max}</span>
        </span>
        <span />
      </div>
    </div>
  )
}

export interface BarItem {
  key: string
  label: ReactNode
  value: number
}

/** Ranked horizontal bars from zero, with the count at the end of each row. */
export function BarList({ items, label }: { items: BarItem[]; label: string }) {
  const top = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="chart-bars" aria-label={label}>
      {items.map((item) => (
        <li key={item.key} className="chart-bar-row">
          <span className="chart-row-label">{item.label}</span>
          <span className="chart-track chart-track-bar" aria-hidden="true">
            <span className="chart-hbar" style={{ width: `${(item.value / top) * 100}%` }} />
          </span>
          <span className="chart-row-value num">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}
