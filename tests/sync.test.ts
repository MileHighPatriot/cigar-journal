import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { newCigar, newLot, newPhoto, newSmoke } from '../src/data/factories'
import { IdbRepository } from '../src/data/repository'
import { syncOnce } from '../src/sync/engine'
import type { OutgoingRow, Remote, RemoteRow } from '../src/sync/remote'

/** A stand-in server that follows the same rules as the real one. */
class FakeServer implements Remote {
  rows = new Map<string, RemoteRow>()
  photos = new Map<string, { full: ArrayBuffer; thumb: ArrayBuffer }>()
  private tick = 0
  pushes = 0

  private stamp() {
    this.tick += 1
    return new Date(Date.UTC(2026, 9, 10, 12, 0, 0) + this.tick * 1000).toISOString()
  }

  async pull(since: string | null) {
    return [...this.rows.values()]
      .filter((row) => since === null || row.serverAt > since)
      .sort((a, b) => (a.serverAt < b.serverAt ? -1 : 1))
  }

  async push(rows: OutgoingRow[]) {
    this.pushes += 1
    for (const row of rows) {
      const key = `${row.store}/${row.id}`
      const existing = this.rows.get(key)
      // Newer updatedAt wins, exactly as push_records does in the database.
      if (!existing || row.updatedAt > existing.updatedAt) {
        this.rows.set(key, { ...row, serverAt: this.stamp() })
      }
    }
  }

  async uploadPhoto(id: string, full: ArrayBuffer, thumb: ArrayBuffer) {
    this.photos.set(id, { full, thumb })
  }

  async downloadPhoto(id: string) {
    return this.photos.get(id) ?? null
  }

  async removePhotos(ids: string[]) {
    for (const id of ids) this.photos.delete(id)
  }
}

let n = 0
const device = () => IdbRepository.open(`sync-test-${++n}`)
const bytes = (length: number, seed: number) =>
  new Uint8Array(length).map((_, index) => (index * 7 + seed) & 255).buffer
const pause = () => new Promise((resolve) => setTimeout(resolve, 3))

const seeded = newCigar({
  id: 'seed-1',
  brand: 'Padron',
  line: '1964 Anniversary',
  source: 'seed',
  createdAt: '2026-10-10T00:00:00.000Z',
  updatedAt: '2026-10-10T00:00:00.000Z',
})

describe('sync between a phone and a laptop', () => {
  it('carries a new smoke, its lot, and its photo across', async () => {
    const server = new FakeServer()
    const phone = await device()
    const laptop = await device()
    await phone.putMany({ cigars: [seeded] })
    await laptop.putMany({ cigars: [seeded] })

    const lot = newLot(seeded.id, { quantityPurchased: 5 })
    const smoke = newSmoke(seeded.id, { status: 'complete', lotId: lot.id, summary: 'Sharp burn' })
    const photo = newPhoto(smoke.id, 'band', { width: 1600, height: 1200, byteSize: 4000 }, 0)
    await phone.putMany({ lots: [lot], smokes: [smoke], photos: [photo] })
    await phone.putPhotoBytes(
      { id: photo.id, mime: 'image/jpeg', bytes: bytes(4000, 1) },
      { id: photo.id, mime: 'image/jpeg', bytes: bytes(600, 2) },
    )

    const up = await syncOnce(phone, server)
    expect(up).toMatchObject({ pushed: 3, photosUp: 1 })

    const down = await syncOnce(laptop, server)
    expect(down).toMatchObject({ pulled: 3, photosDown: 1 })
    expect(await laptop.getAll('smokes')).toEqual([smoke])
    expect(await laptop.getAll('lots')).toEqual([lot])
    const got = await laptop.getPhotoBytes('full', photo.id)
    expect(new Uint8Array(got?.bytes ?? new ArrayBuffer(0))).toEqual(new Uint8Array(bytes(4000, 1)))
  })

  it('never sends seeded cigars nobody has touched, but sends an edited one', async () => {
    const server = new FakeServer()
    const phone = await device()
    await phone.putMany({ cigars: [seeded] })
    expect((await syncOnce(phone, server)).pushed).toBe(0)

    await phone.put('cigars', { ...seeded, vitola: 'Exclusivo', confirmed: true })
    expect((await syncOnce(phone, server)).pushed).toBe(1)

    const laptop = await device()
    await laptop.putMany({ cigars: [seeded] })
    await syncOnce(laptop, server)
    expect((await laptop.getAll('cigars'))[0]?.vitola).toBe('Exclusivo')
  })

  it('keeps the newer edit when both devices changed the same smoke', async () => {
    const server = new FakeServer()
    const phone = await device()
    const laptop = await device()
    const smoke = newSmoke(seeded.id, { status: 'complete', summary: 'First' })
    await phone.putMany({ smokes: [smoke] })
    await syncOnce(phone, server)
    await syncOnce(laptop, server)

    await laptop.put('smokes', { ...smoke, summary: 'Edited on the laptop' })
    await pause()
    await phone.put('smokes', { ...smoke, summary: 'Edited on the phone, later' })

    await syncOnce(laptop, server)
    await syncOnce(phone, server)
    await syncOnce(laptop, server)

    expect((await phone.getAll('smokes'))[0]?.summary).toBe('Edited on the phone, later')
    expect((await laptop.getAll('smokes'))[0]?.summary).toBe('Edited on the phone, later')
  })

  it('carries a delete across and takes the photo off the server', async () => {
    const server = new FakeServer()
    const phone = await device()
    const laptop = await device()
    const smoke = newSmoke(seeded.id, { status: 'complete' })
    const photo = newPhoto(smoke.id, 'stick', { width: 10, height: 10, byteSize: 100 }, 0)
    await phone.putMany({ smokes: [smoke], photos: [photo] })
    await phone.putPhotoBytes(
      { id: photo.id, mime: 'image/jpeg', bytes: bytes(100, 3) },
      { id: photo.id, mime: 'image/jpeg', bytes: bytes(30, 4) },
    )
    await syncOnce(phone, server)
    await syncOnce(laptop, server)
    expect(server.photos.size).toBe(1)

    await pause()
    await laptop.softDelete('smokes', smoke.id)
    await laptop.softDelete('photos', photo.id)
    await syncOnce(laptop, server)
    await syncOnce(phone, server)

    expect((await phone.getAll('smokes'))[0]?.deletedAt).not.toBeNull()
    expect((await phone.getAll('photos'))[0]?.deletedAt).not.toBeNull()
    expect(server.photos.size).toBe(0)
  })

  it('does nothing the second time when nothing changed', async () => {
    const server = new FakeServer()
    const phone = await device()
    await phone.putMany({ smokes: [newSmoke(seeded.id, { status: 'complete' })] })
    await pause()
    await syncOnce(phone, server)
    await pause()
    const again = await syncOnce(phone, server)
    expect(again).toEqual({ pulled: 0, pushed: 0, photosUp: 0, photosDown: 0 })
  })

  it('picks up a photo on a later round if the other device had not uploaded it yet', async () => {
    const server = new FakeServer()
    const phone = await device()
    const laptop = await device()
    const smoke = newSmoke(seeded.id, { status: 'complete' })
    const photo = newPhoto(smoke.id, 'band', { width: 10, height: 10, byteSize: 100 }, 0)
    await phone.putMany({ smokes: [smoke], photos: [photo] })
    // The record reaches the server, but the image has not been uploaded yet.
    await server.push([
      { store: 'photos', id: photo.id, updatedAt: photo.updatedAt, deleted: false, data: photo },
    ])

    expect((await syncOnce(laptop, server)).photosDown).toBe(0)
    expect(await laptop.hasPhotoBytes(photo.id)).toBe(false)

    await server.uploadPhoto(photo.id, bytes(100, 5), bytes(30, 6))
    expect((await syncOnce(laptop, server)).photosDown).toBe(1)
    expect(await laptop.hasPhotoBytes(photo.id)).toBe(true)
  })

  it('stops cleanly when the server is unreachable and catches up afterwards', async () => {
    const server = new FakeServer()
    const phone = await device()
    const smoke = newSmoke(seeded.id, { status: 'complete' })
    await phone.putMany({ smokes: [smoke] })
    const offline: FakeServer = Object.assign(Object.create(FakeServer.prototype), server, {
      pull: async () => {
        throw new Error('offline')
      },
    })
    await expect(syncOnce(phone, offline)).rejects.toThrow('offline')
    // Nothing was marked as sent, so the next round still sends it.
    expect((await syncOnce(phone, server)).pushed).toBe(1)
  })
})
