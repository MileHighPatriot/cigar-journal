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
  /** The wrapper as the maker describes it, for example "Ecuadorian Habano Oscuro". */
  wrapperLeaf: string | null
  /** Body, when a source gives it apart from strength. */
  body: Level | null
  /** The regular sizes this line comes in. */
  sizes: CigarSize[]
  /** Published tasting notes. */
  flavors: string[]
  /** One or two plain sentences about the line. */
  about: string | null
  /** Year introduced. */
  released: number | null
  production: 'regular' | 'limited' | 'discontinued' | null
  /** Pages the details were checked against. */
  sources: string[]
  /** Anything worth knowing: a secret blend, sources that disagree, a rename. */
  researchNote: string
  /** True once the details were researched and then independently fact-checked. */
  checked: boolean
  /** Set while this cigar is stocked in the lounge humidor. Null when it is not. */
  lounge: LoungeEntry | null
}

export type KnownLevel = 'new' | 'learning' | 'known'

/** What Kohlton knows about a cigar the lounge stocks. Lives on the cigar record. */
export interface LoungeEntry {
  addedAt: Iso
  /** Where it sits in the humidor, in his words ("top shelf, left"). */
  shelf: string
  note: string
  known: KnownLevel
  /** When a flashcard for it was last answered. Orders the study deck. */
  studiedAt: Iso | null
}

export interface CigarSize {
  name: string
  lengthIn: number | null
  ringGauge: number | null
}

/** Fields added after the first release. Records saved before then get these when loaded. */
export const CIGAR_DEFAULTS = {
  wrapperLeaf: null,
  body: null,
  sizes: [] as CigarSize[],
  flavors: [] as string[],
  about: null,
  released: null,
  production: null,
  sources: [] as string[],
  researchNote: '',
  checked: false,
  lounge: null,
} satisfies Partial<Cigar>

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
  /** Aromas picked from the flavor list, beside the typed foot aroma. */
  aromaTags: string[]
  coldDraw: string
  coldDrawTags: string[]
  cutType: CutType | null
  lightMethod: LightMethod | null
  note: string
}

export interface Third {
  tags: string[]
  /** True once this third's taste notes were copied forward, or the third already had its own. */
  tagsSeeded: boolean
  /** Harsh, bitter, tar, sour. Kept off the taste-note row. */
  offTags: string[]
  strength: Level | null
  body: Level | null
  retrohale: string
  retrohaleTags: string[]
  note: string
  issues: Issue[]
  /** How this third drew, apart from the whole-cigar verdict on Construction. */
  draw: 'tight' | 'ideal' | 'loose' | null
  burn: 'even' | 'wavy' | 'uneven' | null
  ashFirmness: 'firm' | 'flaky' | null
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
  /** Size noted on this smoke. The cigar itself stays one entry per line. */
  vitola: string | null
  lengthIn: number | null
  ringGauge: number | null
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
  constructionNote: string
  pairingNote: string
  scoreNote: string
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
  /** Sync: the server time of the newest row pulled so far. */
  syncPulledAt: Iso
  /** Sync: this device's clock when the last push began. */
  syncPushedAt: Iso
  /** Sync: photos whose bytes are already on the server. */
  syncUploadedPhotos: string[]
  /** Sync: when the last full round finished on this device. */
  syncLastAt: Iso
  /** Sync: the saved sign-in, kept here and not in localStorage (other sites share this address). */
  syncSession: string
}
