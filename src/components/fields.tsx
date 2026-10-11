import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import type { Level } from '../data/types'
import { LEVEL_LABELS } from '../domain/scoring'
import { useAutosaveText } from './hooks'

interface Option<T extends string> {
  value: T
  label: string
}

interface ChoiceProps<T extends string> {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T | null) => void
}

/** One-of-many chips. Tapping the picked chip again clears it. Saves at once. */
export function ChipChoice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const id = useId()
  return (
    <div className="field">
      <span id={id}>{label}</span>
      <div className="chip-row" role="group" aria-labelledby={id}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={value === option.value}
            onClick={() => onChange(value === option.value ? null : option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface MultiProps<T extends string> {
  label: string
  options: Option<T>[]
  values: T[]
  onChange: (values: T[]) => void
}

/** Any-of-many chips. */
export function ChipMulti<T extends string>({ label, options, values, onChange }: MultiProps<T>) {
  const id = useId()
  return (
    <div className="field">
      <span id={id}>{label}</span>
      <div className="chip-row" role="group" aria-labelledby={id}>
        {options.map((option) => {
          const on = values.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={on}
              onClick={() =>
                onChange(on ? values.filter((v) => v !== option.value) : [...values, option.value])
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Mild to Full on the lounge sheet's five steps. */
export function LevelPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: Level | null
  onChange: (value: Level | null) => void
}) {
  return (
    <ChipChoice
      label={label}
      value={value === null ? null : String(value)}
      options={LEVEL_LABELS.map((name, index) => ({ value: String(index + 1), label: name }))}
      onChange={(next) => onChange(next === null ? null : (Number(next) as Level))}
    />
  )
}

/** A count with big minus and plus buttons. */
export function Counter({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="field">
      <span id={id}>{label}</span>
      <div className="counter" role="group" aria-labelledby={id}>
        <button
          type="button"
          className="btn btn-quiet"
          aria-label={`One fewer: ${label}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Minus size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span className="counter-value num" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="btn btn-quiet"
          aria-label={`One more: ${label}`}
          onClick={() => onChange(value + 1)}
        >
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

interface TextProps {
  label: string
  value: string
  onCommit: (value: string) => void
  multiline?: boolean
  placeholder?: string
}

/** A text field that saves itself shortly after typing stops, and on blur. */
export function AutoText({ label, value, onCommit, multiline, placeholder }: TextProps) {
  const field = useAutosaveText(value, onCommit)
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          className="input textarea"
          rows={3}
          placeholder={placeholder}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
        />
      ) : (
        <input
          id={id}
          className="input"
          placeholder={placeholder}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
        />
      )}
    </div>
  )
}
