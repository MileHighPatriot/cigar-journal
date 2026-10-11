import { useEffect, useState, useSyncExternalStore } from 'react'
import { computeScore } from '../domain/scoring'
import { processPhoto } from '../photos/pipeline'
import { requestPersist } from '../pwa/storage'
import { newPhoto, newSmoke } from './factories'
import { IdbRepository, nowIso, type RecordBatch, type Repository } from './repository'
import { type SeedCatalog, seedCatalog } from './seed'
import type {
  Cigar,
  CustomTag,
  Lot,
  Meta,
  Photo,
  PhotoKind,
  Prelight,
  RecordMap,
  Smoke,
  StoreName,
  Third,
  ThirdKey,
  WishlistItem,
} from './types'
import { STORE_NAMES } from './types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface State {
  ready: boolean
  loadError: string | null
  cigars: Map<string, Cigar>
  smokes: Map<string, Smoke>
  lots: Map<string, Lot>
  wishlist: Map<string, WishlistItem>
  customTags: Map<string, CustomTag>
  photos: Map<string, Photo>
  save: { status: SaveStatus; message: string | null }
}

let state: State = {
  ready: false,
  loadError: null,
  cigars: new Map(),
  smokes: new Map(),
  lots: new Map(),
  wishlist: new Map(),
  customTags: new Map(),
  photos: new Map(),
  save: { status: 'idle', message: null },
}

let repo: Repository | null = null
const listeners = new Set<() => void>()

function setState(next: Partial<State>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState(): State {
  return state
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, getState)
}

export function getRepo(): Repository {
  if (!repo) throw new Error('The journal is not open yet')
  return repo
}

const PHOTO_BYTES_KEEP_DAYS = 30

export async function initStore(options: { repository?: Repository } = {}) {
  try {
    repo = options.repository ?? (await IdbRepository.open())
    const { default: catalog } = await import('../seed/catalog.json')
    await seedCatalog(repo, catalog as SeedCatalog)
    await reloadFromDisk()
    setState({ ready: true })
    void purgeOldPhotoBytes()
  } catch (error) {
    setState({ loadError: describeError(error) })
  }
}

/** Re-reads every record store. Used at startup and after an import or restore. */
export async function reloadFromDisk() {
  const r = getRepo()
  const [cigars, smokes, lots, wishlist, customTags, photos] = await Promise.all([
    r.getAll('cigars'),
    r.getAll('smokes'),
    r.getAll('lots'),
    r.getAll('wishlist'),
    r.getAll('customTags'),
    r.getAll('photos'),
  ])
  const toMap = <T extends { id: string }>(rows: T[]) => new Map(rows.map((row) => [row.id, row]))
  setState({
    cigars: toMap(cigars),
    // Smokes saved before the size fields existed get them as empty.
    smokes: toMap(
      smokes.map((smoke) => ({ ...{ vitola: null, lengthIn: null, ringGauge: null }, ...smoke })),
    ),
    lots: toMap(lots),
    wishlist: toMap(wishlist),
    customTags: toMap(customTags),
    photos: toMap(photos),
  })
}

async function purgeOldPhotoBytes() {
  const cutoff = new Date(Date.now() - PHOTO_BYTES_KEEP_DAYS * 86_400_000).toISOString()
  const old = [...state.photos.values()].filter((p) => p.deletedAt && p.deletedAt < cutoff)
  if (old.length > 0) await getRepo().deletePhotoBytes(old.map((p) => p.id))
}

export function describeError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return 'Storage is full. Export a backup, then free up space.'
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong while saving.'
}

// Writes go to memory and to disk in the same tick as the tap. The browser runs
// transactions on the same stores in the order they were started, so order is kept
// without waiting on the one before. "Saved" shows only after the last one completes.
let queue: Promise<void> = Promise.resolve()
let pending = 0
let firstSaveDone = false
const savedListeners = new Set<() => void>()

/** Tells sync that something was just saved on this device. */
export function onSaved(listener: () => void): () => void {
  savedListeners.add(listener)
  return () => savedListeners.delete(listener)
}
// True once any write in the current run of saves has failed, so a later success in the
// same run does not hide the error.
let runFailed = false

function persist(batch: RecordBatch): Promise<void> {
  if (pending === 0) runFailed = false
  pending += 1
  setState({ save: { status: 'saving', message: null } })
  // Started right now, not after the previous write settles: a reload or a closed app
  // a moment after a tap must not be able to lose it.
  let write: Promise<void>
  try {
    write = getRepo().putMany(batch)
  } catch (error) {
    write = Promise.reject(error)
  }
  const settled = write.then(
    () => {
      pending -= 1
      if (pending === 0 && !runFailed) {
        setState({ save: { status: 'saved', message: null } })
      }
      if (!firstSaveDone) {
        firstSaveDone = true
        void requestPersist(getRepo())
      }
      for (const listener of savedListeners) listener()
    },
    (error) => {
      pending -= 1
      runFailed = true
      setState({ save: { status: 'error', message: describeError(error) } })
    },
  )
  queue = Promise.all([queue, settled]).then(() => undefined)
  return settled
}

/** Resolves once everything queued so far is on disk. */
export function whenSaved(): Promise<void> {
  return queue
}

function withRecords(batch: RecordBatch): Partial<State> {
  const next: Partial<State> = {}
  for (const name of STORE_NAMES) {
    const records = batch[name]
    if (!records?.length) continue
    const map = new Map(state[name] as Map<string, RecordMap[typeof name]>)
    for (const record of records)
      map.set(record.id, record)
      // biome-ignore lint/suspicious/noExplicitAny: map type is paired with the store name
    ;(next as any)[name] = map
  }
  return next
}

/** Stamps updatedAt, updates memory, and queues the disk write. */
export function saveBatch(batch: RecordBatch): Promise<void> {
  const now = nowIso()
  const stamped: RecordBatch = {}
  for (const name of STORE_NAMES) {
    const records = batch[name]
    if (!records?.length) continue
    // biome-ignore lint/suspicious/noExplicitAny: record type is paired with the store name
    ;(stamped as any)[name] = records.map((record) => ({ ...record, updatedAt: now }))
  }
  setState(withRecords(stamped))
  return persist(stamped)
}

export function saveRecord<S extends StoreName>(store: S, record: RecordMap[S]): Promise<void> {
  return saveBatch({ [store]: [record] } as RecordBatch)
}

export function patchSmoke(id: string, patch: Partial<Smoke>): Promise<void> {
  const current = state.smokes.get(id)
  if (!current) return Promise.resolve()
  const next = { ...current, ...patch }
  if (patch.ratings) next.score = computeScore(next.ratings)?.exact ?? null
  return saveRecord('smokes', next)
}

export function softDelete<S extends StoreName>(store: S, id: string): Promise<void> {
  const current = (state[store] as Map<string, RecordMap[S]>).get(id)
  if (!current) return Promise.resolve()
  return saveRecord(store, { ...current, deletedAt: nowIso() })
}

export function restoreRecord<S extends StoreName>(store: S, id: string): Promise<void> {
  const current = (state[store] as Map<string, RecordMap[S]>).get(id)
  if (!current) return Promise.resolve()
  return saveRecord(store, { ...current, deletedAt: null })
}

/** Deletes a smoke and its photos together. Returns what Undo needs. */
export function deleteSmoke(id: string): { undo: () => Promise<void> } {
  const smoke = state.smokes.get(id)
  if (!smoke) return { undo: () => Promise.resolve() }
  const now = nowIso()
  const photos = [...state.photos.values()].filter((p) => p.smokeId === id && !p.deletedAt)
  void saveBatch({
    smokes: [{ ...smoke, deletedAt: now }],
    photos: photos.map((p) => ({ ...p, deletedAt: now })),
  })
  return {
    undo: () => {
      const latest = getState()
      const back = latest.smokes.get(id)
      if (!back) return Promise.resolve()
      return saveBatch({
        smokes: [{ ...back, deletedAt: null }],
        photos: photos.flatMap((p) => {
          const current = latest.photos.get(p.id)
          return current ? [{ ...current, deletedAt: null }] : []
        }),
      })
    },
  }
}

export function photosForSmoke(photos: Map<string, Photo>, smokeId: string): Photo[] {
  return [...photos.values()]
    .filter((p) => p.smokeId === smokeId && !p.deletedAt)
    .sort((a, b) => a.order - b.order)
}

/** Compresses on the device, stores the bytes, then the record. Text is never blocked by this. */
export async function addPhoto(smokeId: string, file: Blob, kind: PhotoKind): Promise<Photo> {
  const processed = await processPhoto(file)
  const order = photosForSmoke(state.photos, smokeId).length
  const photo = newPhoto(
    smokeId,
    kind,
    { width: processed.width, height: processed.height, byteSize: processed.full.byteLength },
    order,
  )
  await getRepo().putPhotoBytes(
    { id: photo.id, mime: 'image/jpeg', bytes: processed.full },
    { id: photo.id, mime: 'image/jpeg', bytes: processed.thumb },
  )
  await saveRecord('photos', photo)
  return photo
}

/** Where a log picks up: the quick flow's scores, or the full log's first step. */
export function logPath(smoke: Pick<Smoke, 'id' | 'draftStep'>): string {
  return `/log/${smoke.id}/${smoke.draftStep ?? 'scores'}`
}

/** Starts a log for a cigar from outside the picker, in the mode used last time. Returns its path. */
export async function startLog(cigarId: string, lotId: string | null = null): Promise<string> {
  const mode = (await getRepo().getMeta('lastLogMode')) ?? 'quick'
  const draftStep = mode === 'full' ? 'full/prelight' : 'scores'
  const smoke = newSmoke(cigarId, { lotId, mode, draftStep })
  void saveRecord('smokes', smoke)
  return logPath(smoke)
}

// Nested parts of a smoke are patched from the latest saved copy, so two quick edits
// to different fields never overwrite each other.
export function patchPrelight(id: string, patch: Partial<Prelight>): Promise<void> {
  const current = state.smokes.get(id)
  if (!current) return Promise.resolve()
  return patchSmoke(id, { prelight: { ...current.prelight, ...patch } })
}

export function patchThird(id: string, third: ThirdKey, patch: Partial<Third>): Promise<void> {
  const current = state.smokes.get(id)
  if (!current) return Promise.resolve()
  return patchSmoke(id, {
    thirds: { ...current.thirds, [third]: { ...current.thirds[third], ...patch } },
  })
}

// Device settings (meta) are not part of the record stores, so they get their own signal.
let metaVersion = 0
const metaListeners = new Set<() => void>()

export async function setMeta<K extends keyof Meta>(key: K, value: Meta[K]): Promise<void> {
  await getRepo().setMeta(key, value)
  metaVersion += 1
  for (const listener of metaListeners) listener()
}

/** A device setting, re-read whenever any setting changes. Undefined until loaded or unset. */
export function useMeta<K extends keyof Meta>(key: K): Meta[K] | undefined {
  const [value, setValue] = useState<Meta[K] | undefined>(undefined)
  const version = useSyncExternalStore(
    (listener) => {
      metaListeners.add(listener)
      return () => metaListeners.delete(listener)
    },
    () => metaVersion,
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: version is the signal to re-read
  useEffect(() => {
    let cancelled = false
    getRepo()
      .getMeta(key)
      .then((next) => {
        if (!cancelled) setValue(next)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [key, version])
  return value
}
