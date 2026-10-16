// Dev only. Makes fake smokes for screenshots and the 500-entry speed check.
// Every fake record id starts with "fake-" so it can be removed exactly.
import { newLot, newPhoto, newSmoke } from '../data/factories'
import { IdbRepository, nowIso } from '../data/repository'
import { getRepo, getState, reloadFromDisk } from '../data/store'
import type { Cigar, Lot, Photo, PhotoKind, Smoke } from '../data/types'
import { newLoungeEntry } from '../domain/lounge'
import { computeScore } from '../domain/scoring'
import { TAG_FAMILIES } from '../domain/tags'
import { processPhoto } from '../photos/pipeline'

const FAKE = 'fake-'
const fakeId = () => `${FAKE}${crypto.randomUUID()}`
/** Marks a sample lounge entry on a real catalog cigar, so removal can find it. */
const FAKE_NOTE = 'Sample lounge stick'

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

/** A drawn stand-in for one of Kohlton's photos, clearly labeled. Not a stock photo. */
async function placeholderPhoto(random: () => number, label: string): Promise<Blob> {
  const portrait = random() > 0.5
  const canvas = document.createElement('canvas')
  const w = portrait ? 900 : 1200
  const h = portrait ? 1200 : 900
  canvas.width = w
  canvas.height = h
  const c = canvas.getContext('2d')
  if (!c) throw new Error('No canvas')

  // A table top under a low light.
  const tableHue = pick(random, [205, 28, 160, 350, 215])
  const table = c.createRadialGradient(
    w * 0.42,
    h * 0.38,
    40,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.8,
  )
  table.addColorStop(0, `hsl(${tableHue} 22% 34%)`)
  table.addColorStop(0.55, `hsl(${tableHue} 26% 17%)`)
  table.addColorStop(1, `hsl(${tableHue} 30% 6%)`)
  c.fillStyle = table
  c.fillRect(0, 0, w, h)
  // Wood grain, faint.
  c.strokeStyle = 'hsl(0 0% 100% / 0.035)'
  c.lineWidth = 3
  for (let i = 0; i < 26; i++) {
    const y = (h / 26) * i + random() * 20
    c.beginPath()
    c.moveTo(0, y)
    c.bezierCurveTo(w * 0.3, y + random() * 30 - 15, w * 0.7, y + random() * 30 - 15, w, y)
    c.stroke()
  }

  // The stick, lying at a slant, with its shadow.
  const length = Math.min(w, h) * (0.62 + random() * 0.12)
  const thick = length * 0.115
  const leaf = 18 + random() * 14
  const dark = 16 + random() * 22
  c.translate(w / 2, h / 2)
  c.rotate((random() - 0.5) * 0.7)
  c.fillStyle = 'hsl(0 0% 0% / 0.4)'
  c.filter = 'blur(18px)'
  c.beginPath()
  c.roundRect(-length / 2 + 10, -thick / 2 + 22, length, thick, thick / 2)
  c.fill()
  c.filter = 'none'
  const body = c.createLinearGradient(0, -thick / 2, 0, thick / 2)
  body.addColorStop(0, `hsl(${leaf} 46% ${dark + 16}%)`)
  body.addColorStop(0.35, `hsl(${leaf} 50% ${dark + 8}%)`)
  body.addColorStop(1, `hsl(${leaf} 55% ${dark - 6}%)`)
  c.fillStyle = body
  c.beginPath()
  c.roundRect(-length / 2, -thick / 2, length, thick, [thick / 2, thick / 6, thick / 6, thick / 2])
  c.fill()
  // Leaf seams.
  c.strokeStyle = 'hsl(0 0% 0% / 0.16)'
  c.lineWidth = 2
  for (let x = -length / 2 + thick; x < length / 2 - 20; x += thick * 0.9) {
    c.beginPath()
    c.moveTo(x, -thick / 2)
    c.lineTo(x + thick * 0.45, thick / 2)
    c.stroke()
  }
  // Ash at the foot.
  const ash = c.createLinearGradient(length / 2 - thick * 0.9, 0, length / 2, 0)
  ash.addColorStop(0, 'hsl(18 80% 45%)')
  ash.addColorStop(0.18, 'hsl(30 8% 62%)')
  ash.addColorStop(1, 'hsl(30 6% 80%)')
  c.fillStyle = ash
  c.beginPath()
  c.roundRect(length / 2 - thick * 0.9, -thick / 2, thick * 0.9, thick, [
    0,
    thick / 5,
    thick / 5,
    0,
  ])
  c.fill()
  // The band.
  const bandHue = pick(random, [4, 42, 150, 215, 280, 24])
  const bandAt = -length / 2 + thick * 1.5
  const bandWide = thick * 0.95
  c.fillStyle = `hsl(${bandHue} 62% 38%)`
  c.fillRect(bandAt, -thick / 2 - 2, bandWide, thick + 4)
  c.fillStyle = 'hsl(44 70% 62%)'
  c.fillRect(bandAt, -thick / 2 - 2, bandWide * 0.12, thick + 4)
  c.fillRect(bandAt + bandWide * 0.88, -thick / 2 - 2, bandWide * 0.12, thick + 4)
  c.beginPath()
  c.ellipse(bandAt + bandWide / 2, 0, bandWide * 0.24, thick * 0.3, 0, 0, Math.PI * 2)
  c.fill()
  // A soft highlight along the top.
  c.fillStyle = 'hsl(0 0% 100% / 0.1)'
  c.beginPath()
  c.roundRect(
    -length / 2 + thick / 2,
    -thick / 2 + thick * 0.12,
    length - thick * 1.6,
    thick * 0.14,
    thick,
  )
  c.fill()
  c.setTransform(1, 0, 0, 1, 0, 0)

  c.fillStyle = 'hsl(36 40% 85% / 0.7)'
  c.font = '28px sans-serif'
  c.fillText(`Sample ${label} photo`, 32, h - 36)
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

  // A dozen lounge sticks across every strength, so the Lounge tab has every group.
  const SHELVES = ['Top shelf, left', 'Top shelf, right', 'Middle shelf', 'Bottom drawer', '']
  const lounge: Cigar[] = []
  for (const strength of [1, 2, 3, 4, 5, null] as const) {
    const fits = seedCigars.filter((c) => c.strength === strength && !c.lounge)
    for (let i = 0; i < 2 && fits.length > 0; i++) {
      const cigar = fits.splice(Math.floor(random() * fits.length), 1)[0]
      if (!cigar) break
      lounge.push({
        ...cigar,
        updatedAt: nowIso(),
        lounge: newLoungeEntry({
          price: random() < 0.3 ? null : 8 + Math.floor(random() * 20),
          shelf: pick(random, SHELVES),
          note: FAKE_NOTE,
          known: pick(random, ['new', 'new', 'learning', 'known'] as const),
        }),
      })
    }
  }

  await repo.putMany({ cigars: lounge, lots, smokes, photos })
  await reloadFromDisk()
}

export async function removeFakeData(): Promise<number> {
  const repo = getRepo()
  if (!(repo instanceof IdbRepository)) return 0
  const removed = await repo.hardDeleteByPrefix(FAKE)
  const sampled = [...getState().cigars.values()].filter((c) => c.lounge?.note === FAKE_NOTE)
  await repo.putMany({ cigars: sampled.map((c) => ({ ...c, lounge: null, updatedAt: nowIso() })) })
  await reloadFromDisk()
  return removed + sampled.length
}
