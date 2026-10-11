import { emptyRatings, RUBRIC_VERSION } from '../domain/scoring'
import { nowIso } from './repository'
import type { Cigar, Lot, Photo, PhotoKind, Smoke, SyncFields, Third } from './types'

function syncFields(): SyncFields {
  const now = nowIso()
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now, deletedAt: null }
}

function emptyThird(): Third {
  return { tags: [], strength: null, body: null, retrohale: '', note: '', issues: [] }
}

export function newCigar(fields: Partial<Cigar> = {}): Cigar {
  return {
    ...syncFields(),
    brand: '',
    line: '',
    vitola: null,
    lengthIn: null,
    ringGauge: null,
    shape: null,
    wrapperType: null,
    wrapperOrigin: null,
    binder: null,
    filler: null,
    country: null,
    factory: null,
    strength: null,
    priceTier: null,
    notes: '',
    confirmed: true,
    source: 'manual',
    sheetFlavors: [],
    sheetPairings: [],
    otherWrapperVersions: null,
    similarCigars: null,
    ...fields,
  }
}

export function newSmoke(cigarId: string, fields: Partial<Smoke> = {}): Smoke {
  return {
    ...syncFields(),
    status: 'draft',
    mode: 'quick',
    draftStep: null,
    cigarId,
    lotId: null,
    pricePaid: null,
    smokedAt: nowIso(),
    timerStartedAt: null,
    timerStoppedAt: null,
    durationMin: null,
    prelight: { wrapperNotes: '', footAroma: '', coldDraw: '', cutType: null, lightMethod: null },
    thirds: { first: emptyThird(), second: emptyThird(), final: emptyThird() },
    draw: null,
    burn: null,
    ashFirmness: null,
    ashColor: null,
    smokeVolume: null,
    relights: 0,
    touchUps: 0,
    strength: null,
    body: null,
    quickTags: [],
    pairingType: null,
    pairingName: '',
    setting: 'lounge',
    settingOther: '',
    company: '',
    environment: null,
    conditions: '',
    mood: '',
    ratings: emptyRatings(),
    score: null,
    rubricVersion: RUBRIC_VERSION,
    wouldBuyAgain: null,
    summary: '',
    ...fields,
  }
}

export function newLot(cigarId: string, fields: Partial<Lot> = {}): Lot {
  const today = new Date()
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return {
    ...syncFields(),
    cigarId,
    quantityPurchased: 1,
    quantityRemoved: 0,
    purchaseDate: date,
    priceEach: null,
    boughtAt: 'Stanley Pappas',
    boxDate: null,
    boxCode: '',
    restUntil: null,
    notes: '',
    ...fields,
  }
}

export function newPhoto(
  smokeId: string,
  kind: PhotoKind,
  size: { width: number; height: number; byteSize: number },
  order: number,
): Photo {
  return { ...syncFields(), smokeId, kind, order, ...size }
}
