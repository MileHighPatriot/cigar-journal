import type { Repository } from '../data/repository'

/** True when running as an installed Home Screen or Dock app. */
export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export function isIos(): boolean {
  const ua = navigator.userAgent
  // iPadOS reports as a Mac with touch points.
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

/** Asks the browser to protect this app's data from cleanup, and remembers the answer. */
export async function requestPersist(repo: Repository): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    const already = await navigator.storage.persisted()
    const granted = already || (await navigator.storage.persist())
    await repo.setMeta('persistResult', granted)
    return granted
  } catch {
    return false
  }
}

export interface StorageEstimate {
  usage: number | null
  quota: number | null
}

export async function storageEstimate(): Promise<StorageEstimate> {
  if (!navigator.storage?.estimate) return { usage: null, quota: null }
  const { usage, quota } = await navigator.storage.estimate()
  return { usage: usage ?? null, quota: quota ?? null }
}
