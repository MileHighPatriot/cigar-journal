// Dev only. Makes fake smokes for screenshots and the 500-entry speed check.
// Every fake record id starts with "fake-" so it can be removed exactly.
import { newLot, newPhoto, newSmoke } from '../data/factories'
import { IdbRepository } from '../data/repository'
import { getRepo, getState, reloadFromDisk } from '../data/store'
import type { Cigar, Lot, Photo, PhotoKind, Smoke } from '../data/types'
import { computeScore } from '../domain/scoring'
import { TAG_FAMILIES } from '../domain/tags'
import { processPhoto } from '../photos/pipeline'

const FAKE = 'fake-'
const fakeId = () => `${FAKE}${crypto.randomUUID()}`

// Small seeded generator so a run looks the same every time.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SIZES: [string, number, number][] = [
  ['Robusto', 5, 50],
  ['Toro', 6, 52],
  ['Churchill', 7, 48],
  ['Corona', 5.5, 42],
  ['Torpedo', 6.125, 52],
  ['Gordo', 6, 60],
]

const NOTES = [
  'Burned razor sharp. Would reach for it again.',
  'Opened peppery, then settled into cream and cedar.',
  'Needed two touch-ups in the final third.',
  'Great with coffee on a slow afternoon.',
  'Tight draw at first, opened up after an inch.',
  '',
  '',
]

const PAIRINGS: [Smoke['pairingType'], string][] = [
  ['bourbon', 'Eagle Rare'],
  ['coffee', 'Black'],
  ['espresso', ''],
  ['rum', 'Diplomatico'],
  ['rye', 'Sazerac'],
  [null, ''],
]

/** Plain warm-toned placeholder, clearly labeled. Not a stock photo. */
async function placeholderPhoto(random: () => number, label: string): Promise<Blob> {
  const portrait = random() > 0.5
  const canvas = document.createElement('canvas')
  canvas.width = portrait ? 900 : 1200
  canvas.height = portrait ? 1200 : 900
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No canvas')
  const hue = 18 + random() * 22
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, `hsl(${hue} 45% ${20 + random() * 10}%)`)
  gradient.addColorStop(1, `hsl(${hue + 8} 55% ${8 + random() * 8}%)`)
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = `hsl(${hue + 6} 50% ${34 + random() * 12}%)`
  context.fillRect(0, canvas.height * (0.38 + random() * 0.1), canvas.width, canvas.height * 0.2)
  context.fillStyle = 'hsl(38 48% 59%)'
  context.fillRect(
    canvas.width * 0.42,
    canvas.height * 0.36,
    canvas.width * 0.1,
    canvas.height * 0.26,
  )
  context.fillStyle = 'hsl(36 40% 80% / 0.7)'
  context.font = '28px sans-serif'
  context.fillText(`Sample ${label} photo`, 32, canvas.height - 36)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No blob'))),
      'image/jpeg',
      0.9,
    ),
  )
}

function pick<T>(random: () => number, list: readonly T[]): T {
  return list[Math.floor(random() * list.length)] as T
}

function halfSteps(random: () => number, center: number): number {
  const value = center + (random() + random() - 1) * 1.6
  return Math.min(10, Math.max(1, Math.round(value * 2) / 2))
}

export async function addFakeSmokes(count: number, withPhotos: number): Promise<void> {
  const repo = getRepo()
  const random = mulberry32(5280)
  const seedCigars = [...getState().cigars.values()].filter((c) => !c.deletedAt && c.line)
  const words = TAG_FAMILIES.flatMap((family) => family.words)

  // A handful of seeded lines, so the same cigars come up more than once.
  const cigars: Cigar[] = Array.from({ length: 18 }, () => pick(random, seedCigars))

  const today = new Date()
  const daysAgo = (days: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() - days)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const lots: Lot[] = [
    newLot(cigars[0]?.id ?? '', {
      id: fakeId(),
      quantityPurchased: 5,
      priceEach: 11,
      purchaseDate: daysAgo(64),
    }),
    newLot(cigars[1]?.id ?? '', {
      id: fakeId(),
      quantityPurchased: 10,
      priceEach: 14.5,
      purchaseDate: daysAgo(20),
      boxCode: 'MAY 25',
    }),
    newLot(cigars[2]?.id ?? '', {
      id: fakeId(),
      quantityPurchased: 24,
      priceEach: 9,
      purchaseDate: daysAgo(12),
      restUntil: daysAgo(-48),
    }),
    newLot(cigars[3]?.id ?? '', {
      id: fakeId(),
      quantityPurchased: 2,
      priceEach: 22,
      purchaseDate: daysAgo(5),
      restUntil: daysAgo(-9),
    }),
  ]

  const smokes: Smoke[] = []
  const photos: Photo[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const fromLot = i === 1 || i === 4 ? cigars[0] : i === 2 ? cigars[1] : undefined
    const cigar = fromLot ?? pick(random, cigars)
    const [vitola, lengthIn, ringGauge] = pick(random, SIZES)
    const quality = 6.2 + random() * 2.8
    const ratings = {
      appearance: halfSteps(random, quality),
      smoking: halfSteps(random, quality),
      flavor: halfSteps(random, quality),
      overall: halfSteps(random, quality),
    }
    const tagCount = 1 + Math.floor(random() * 3)
    const tags = [...new Set(Array.from({ length: tagCount }, () => pick(random, words)))]
    const [pairingType, pairingName] = pick(random, PAIRINGS)
    const smokedAt = new Date(now - i * 86_400_000 * (0.6 + random())).toISOString()
    smokes.push(
      newSmoke(cigar.id, {
        id: fakeId(),
        status: 'complete',
        lotId: i === 1 || i === 4 ? (lots[0]?.id ?? null) : i === 2 ? (lots[1]?.id ?? null) : null,
        vitola,
        lengthIn,
        ringGauge,
        smokedAt,
        createdAt: smokedAt,
        ratings,
        score: computeScore(ratings)?.exact ?? null,
        quickTags: tags,
        durationMin: 40 + Math.floor(random() * 60),
        pricePaid: fromLot || random() < 0.35 ? null : 8 + Math.floor(random() * 19),
        summary: pick(random, NOTES),
        pairingType,
        pairingName,
      }),
    )
  }

  const kinds: PhotoKind[] = ['band', 'ash', 'foot', 'setting']
  for (const smoke of smokes.slice(0, withPhotos)) {
    const howMany = random() > 0.6 ? 2 : 1
    for (let order = 0; order < howMany; order++) {
      const kind = order === 0 ? 'band' : pick(random, kinds)
      const processed = await processPhoto(await placeholderPhoto(random, kind))
      const photo = {
        ...newPhoto(
          smoke.id,
          kind,
          { width: processed.width, height: processed.height, byteSize: processed.full.byteLength },
          order,
        ),
        id: fakeId(),
      }
      await repo.putPhotoBytes(
        { id: photo.id, mime: 'image/jpeg', bytes: processed.full },
        { id: photo.id, mime: 'image/jpeg', bytes: processed.thumb },
      )
      photos.push(photo)
    }
  }

  await repo.putMany({ lots, smokes, photos })
  await reloadFromDisk()
}

export async function removeFakeData(): Promise<number> {
  const repo = getRepo()
  if (!(repo instanceof IdbRepository)) return 0
  const removed = await repo.hardDeleteByPrefix(FAKE)
  await reloadFromDisk()
  return removed
}
