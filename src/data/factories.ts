import { emptyRatings, RUBRIC_VERSION } from '../domain/scoring'
import { nowIso } from './repository'
import {
  CIGAR_DEFAULTS,
  type Cigar,
  type Lot,
  type Photo,
  type PhotoKind,
  type Prelight,
  type Smoke,
  type SyncFields,
  type Third,
} from './types'

function syncFields(): SyncFields {
  const now = nowIso()
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now, deletedAt: null }
}

function emptyThird(): Third {
  return {
    tags: [],
    strength: null,
    body: null,
    retrohale: '',
    retrohaleTags: [],
    note: '',
    issues: [],
  }
}

function emptyPrelight(): Prelight {
  return {
    wrapperNotes: '',
    footAroma: '',
    aromaTags: [],
    coldDraw: '',
    coldDrawTags: [],
    cutType: null,
    lightMethod: null,
    note: '',
  }
}

const ADDED_LATER = {
  vitola: null,
  lengthIn: null,
  ringGauge: null,
  constructionNote: '',
  pairingNote: '',
  scoreNote: '',
} satisfies Partial<Smoke>

/**
 * A smoke saved by an older version of the app, given the fields added since as empty values.
 * Nothing is written back until the smoke is next edited, so no database change is needed.
 */
export function withSmokeDefaults(smoke: Smoke): Smoke {
  return {
    ...ADDED_LATER,
    ...smoke,
    prelight: { ...emptyPrelight(), ...smoke.prelight },
    thirds: {
      first: { ...emptyThird(), ...smoke.thirds.first },
      second: { ...emptyThird(), ...smoke.thirds.second },
      final: { ...emptyThird(), ...smoke.thirds.final },
    },
  }
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
    ...CIGAR_DEFAULTS,
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
    vitola: null,
    lengthIn: null,
    ringGauge: null,
    timerStartedAt: null,
    timerStoppedAt: null,
    durationMin: null,
    prelight: emptyPrelight(),
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
    constructionNote: '',
    pairingNote: '',
    scoreNote: '',
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
