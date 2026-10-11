import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { backupFileName, buildBackup } from '../src/backup/exportBackup'
import { applyBackup, BackupError, inspectBackup, summaryText } from '../src/backup/importBackup'
import { newCigar, newLot, newPhoto, newSmoke } from '../src/data/factories'
import { IdbRepository } from '../src/data/repository'
import type { WishlistItem } from '../src/data/types'

let n = 0
const freshRepo = () => IdbRepository.open(`backup-test-${++n}`)

const bytes = (length: number, seed: number) =>
  new Uint8Array(length).map((_, index) => (index * 31 + seed) & 255).buffer

/** 3 smokes (one with 2 photos), 1 humidor lot, 1 wishlist item. */
async function fill(repo: IdbRepository) {
  const cigar = newCigar({
    brand: 'Padron',
    line: '1964 Anniversary',
    notes: 'A "favorite", so far',
  })
  const lot = newLot(cigar.id, { quantityPurchased: 5, priceEach: 18.5, boxCode: 'OCT 25' })
  const wish: WishlistItem = {
    id: crypto.randomUUID(),
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    deletedAt: null,
    cigarId: cigar.id,
    why: 'A guest swore by it',
    heardFrom: 'The lounge',
    status: 'open',
    boughtLotId: null,
  }
  const detailed = newSmoke(cigar.id, {
    status: 'complete',
    mode: 'full',
    lotId: lot.id,
    vitola: 'Toro',
    lengthIn: 6,
    ringGauge: 52,
    durationMin: 74,
    ratings: { appearance: 8, smoking: 7, flavor: 9, overall: 8.5 },
    score: 90.875,
    quickTags: ['cedar', 'cocoa'],
    pairingType: 'bourbon',
    pairingName: 'Eagle Rare',
    summary: 'Line one\nLine two, with a comma',
    wouldBuyAgain: 'box',
  })
  detailed.thirds.second.tags = ['espresso']
  detailed.thirds.second.note = 'Opened up'
  const second = newSmoke(cigar.id, { status: 'complete', pricePaid: 14 })
  const third = newSmoke(cigar.id, { status: 'draft', draftStep: 'scores' })
  const photoA = newPhoto(detailed.id, 'band', { width: 1600, height: 1200, byteSize: 5000 }, 0)
  const photoB = newPhoto(detailed.id, 'stick', { width: 1200, height: 1600, byteSize: 7000 }, 1)
  await repo.putMany({
    cigars: [cigar],
    lots: [lot],
    wishlist: [wish],
    smokes: [detailed, second, third],
    photos: [photoA, photoB],
  })
  await repo.putPhotoBytes(
    { id: photoA.id, mime: 'image/jpeg', bytes: bytes(5000, 1) },
    { id: photoA.id, mime: 'image/jpeg', bytes: bytes(900, 2) },
  )
  await repo.putPhotoBytes(
    { id: photoB.id, mime: 'image/jpeg', bytes: bytes(7000, 3) },
    { id: photoB.id, mime: 'image/jpeg', bytes: bytes(1100, 4) },
  )
  return { cigar, lot, wish, detailed, second, third, photoA, photoB }
}

function same(a: ArrayBuffer | undefined, b: ArrayBuffer): boolean {
  if (!a || a.byteLength !== b.byteLength) return false
  const left = new Uint8Array(a)
  const right = new Uint8Array(b)
  return left.every((byte, index) => byte === right[index])
}

describe('backup round trip', () => {
  it('export, clear everything, import: counts, one whole smoke, and both photos match', async () => {
    const repo = await freshRepo()
    const made = await fill(repo)
    const { blob, manifest } = await buildBackup(repo)
    expect(manifest.counts).toMatchObject({
      smokes: 3,
      lots: 1,
      wishlist: 1,
      photos: 2,
      photoFiles: 2,
    })

    await repo.clearAll()
    expect(await repo.getAll('smokes')).toHaveLength(0)
    expect(await repo.hasPhotoBytes(made.photoA.id)).toBe(false)

    const contents = await inspectBackup(blob)
    const summary = await applyBackup(repo, blob, contents, 'merge')

    expect(summary).toEqual({ added: 8, updated: 0, unchanged: 0, photosAdded: 2 })
    expect(await repo.getAll('smokes')).toHaveLength(3)
    expect(await repo.getAll('lots')).toHaveLength(1)
    expect(await repo.getAll('wishlist')).toHaveLength(1)
    expect(await repo.getAll('photos')).toHaveLength(2)
    // Every field of one smoke.
    const back = (await repo.getAll('smokes')).find((smoke) => smoke.id === made.detailed.id)
    expect(back).toEqual(made.detailed)
    // Both photos, byte for byte, full size and thumbnail.
    expect(same((await repo.getPhotoBytes('full', made.photoA.id))?.bytes, bytes(5000, 1))).toBe(
      true,
    )
    expect(same((await repo.getPhotoBytes('thumb', made.photoA.id))?.bytes, bytes(900, 2))).toBe(
      true,
    )
    expect(same((await repo.getPhotoBytes('full', made.photoB.id))?.bytes, bytes(7000, 3))).toBe(
      true,
    )
    expect(same((await repo.getPhotoBytes('thumb', made.photoB.id))?.bytes, bytes(1100, 4))).toBe(
      true,
    )
  })

  it('importing the same backup twice changes nothing', async () => {
    const repo = await freshRepo()
    await fill(repo)
    const { blob } = await buildBackup(repo)
    const summary = await applyBackup(repo, blob, await inspectBackup(blob), 'merge')
    expect(summary).toEqual({ added: 0, updated: 0, unchanged: 8, photosAdded: 0 })
  })
})

describe('merging a backup from the other device', () => {
  it('takes newer records, keeps newer local ones, and carries deletes over', async () => {
    const phone = await freshRepo()
    const made = await fill(phone)
    const first = await buildBackup(phone)

    const laptop = await freshRepo()
    await applyBackup(laptop, first.blob, await inspectBackup(first.blob), 'merge')

    // On the phone: edit one smoke, delete another along with a photo.
    await phone.put('smokes', { ...made.second, summary: 'Edited on the phone' })
    await phone.softDelete('smokes', made.third.id)
    await phone.softDelete('photos', made.photoB.id)
    // On the laptop, later: edit the lot.
    await new Promise((resolve) => setTimeout(resolve, 5))
    await laptop.put('lots', { ...made.lot, notes: 'Edited on the laptop' })

    const second = await buildBackup(phone)
    expect(second.manifest.counts.photoFiles).toBe(1)
    const summary = await applyBackup(
      laptop,
      second.blob,
      await inspectBackup(second.blob),
      'merge',
    )

    expect(summary.updated).toBe(3)
    const smokes = await laptop.getAll('smokes')
    expect(smokes.find((s) => s.id === made.second.id)?.summary).toBe('Edited on the phone')
    expect(smokes.find((s) => s.id === made.third.id)?.deletedAt).not.toBeNull()
    expect(
      (await laptop.getAll('photos')).find((p) => p.id === made.photoB.id)?.deletedAt,
    ).not.toBeNull()
    // The laptop's newer edit survives.
    expect((await laptop.getAll('lots'))[0]?.notes).toBe('Edited on the laptop')
  })
})

describe('restore (replace everything)', () => {
  it('leaves only what the backup holds', async () => {
    const source = await freshRepo()
    const made = await fill(source)
    const { blob } = await buildBackup(source)

    const target = await freshRepo()
    const other = newCigar({ brand: 'Other', line: 'Only on this device' })
    await target.putMany({ cigars: [other], smokes: [newSmoke(other.id)] })
    await target.setMeta('seedVersion', 2)

    const summary = await applyBackup(target, blob, await inspectBackup(blob), 'replace')

    expect(summary.photosAdded).toBe(2)
    expect((await target.getAll('cigars')).map((c) => c.id)).toEqual([made.cigar.id])
    expect(await target.getAll('smokes')).toHaveLength(3)
    // Device settings are kept.
    expect(await target.getMeta('seedVersion')).toBe(2)
  })

  it('rejects a bad file before touching anything', async () => {
    const repo = await freshRepo()
    await fill(repo)
    const { blob } = await buildBackup(repo)

    const garbage = new Blob([new Uint8Array(5000).fill(7)])
    await expect(inspectBackup(garbage)).rejects.toBeInstanceOf(BackupError)
    const cutShort = blob.slice(0, Math.floor(blob.size * 0.6))
    await expect(inspectBackup(cutShort)).rejects.toBeInstanceOf(BackupError)

    expect(await repo.getAll('smokes')).toHaveLength(3)
    expect(await repo.getAll('photos')).toHaveLength(2)
  })
})

describe('backup helpers', () => {
  it('names the file by date and time', () => {
    expect(backupFileName(new Date(2026, 9, 10, 21, 5))).toBe(
      'cigar-journal-2026-10-10-2105.cigarbak',
    )
  })

  it('sums up an import in plain words', () => {
    expect(summaryText({ added: 12, updated: 3, unchanged: 240, photosAdded: 9 })).toBe(
      'Added 12, updated 3, unchanged 240, photos added 9.',
    )
  })
})
