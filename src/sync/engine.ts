import { mergeRecords } from '../data/merge'
import type { RecordBatch, Repository } from '../data/repository'
import { type Cigar, STORE_NAMES, type StoreName, type SyncFields } from '../data/types'
import type { OutgoingRow, Remote } from './remote'

export interface SyncResult {
  pulled: number
  pushed: number
  photosUp: number
  photosDown: number
}

const PUSH_CHUNK = 200
/** Ask again for the last minute each time, in case two devices wrote at the same moment. */
const PULL_OVERLAP_MS = 60_000

/** Seeded cigars nobody has touched ship with the app on every device, so they are never sent. */
function worthSending(store: StoreName, record: SyncFields): boolean {
  if (store !== 'cigars') return true
  const cigar = record as Cigar
  return cigar.source === 'manual' || cigar.updatedAt !== cigar.createdAt
}

/**
 * One round of sync: take what the server has that is newer, send what this device has
 * that is newer, then move photos. It uses the same "newer updatedAt wins" rule as
 * backup import, and it is safe to run again at any time.
 */
export async function syncOnce(
  repo: Repository,
  remote: Remote,
  now: () => string = () => new Date().toISOString(),
): Promise<SyncResult> {
  const result: SyncResult = { pulled: 0, pushed: 0, photosUp: 0, photosDown: 0 }

  // 1. Pull.
  const cursor = (await repo.getMeta('syncPulledAt')) ?? null
  const since = cursor ? new Date(Date.parse(cursor) - PULL_OVERLAP_MS).toISOString() : null
  const incoming = await remote.pull(since)
  if (incoming.length > 0) {
    const batch: RecordBatch = {}
    for (const store of STORE_NAMES) {
      const rows = incoming.filter((row) => row.store === store).map((row) => row.data)
      if (rows.length === 0) continue
      const local = await repo.getAll(store)
      // biome-ignore lint/suspicious/noExplicitAny: record type is paired with the store name
      const merged = mergeRecords(local as any[], rows as any[])
      // biome-ignore lint/suspicious/noExplicitAny: record type is paired with the store name
      ;(batch as any)[store] = merged.toWrite
      result.pulled += merged.toWrite.length
    }
    await repo.putMany(batch)
    const newest = incoming.reduce((max, row) => (row.serverAt > max ? row.serverAt : max), '')
    if (!cursor || newest > cursor) await repo.setMeta('syncPulledAt', newest)
  }

  // 2. Push everything changed on this device since the last push.
  const pushStarted = now()
  const lastPush = (await repo.getMeta('syncPushedAt')) ?? ''
  const outgoing: OutgoingRow[] = []
  for (const store of STORE_NAMES) {
    for (const record of await repo.changedSince(store, lastPush)) {
      if (!worthSending(store, record)) continue
      outgoing.push({
        store,
        id: record.id,
        updatedAt: record.updatedAt,
        deleted: record.deletedAt !== null,
        data: record,
      })
    }
  }
  for (let start = 0; start < outgoing.length; start += PUSH_CHUNK) {
    await remote.push(outgoing.slice(start, start + PUSH_CHUNK))
  }
  result.pushed = outgoing.length
  // One millisecond back: a change stamped in the same millisecond the push began must
  // not slip through. Sending a record twice is harmless; missing one is not.
  await repo.setMeta('syncPushedAt', new Date(Date.parse(pushStarted) - 1).toISOString())

  // 3. Photos. Image bytes never change, so each one moves at most once each way.
  const uploaded = new Set((await repo.getMeta('syncUploadedPhotos')) ?? [])
  const photos = await repo.getAll('photos')
  const gone = photos.filter((photo) => photo.deletedAt && uploaded.has(photo.id))
  if (gone.length > 0) {
    await remote.removePhotos(gone.map((photo) => photo.id))
    for (const photo of gone) uploaded.delete(photo.id)
  }
  for (const photo of photos) {
    if (photo.deletedAt) continue
    const here = await repo.hasPhotoBytes(photo.id)
    if (here && !uploaded.has(photo.id)) {
      const [full, thumb] = await Promise.all([
        repo.getPhotoBytes('full', photo.id),
        repo.getPhotoBytes('thumb', photo.id),
      ])
      if (full && thumb) {
        await remote.uploadPhoto(photo.id, full.bytes, thumb.bytes)
        uploaded.add(photo.id)
        result.photosUp += 1
      }
    } else if (!here) {
      const bytes = await remote.downloadPhoto(photo.id)
      if (bytes) {
        await repo.putPhotoBytes(
          { id: photo.id, mime: 'image/jpeg', bytes: bytes.full },
          { id: photo.id, mime: 'image/jpeg', bytes: bytes.thumb },
        )
        // It came from the server, so it never needs uploading from here.
        uploaded.add(photo.id)
        result.photosDown += 1
      }
    }
  }
  await repo.setMeta('syncUploadedPhotos', [...uploaded])
  return result
}
