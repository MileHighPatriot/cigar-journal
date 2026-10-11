import { useSyncExternalStore } from 'react'
import { nowIso } from '../data/repository'
import { getRepo, onSaved, reloadFromDisk, setMeta, whenSaved } from '../data/store'
import { type SyncResult, syncOnce } from './engine'
import { getClient, SupabaseRemote, syncConfigured } from './supabase'

export interface SyncState {
  /** "off": not set up in this build. "out": set up, nobody signed in. */
  status: 'off' | 'out' | 'idle' | 'syncing' | 'error'
  email: string | null
  lastAt: string | null
  message: string | null
}

let state: SyncState = {
  status: syncConfigured ? 'out' : 'off',
  email: null,
  lastAt: null,
  message: null,
}
const listeners = new Set<() => void>()

function set(next: Partial<SyncState>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

export function useSync(): SyncState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}

function plain(error: unknown): string {
  const text =
    error instanceof Error
      ? error.message
      : String((error as { message?: string })?.message ?? error)
  if (!navigator.onLine || /fetch|network|load failed/i.test(text)) {
    return 'Could not reach the sync service. Your entries are safe here and will sync later.'
  }
  if (/invalid login credentials/i.test(text)) return 'That email and password do not match.'
  if (/already registered/i.test(text)) return 'That email already has an account. Use Sign in.'
  if (/password/i.test(text) && /6|short|weak/i.test(text))
    return 'Use a password of at least 6 characters.'
  return text
}

let running: Promise<SyncResult | null> | null = null
let again = false

/** Runs one round. If a round is already going, another is queued right behind it. */
export function syncNow(): Promise<SyncResult | null> {
  if (state.status === 'off' || state.status === 'out') return Promise.resolve(null)
  if (running) {
    again = true
    return running
  }
  running = (async () => {
    set({ status: 'syncing', message: null })
    try {
      // Anything still on its way to disk goes along too.
      await whenSaved()
      const supabase = await getClient(getRepo())
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) {
        set({ status: 'out', email: null })
        return null
      }
      const result = await syncOnce(getRepo(), new SupabaseRemote(supabase, user.id))
      if (result.pulled > 0 || result.photosDown > 0) await reloadFromDisk()
      const lastAt = nowIso()
      await setMeta('syncLastAt', lastAt)
      set({ status: 'idle', lastAt, message: null })
      return result
    } catch (error) {
      set({ status: 'error', message: plain(error) })
      return null
    } finally {
      running = null
      if (again) {
        again = false
        void syncNow()
      }
    }
  })()
  return running
}

async function signedIn(email: string | null | undefined) {
  set({ status: 'idle', email: email ?? null, message: null })
  await syncNow()
}

export async function signIn(email: string, password: string): Promise<void> {
  set({ message: null })
  const supabase = await getClient(getRepo())
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    set({ message: plain(error) })
    return
  }
  await signedIn(data.user?.email)
}

export async function createAccount(email: string, password: string): Promise<void> {
  set({ message: null })
  const supabase = await getClient(getRepo())
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    set({ message: plain(error) })
    return
  }
  if (!data.session) {
    set({ message: 'Check your email for a link to confirm the account, then sign in here.' })
    return
  }
  await signedIn(data.user?.email)
}

/** Stops syncing on this device. Everything already here stays here. */
export async function signOut(): Promise<void> {
  const supabase = await getClient(getRepo())
  await supabase.auth.signOut()
  set({ status: 'out', email: null, message: null })
}

let started = false
let debounce: ReturnType<typeof setTimeout> | undefined

/** Call once after the journal has loaded. Sync then looks after itself. */
export async function startSync(): Promise<void> {
  if (!syncConfigured || started) return
  started = true
  try {
    const repo = getRepo()
    set({ lastAt: (await repo.getMeta('syncLastAt')) ?? null })
    const supabase = await getClient(repo)
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) set({ status: 'idle', email: data.session.user.email ?? null })
  } catch (error) {
    set({ message: plain(error) })
  }

  // After any save, wait a few quiet seconds and send it.
  onSaved(() => {
    clearTimeout(debounce)
    debounce = setTimeout(() => void syncNow(), 4000)
  })
  window.addEventListener('online', () => void syncNow())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncNow()
  })
  // While the app is open, look for changes from the other device every few minutes.
  setInterval(() => {
    if (document.visibilityState === 'visible' && navigator.onLine) void syncNow()
  }, 3 * 60_000)
  void syncNow()
}
