import type { Cigar } from '../data/types'
import { type GroupKey, STRENGTH_GROUPS } from './lounge'

/** Who is asking. A guest's experience decides which four sticks come up first. */
export type GuestKey = 'new' | 'sometimes' | 'experienced'

export interface Guest {
  key: GuestKey
  label: string
  /** One plain line on how to serve this guest. */
  tip: string
}

export const GUESTS: Guest[] = [
  {
    key: 'new',
    label: 'New',
    tip: 'First cigar or close to it. Start mild, keep it short, and check in after ten minutes.',
  },
  {
    key: 'sometimes',
    label: 'Sometimes',
    tip: 'Smokes now and then. Knows a few names and wants an easy yes.',
  },
  {
    key: 'experienced',
    label: 'Experienced',
    tip: 'Knows what they like. Offer something with a story or a step up.',
  },
]

export type PickStrength = Exclude<GroupKey, 'unknown'>

export interface Pick {
  guest: GuestKey
  strength: PickStrength
  /** The cigar's id in the seed catalog. */
  cigarId: string
  /** Shown when this device does not have the cigar. */
  name: string
  /** About what one costs online, in whole dollars. Only there to spread a set across prices. */
  online: number
  /** Why this stick for this guest, from the notes and description on file. */
  why: string
}

/**
 * The floor picks (2026-11-12): four sticks for each kind of guest at each strength, all
 * from his own Lounge list as it stood in his 2026-10-27 backup, not the October sheet. A
 * stick sits under the strength the catalog has on file for it (Mild is levels 1 and 2,
 * Medium is 3, Full is 4 and 5), and no stick is listed twice. Each set of four runs from
 * the cheapest to the priciest, by the single-stick prices online shops listed on
 * 2026-11-12 (`online`). The lounge's own prices are his to set at the shelf.
 */
export const PICKS: Pick[] = [
  // New
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '53fc3344-e99b-5ef2-a41c-0643257de86b',
    name: 'Macanudo Ecuadorian Shade',
    online: 7,
    why: 'Honey and cream in a box-pressed Macanudo. An easy first one.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '0e839dbe-5e95-5715-9a24-54651caa7ebd',
    name: 'Romeo Y Julieta 1875',
    online: 9,
    why: 'Smooth and mellow. Almond, cocoa, and butterscotch.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '5b190909-4e78-5f28-bddc-90d6e022d2ff',
    name: 'Macanudo Café',
    online: 12,
    why: 'Mellow cream and nuts. One of the best-selling cigars in the country.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'f6b8c876-5d9a-5256-a02f-5a0e8b859627',
    name: 'Montecristo Classic Series',
    online: 17,
    why: 'Smooth cream and cocoa under a name they know.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '8b9bde1c-d715-51f2-a889-1884de2b319d',
    name: 'Arturo Fuente Hemingway Short Story',
    online: 8,
    why: 'Small, 4 x 49, so it is done before it wears them out. Cedar, cocoa, and cinnamon.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'b8bb7b14-b7c0-5db2-8258-2ea64c3e51a5',
    name: 'Perdomo Lot 23',
    online: 9,
    why: 'A Nicaraguan puro from one farm in Esteli. Earth, almond, and cedar.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '1467a9bd-1ada-5103-a50a-5bce9214a787',
    name: 'Montecristo White Series',
    online: 14,
    why: 'Creamy, with roasted nuts and a little spice.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'eb8800c5-c50c-5561-b742-c8c4f1aa01a7',
    name: 'Cohiba Red Dot',
    online: 19,
    why: 'The core Cohiba sold in the US, a name they know. Nuts, cream, and caramel.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '1e905f13-3860-5543-832c-ccb70bbf55f0',
    name: 'Sancho Panza Double Maduro',
    online: 6,
    why: 'Espresso and dark chocolate. Only if they ask for strong, and after a meal.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'd33a2ebc-ea45-5f42-a2ee-a8e0d883b7fe',
    name: 'Punch Rare Corojo',
    online: 10,
    why: 'Leather and baking spice. Made in short sizes, so a strong one does not have to be a long one.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'fab7abd8-a769-596b-9d54-04df6b33f30f',
    name: 'Perdomo 20th Anniversary',
    online: 12,
    why: 'Creamy and sweet with light spice. A gentle way into the strong end.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'af101d83-1b70-57e0-8921-948091e1bdc3',
    name: 'Padron 1964 Anniversary Series',
    online: 16,
    why: 'Box-pressed, with tobacco aged four years. Cocoa, hazelnut, and coffee.',
  },

  // Sometimes
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '88ddc4d4-725c-5562-8e9f-80c4f6e60eb0',
    name: 'Arturo Fuente Chateau Fuente',
    online: 8,
    why: 'Comes wrapped in cedar. Cashew, almond, and cream.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '6cffe776-ee26-5972-b367-252c7acb63bd',
    name: 'My Father Connecticut',
    online: 9,
    why: 'The lighter My Father. Cream and nuts with some of the house spice.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '9a3337e8-7e94-559c-834a-a2d215a37132',
    name: 'Perdomo 20th Anniversary Connecticut',
    online: 12,
    why: 'An eight-year-old wrapper finished in bourbon barrels. Cream, honey, and spice.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '03a4e2e2-7ce3-5bd4-a696-35799e72aa46',
    name: 'J.C. Newman Diamond Crown',
    online: 17,
    why: "J.C. Newman's flagship, made by Arturo Fuente. Cream, cedar, and nuts.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'e8e9d949-de8b-5e28-93fb-0adf3ecef31d',
    name: 'Arturo Fuente Flor Fina 8-5-8',
    online: 8,
    why: "One of Fuente's best known everyday smokes. Cedar, chestnut, and coffee.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '6bb0d41f-8a51-5bc3-95f1-a9214c079c70',
    name: 'J.C. Newman Brick House',
    online: 9,
    why: 'Cedar, leather, and pepper.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '31c4a8a2-79d6-52eb-976a-b1ea6a2a9d6e',
    name: 'Cohiba Blue',
    online: 15,
    why: 'The everyday Cohiba. Leather, earth, and cream.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '78463c04-b139-5e86-a806-ae532ab6da0f',
    name: 'Rocky Patel Sixty',
    online: 17,
    why: "Cigar Aficionado's number two cigar of 2022. Leather, coffee, and walnut.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'd17f47df-cab9-52b6-8997-9b040afb81dc',
    name: 'Padron Series 2000',
    online: 9,
    why: "A robusto from Padron's core line. Earth, cedar, and coffee.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '015aa00c-0501-55c6-9f1a-bfa95b13dab4',
    name: 'CAO Brazilia',
    online: 12,
    why: 'A dark Brazilian wrapper. Coffee, dark cocoa, and cedar.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '13477e09-b1d2-5c46-951b-2540925c33d0',
    name: 'Arturo Fuente Don Carlos',
    online: 14,
    why: 'Named for Carlos Fuente Sr. Tobacco aged as long as ten years under a Cameroon wrapper.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'ac6c03b6-7778-56f4-9a17-73615f9ad7bf',
    name: 'Montecristo 1935 Anniversary Nicaragua',
    online: 26,
    why: 'A box-pressed Nicaraguan puro under a name they know. Coffee, leather, and cinnamon.',
  },

  // Experienced
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '17771a60-d7e5-5605-a6b7-ad7a2478f554',
    name: 'La Flor Dominicana Suave',
    online: 8,
    why: "La Flor Dominicana's mildest line. Cream, cedar, and pepper.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'a9cdfed5-9dbc-5f56-9984-7cc1f12027ec',
    name: 'J.C. Newman Brick House Double Connecticut',
    online: 9,
    why: 'A shade wrapper over a broadleaf binder. Hay, nuts, and milk chocolate.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'da13f8f6-a6e7-575a-a99a-de4df96ea0f8',
    name: 'Ashton Classic',
    online: 13,
    why: 'Made for Ashton by the Fuente family. Cream, almond, and cedar.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'a4231b53-9b41-59bb-99a8-ecdefe0f37a0',
    name: 'Padron Dámaso Series',
    online: 17,
    why: "Padron's milder line. Almond, nougat, and coffee.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '947b385a-c5e9-576e-9813-1bee610f6ace',
    name: 'Foundation Charter Oak Habano',
    online: 7,
    why: 'Made for Foundation at AJ Fernandez. Spice, black pepper, and nuts.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '9a128bd5-c09a-51b7-aaeb-175ad9fe064c',
    name: 'La Aroma De Cuba Original',
    online: 9,
    why: 'Made by the Garcia family at My Father. Coffee, cocoa, and molasses.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'c75dcd69-9add-5187-8bb8-c83ce7f2febe',
    name: 'Foundation The Wise Man Maduro',
    online: 12,
    why: 'A San Andrés wrapper. Cocoa, black cherry, and coffee.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'eab37de2-cee9-5b73-8517-48822c25b307',
    name: 'Plasencia Alma del Campo',
    online: 17,
    why: 'A Nicaraguan puro built on Jalapa valley tobacco. Coffee, cream, and chocolate.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'f38a786b-aef9-595a-bfdf-748d828d65c7',
    name: 'La Flor Dominicana Double Ligero',
    online: 10,
    why: "La Flor Dominicana's best known power cigar. Leather, spice, and coffee.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '9a517310-2db5-52d7-bbb1-a3367dcd8d9c',
    name: 'Dunbarton Mi Querida',
    online: 14,
    why: "Steve Saka's Connecticut Broadleaf maduro. Earth, chocolate, and coffee.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c5e74cdd-cec5-5c96-a013-250c69640d79',
    name: 'Padron 1926 Serie',
    online: 18,
    why: 'Tobacco aged five years. Chocolate, coffee, and black cherry.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'e8bb0428-04d1-5049-9aca-2f36fcf3270d',
    name: 'Arturo Fuente Fuente Fuente OpusX',
    online: 34,
    why: "Fuente's best known high-end line, and still hard to find. Baking spice, caramel, and leather.",
  },
]

export interface PickRow extends Pick {
  /** Null when this device does not have the cigar, or it was deleted. */
  cigar: Cigar | null
}

export interface PickGroup {
  strength: PickStrength
  label: string
  /** The 1 to 5 levels that land here, for the strength mark beside the heading. */
  levels: number[]
  rows: PickRow[]
}

/** One guest's picks, Mild to Full, each joined to its cigar record. */
export function picksFor(guest: GuestKey, cigars: Map<string, Cigar>): PickGroup[] {
  return STRENGTH_GROUPS.filter((group) => group.key !== 'unknown').map((group) => ({
    strength: group.key as PickStrength,
    label: group.label,
    levels: group.levels,
    rows: PICKS.filter((pick) => pick.guest === guest && pick.strength === group.key).map(
      (pick) => {
        const cigar = cigars.get(pick.cigarId)
        return { ...pick, cigar: cigar && !cigar.deletedAt ? cigar : null }
      },
    ),
  }))
}

/** How many of the picks have a price he set himself at the shelf. */
export function pricedCount(cigars: Map<string, Cigar>): number {
  return PICKS.filter((pick) => {
    const cigar = cigars.get(pick.cigarId)
    return cigar && !cigar.deletedAt && cigar.priceCheckedAt !== null
  }).length
}
