import { Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { nowIso } from '../data/repository'
import { patchSmoke } from '../data/store'
import type { Smoke } from '../data/types'
import { elapsedMs, formatElapsed, minutesFor } from '../domain/timer'
import { useAutosaveText } from './hooks'

/**
 * The smoke timer. Only the start time is stored, and the elapsed time is worked out
 * from it on every tick, so a reload or a locked phone never loses the count.
 */
export function TimerBar({ smoke }: { smoke: Smoke }) {
  const running = smoke.timerStartedAt !== null && smoke.timerStoppedAt === null
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [running])

  const minutes = useAutosaveText(
    smoke.durationMin === null ? '' : String(smoke.durationMin),
    (text) => {
      const value = Number.parseInt(text, 10)
      void patchSmoke(smoke.id, { durationMin: Number.isFinite(value) && value > 0 ? value : null })
    },
  )

  function start() {
    void patchSmoke(smoke.id, { timerStartedAt: nowIso(), timerStoppedAt: null, durationMin: null })
  }

  function stop() {
    if (!smoke.timerStartedAt) return
    const stoppedAt = nowIso()
    void patchSmoke(smoke.id, {
      timerStoppedAt: stoppedAt,
      durationMin: minutesFor(elapsedMs(smoke.timerStartedAt, stoppedAt)),
    })
  }

  if (running && smoke.timerStartedAt) {
    return (
      <div className="timer is-running">
        <span className="resume-pulse" aria-hidden="true" />
        <span className="timer-text">
          <span className="timer-clock num" role="timer">
            {formatElapsed(elapsedMs(smoke.timerStartedAt, null))}
          </span>
          <span className="muted">Smoking now</span>
        </span>
        <button type="button" className="btn btn-quiet" onClick={stop}>
          <Square size={18} strokeWidth={1.5} aria-hidden="true" />
          Stop
        </button>
      </div>
    )
  }

  return (
    <div className="timer">
      <label className="timer-minutes">
        <span className="muted">Minutes</span>
        <input
          className="input num"
          inputMode="numeric"
          placeholder="0"
          value={minutes.value}
          onChange={(event) => minutes.onChange(event.target.value)}
          onBlur={minutes.onBlur}
        />
      </label>
      <button type="button" className="btn btn-quiet" onClick={start}>
        <Play size={18} strokeWidth={1.5} aria-hidden="true" />
        {smoke.timerStartedAt ? 'Restart timer' : 'Start timer'}
      </button>
    </div>
  )
}
