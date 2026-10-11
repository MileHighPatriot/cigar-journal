import type { Level } from '../data/types'
import { LEVEL_LABELS, levelLabel } from '../domain/scoring'

/** Where a cigar lands from Mild to Full: five steps, filled up to its level. */
export function LevelMeter({ label, value }: { label: string; value: Level | null }) {
  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value">{value ? levelLabel(value) : 'Not published'}</span>
      </div>
      <div
        className="meter-track"
        role="img"
        aria-label={
          value ? `${label}: ${levelLabel(value)}, step ${value} of 5` : `${label}: not published`
        }
      >
        {LEVEL_LABELS.map((name, index) => (
          <span
            key={name}
            className={value && index < value ? 'meter-step is-on' : 'meter-step'}
            data-level={index + 1}
          />
        ))}
      </div>
      <div className="meter-ends" aria-hidden="true">
        <span>Mild</span>
        <span>Medium</span>
        <span>Full</span>
      </div>
    </div>
  )
}
