import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

let current: Toast | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/** One toast at a time. Undo toasts stay for 8 seconds. */
export function showToast(toast: Omit<Toast, 'id'>, ms = toast.onAction ? 8000 : 2500) {
  clearTimeout(timer)
  current = { ...toast, id: nextId++ }
  timer = setTimeout(dismissToast, ms)
  emit()
}

export function dismissToast() {
  clearTimeout(timer)
  current = null
  emit()
}

export function useToast(): Toast | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}
