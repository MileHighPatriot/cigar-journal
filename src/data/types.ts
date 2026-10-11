export type Iso = string

export interface SyncFields {
  id: string
  createdAt: Iso
  updatedAt: Iso
  deletedAt: Iso | null
}

/** 1 Mild, 2 Mild-Medium, 3 Medium, 4 Medium-Full, 5 Full */
export type Level = 1 | 2 | 3 | 4 | 5
export type PriceTier = 1 | 2 | 3
export type Shape = 'parejo' | 'box-pressed' | 'figurado'

export interface Cigar extends SyncFields {
  brand: string
  line: string
  vitola: string | null
  lengthIn: number | null
  ringGauge: number | null
  shape: Shape | null
  wrapperType: string | null
  wrapperOrigin: string | null
  binder: string | null
  filler: string | null
  country: string | null
  factory: string | null
  strength: Level | null
  priceTier: PriceTier | null
  notes: string
  confirmed: boolean
  source: 'seed' | 'manual'
  sheetFlavors: string[]
  sheetPairings: string[]
  otherWrapperVersions: string | null
  similarCigars: string | null
}

export type CutType = 'straight' | 'v-cut' | 'punch' | 'other'
export type LightMethod = 'torch' | 'soft flame' | 'match' | 'cedar spill' | 'other'
export type Issue =
  | 'tight draw'
  | 'loose draw'
  | 'canoe'
  | 'tunneling'
  | 'run'
  | 'relight'
  | 'touch-up'

export interface Prelight {
  wrapperNotes: string
  footAroma: string
  coldDraw: string
  cutType: CutType | null
  lightMethod: LightMethod | null
}

export interface Third {
  tags: string[]
  strength: Level | null
  body: Level | null
  retrohale: string
  note: string
  issues: Issue[]
}

export type ThirdKey = 'first' | 'second' | 'final'

export type RatingKey = 'appearance' | 'smoking' | 'flavor' | 'overall'
export type Ratings = Record<RatingKey, number | null>

export type PairingType =
  | 'coffee'
  | 'espresso'
  | 'tea'
  | 'bourbon'
  | 'rye'
  | 'scotch'
  | 'rum'
  | 'tequila'
  | 'cognac'
  | 'beer'
  | 'wine'
  | 'port'
  | 'soda'
  | 'water'
  | 'other'

export type Setting = 'lounge' | 'home' | 'patio' | 'other'
export type BuyAgain = 'no' | 'single' | 'few' | 'box'

export interface Smoke extends SyncFields {
  status: 'draft' | 'complete'
  mode: 'quick' | 'full'
  draftStep: string | null
  cigarId: string
  lotId: string | null
  pricePaid: number | null
  smokedAt: Iso
  timerStartedAt: Iso | null
  timerStoppedAt: Iso | null
  durationMin: number | null
  prelight: Prelight
  thirds: Record<ThirdKey, Third>
  draw: 'tight' | 'ideal' | 'loose' | null
  burn: 'even' | 'wavy' | 'uneven' | null
  ashFirmness: 'firm' | 'flaky' | null
  ashColor: 'light' | 'dark' | null
  smokeVolume: 'light' | 'medium' | 'full' | null
  relights: number
  touchUps: number
  strength: Level | null
  body: Level | null
  quickTags: string[]
  pairingType: PairingType | null
  pairingName: string
  setting: Setting
  settingOther: string
  company: string
  environment: 'indoor' | 'outdoor' | null
  conditions: string
  mood: string
  ratings: Ratings
  score: number | null
  rubricVersion: 1
  wouldBuyAgain: BuyAgain | null
  summary: string
}

export interface Lot extends SyncFields {
  cigarId: string
  quantityPurchased: number
  quantityRemoved: number
  purchaseDate: string
  priceEach: number | null
  boughtAt: string
  boxDate: string | null
  boxCode: string
  restUntil: string | null
  notes: string
}

export interface WishlistItem extends SyncFields {
  cigarId: string
  why: string
  heardFrom: string
  status: 'open' | 'bought'
  boughtLotId: string | null
}

export interface CustomTag extends SyncFields {
  label: string
  family: string
}

export type PhotoKind = 'band' | 'stick' | 'wrapper' | 'foot' | 'ash' | 'setting' | 'box'

export interface Photo extends SyncFields {
  smokeId: string
  kind: PhotoKind
  width: number
  height: number
  byteSize: number
  order: number
}

export interface PhotoBytes {
  id: string
  mime: string
  bytes: ArrayBuffer
}

export interface RecordMap {
  cigars: Cigar
  smokes: Smoke
  lots: Lot
  wishlist: WishlistItem
  customTags: CustomTag
  photos: Photo
}

export type StoreName = keyof RecordMap

export const STORE_NAMES: StoreName[] = [
  'cigars',
  'smokes',
  'lots',
  'wishlist',
  'customTags',
  'photos',
]

/** Device-only settings. Never exported or synced. */
export interface Meta {
  seedVersion: number
  lastExportAt: Iso
  backupBannerSnoozedUntil: Iso
  persistResult: boolean
  installHintDismissed: boolean
  lastLogMode: 'quick' | 'full'
  deviceId: string
}
