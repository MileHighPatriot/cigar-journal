import { type FormEvent, useState } from 'react'
import { newCigar } from '../data/factories'
import { saveRecord } from '../data/store'
import type { Cigar, Level, PriceTier, Shape } from '../data/types'
import { LEVEL_LABELS } from '../domain/scoring'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  /** The cigar to edit, or null to add a new one. */
  cigar: Cigar | null
  wrappers: string[]
  onClose: () => void
  onSaved: (cigar: Cigar) => void
}

type Fields = Record<
  | 'brand'
  | 'line'
  | 'vitola'
  | 'lengthIn'
  | 'ringGauge'
  | 'shape'
  | 'wrapperType'
  | 'wrapperOrigin'
  | 'binder'
  | 'filler'
  | 'country'
  | 'factory'
  | 'strength'
  | 'priceTier'
  | 'notes',
  string
>

function toFields(cigar: Cigar | null): Fields {
  const text = (value: string | number | null | undefined) =>
    value === null || value === undefined ? '' : String(value)
  return {
    brand: text(cigar?.brand),
    line: text(cigar?.line),
    vitola: text(cigar?.vitola),
    lengthIn: text(cigar?.lengthIn),
    ringGauge: text(cigar?.ringGauge),
    shape: text(cigar?.shape),
    wrapperType: text(cigar?.wrapperType),
    wrapperOrigin: text(cigar?.wrapperOrigin),
    binder: text(cigar?.binder),
    filler: text(cigar?.filler),
    country: text(cigar?.country),
    factory: text(cigar?.factory),
    strength: text(cigar?.strength),
    priceTier: text(cigar?.priceTier),
    notes: text(cigar?.notes),
  }
}

const orNull = (value: string) => value.trim() || null
const numberOrNull = (value: string) => {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Add or edit a catalog cigar. Saving an edit also marks a seeded cigar as confirmed. */
export function CigarForm({ open, cigar, wrappers, onClose, onSaved }: Props) {
  return (
    <Sheet open={open} title={cigar ? 'Edit cigar' : 'Add new cigar'} onClose={onClose}>
      {open && (
        <Form
          key={cigar?.id ?? 'new'}
          cigar={cigar}
          wrappers={wrappers}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Sheet>
  )
}

function Form({ cigar, wrappers, onClose, onSaved }: Omit<Props, 'open'>) {
  const [fields, setFields] = useState(() => toFields(cigar))
  const set = (key: keyof Fields) => (value: string) => setFields({ ...fields, [key]: value })
  const valid = fields.brand.trim() !== '' || fields.line.trim() !== ''

  function submit(event: FormEvent) {
    event.preventDefault()
    // When opened from inside another form, that form must not see this submit.
    event.stopPropagation()
    if (!valid) return
    const values = {
      brand: fields.brand.trim(),
      line: fields.line.trim(),
      vitola: orNull(fields.vitola),
      lengthIn: numberOrNull(fields.lengthIn),
      ringGauge: numberOrNull(fields.ringGauge),
      shape: (orNull(fields.shape) as Shape | null) ?? null,
      wrapperType: orNull(fields.wrapperType),
      wrapperOrigin: orNull(fields.wrapperOrigin),
      binder: orNull(fields.binder),
      filler: orNull(fields.filler),
      country: orNull(fields.country),
      factory: orNull(fields.factory),
      strength: (numberOrNull(fields.strength) as Level | null) ?? null,
      priceTier: (numberOrNull(fields.priceTier) as PriceTier | null) ?? null,
      notes: fields.notes.trim(),
    }
    // Editing a seeded cigar means Kohlton has looked at it, so it counts as confirmed.
    const saved = cigar ? { ...cigar, ...values, confirmed: true } : newCigar(values)
    void saveRecord('cigars', saved)
    onSaved(saved)
    onClose()
  }

  const input = (
    key: keyof Fields,
    label: string,
    extra: { placeholder?: string; inputMode?: 'decimal' | 'numeric'; list?: string } = {},
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        className={extra.inputMode ? 'input num' : 'input'}
        value={fields[key]}
        onChange={(event) => set(key)(event.target.value)}
        autoCapitalize={extra.inputMode ? undefined : 'words'}
        {...extra}
      />
    </label>
  )

  return (
    <form className="stack" onSubmit={submit}>
      {!cigar && (
        <p className="muted">A brand or a line is enough. You can fill in the rest later.</p>
      )}
      {input('brand', 'Brand')}
      {input('line', 'Line')}
      <div className="form-row">
        {input('vitola', 'Size name', { placeholder: 'Robusto' })}
        <label className="field">
          <span>Shape</span>
          <select
            className="input"
            value={fields.shape}
            onChange={(event) => set('shape')(event.target.value)}
          >
            <option value="">Not set</option>
            <option value="parejo">Parejo</option>
            <option value="box-pressed">Box-pressed</option>
            <option value="figurado">Figurado</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        {input('lengthIn', 'Length (inches)', { inputMode: 'decimal' })}
        {input('ringGauge', 'Ring gauge', { inputMode: 'numeric' })}
      </div>
      <div className="form-row">
        <label className="field">
          <span>Strength</span>
          <select
            className="input"
            value={fields.strength}
            onChange={(event) => set('strength')(event.target.value)}
          >
            <option value="">Not set</option>
            {LEVEL_LABELS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Price tier</span>
          <select
            className="input"
            value={fields.priceTier}
            onChange={(event) => set('priceTier')(event.target.value)}
          >
            <option value="">Not set</option>
            <option value="1">$</option>
            <option value="2">$$</option>
            <option value="3">$$$</option>
          </select>
        </label>
      </div>
      {input('wrapperType', 'Wrapper', { list: 'wrapper-options' })}
      <datalist id="wrapper-options">
        {wrappers.map((wrapper) => (
          <option key={wrapper} value={wrapper} />
        ))}
      </datalist>
      {input('wrapperOrigin', 'Wrapper origin')}
      {input('binder', 'Binder')}
      {input('filler', 'Filler')}
      <div className="form-row">
        {input('country', 'Country made')}
        {input('factory', 'Factory')}
      </div>
      <label className="field">
        <span>Notes</span>
        <textarea
          className="input textarea"
          rows={3}
          value={fields.notes}
          onChange={(event) => set('notes')(event.target.value)}
        />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!valid}>
          Save
        </button>
      </div>
    </form>
  )
}
