/** Elapsed time is always worked out from the start time, so it survives a reload or a locked phone. */
export function elapsedMs(startedAt: string, stoppedAt: string | null, now = Date.now()): number {
  const end = stoppedAt ? Date.parse(stoppedAt) : now
  return Math.max(0, end - Date.parse(startedAt))
}

/** "12:05" under an hour, "1:08:05" after. */
export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const two = (n: number) => String(n).padStart(2, '0')
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${minutes}:${two(seconds)}`
}

/** Whole minutes for the record, never less than 1 once a timer has run. */
export function minutesFor(ms: number): number {
  return Math.max(1, Math.round(ms / 60_000))
}

/** An ISO time as the value of a datetime-local input, in local time. */
export function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const two = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`
}

export function fromLocalInput(value: string): string | null {
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}
