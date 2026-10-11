import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** True once the element has come within `margin` of the viewport. */
export function useNearViewport<T extends Element>(
  margin = '400px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || near) return
    if (!('IntersectionObserver' in window)) {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true)
      },
      { rootMargin: margin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [near, margin])

  return [ref, near]
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const flushers = new Set<() => void>()

/** Runs every pending text save. Called when the page is hidden or closed. */
export function flushPendingSaves() {
  for (const flush of flushers) flush()
}

/**
 * A text field that saves 400 ms after the last keystroke, on blur, and when the
 * page is hidden. The value on screen is never thrown away by a slow save.
 */
export function useAutosaveText(saved: string, commit: (value: string) => void, delay = 400) {
  const [value, setValue] = useState(saved)
  const pending = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const commitRef = useRef(commit)
  commitRef.current = commit

  const flush = useRef(() => {
    clearTimeout(timer.current)
    if (pending.current !== null) {
      const next = pending.current
      pending.current = null
      commitRef.current(next)
    }
  }).current

  useEffect(() => {
    flushers.add(flush)
    return () => {
      flush()
      flushers.delete(flush)
    }
  }, [flush])

  // Pick up changes made elsewhere (an import, another screen) when nothing is being typed.
  useEffect(() => {
    if (pending.current === null) setValue(saved)
  }, [saved])

  return {
    value,
    onChange: (next: string) => {
      setValue(next)
      pending.current = next
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, delay)
    },
    onBlur: flush,
  }
}

/** Tracks a CSS media query, for the few places where layout changes behavior. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    },
    () => window.matchMedia(query).matches,
  )
}

export const LAPTOP = '(min-width: 1024px)'
export const TABLET_UP = '(min-width: 768px)'

/** Counts up to a number over a short moment. Jumps straight there with reduced motion. */
export function useCountUp(target: number | null, ms = 350): number | null {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    if (target === null || from.current === null || prefersReducedMotion()) {
      from.current = target
      setValue(target)
      return
    }
    const start = from.current
    const began = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / ms)
      const eased = 1 - (1 - progress) ** 3
      const next = Math.round(start + (target - start) * eased)
      from.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, ms])

  return value
}
