import { useState } from 'react'
import { patchSmoke } from '../data/store'
import type { Smoke } from '../data/types'
import { STANDARD_SIZES } from '../domain/sizes'
import { useAutosaveText } from './hooks'

function toNumber(text: string): number | null {
  const value = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) && value > 0 ? value : null
}

/**
 * Notes the size on this smoke, for the record. Tap a common size, then correct the
 * length or ring gauge if this one is different. Tap the size again to clear it.
 */
export function SizePicker({ smoke }: { smoke: Smoke }) {
  const isStandard = STANDARD_SIZES.some((size) => size.name === smoke.vitola)
  const [other, setOther] = useState(Boolean(smoke.vitola) && !isStandard)
  const hasSize = Boolean(smoke.vitola || smoke.lengthIn || smoke.ringGauge)

  const name = useAutosaveText(smoke.vitola ?? '', (text) => {
    void patchSmoke(smoke.id, { vitola: text.trim() || null })
  })
  const length = useAutosaveText(smoke.lengthIn === null ? '' : String(smoke.lengthIn), (text) => {
    void patchSmoke(smoke.id, { lengthIn: toNumber(text) })
  })
  const ring = useAutosaveText(smoke.ringGauge === null ? '' : String(smoke.ringGauge), (text) => {
    void patchSmoke(smoke.id, { ringGauge: toNumber(text) })
  })

  function pick(size: (typeof STANDARD_SIZES)[number]) {
    setOther(false)
    if (smoke.vitola === size.name) {
      void patchSmoke(smoke.id, { vitola: null, lengthIn: null, ringGauge: null })
    } else {
      void patchSmoke(smoke.id, {
        vitola: size.name,
        lengthIn: size.lengthIn,
        ringGauge: size.ringGauge,
      })
    }
  }

  function pickOther() {
    if (other) {
      setOther(false)
      void patchSmoke(smoke.id, { vitola: null, lengthIn: null, ringGauge: null })
    } else {
      setOther(true)
      void patchSmoke(smoke.id, { vitola: null })
    }
  }

  return (
    <section className="stack">
      <div className="section-head">
        <h2>Size</h2>
        <span className="muted">Optional</span>
      </div>
      <div className="chip-row" role="group" aria-label="Size">
        {STANDARD_SIZES.map((size) => (
          <button
            key={size.name}
            type="button"
            className="chip"
            aria-pressed={!other && smoke.vitola === size.name}
            onClick={() => pick(size)}
          >
            {size.name}
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={other} onClick={pickOther}>
          Other
        </button>
      </div>
      {(hasSize || other) && (
        <div className="size-fields">
          {other && (
            <label className="field size-name">
              <span>Size name</span>
              <input
                className="input"
                value={name.value}
                onChange={(event) => name.onChange(event.target.value)}
                onBlur={name.onBlur}
                autoCapitalize="words"
              />
            </label>
          )}
          <label className="field">
            <span>Length (inches)</span>
            <input
              className="input num"
              inputMode="decimal"
              value={length.value}
              onChange={(event) => length.onChange(event.target.value)}
              onBlur={length.onBlur}
            />
          </label>
          <label className="field">
            <span>Ring gauge</span>
            <input
              className="input num"
              inputMode="numeric"
              value={ring.value}
              onChange={(event) => ring.onChange(event.target.value)}
              onBlur={ring.onBlur}
            />
          </label>
        </div>
      )}
    </section>
  )
}
