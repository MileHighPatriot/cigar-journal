import type { Cigar } from '../data/types'
import { type GroupKey, STRENGTH_GROUPS } from './lounge'

/** Who is asking. A guest's experience decides which three sticks come up first. */
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
  /** Why this stick for this guest, from the notes and description on file. */
  why: string
}

/**
 * The floor picks (2026-11-12): three sticks for each kind of guest at each strength, all
 * from the lounge sheet. A stick sits under the strength the catalog has on file for it
 * (Mild is levels 1 and 2, Medium is 3, Full is 4 and 5), and no stick is listed twice.
 * The first in each set of three is the one to reach for first.
 */
export const PICKS: Pick[] = [
  // New
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '5b190909-4e78-5f28-bddc-90d6e022d2ff',
    name: 'Macanudo Café',
    why: 'Mellow cream and nuts. One of the best-selling cigars in the country and an easy first one.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '97e6511c-e96c-5a20-b9b9-6955830899d0',
    name: 'CAO Gold',
    why: 'Mellow and nutty with a little cocoa.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '8d41960f-4f93-5519-965b-641e8570aee9',
    name: 'Baccarat The Game',
    why: 'Mild, with a sweetened cap. Good for a guest who finds tobacco bitter.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '8b9bde1c-d715-51f2-a889-1884de2b319d',
    name: 'Arturo Fuente Hemingway Short Story',
    why: 'Small, 4 x 49, so it is done before it wears them out. Cedar, cocoa, and cinnamon.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '436ffabb-2ca4-5779-be5b-728342e16598',
    name: 'Perdomo Habano Bourbon Barrel-Aged',
    why: 'Vanilla and sweet tobacco from a wrapper finished in bourbon barrels. Easy for a bourbon drinker.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'd5e273cb-763b-5bd3-bcca-006335508e86',
    name: 'Romeo Y Julieta Reserva Real',
    why: 'Cream, nuts, and vanilla under a name they know.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '1e905f13-3860-5543-832c-ccb70bbf55f0',
    name: 'Sancho Panza Double Maduro',
    why: 'Espresso and dark chocolate. Only if they ask for strong, and after a meal.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'aa7b6b2c-172a-53a3-871a-17191942975e',
    name: 'CAO Flathead',
    why: 'Sweet and fruity for a cigar this strong.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'fab7abd8-a769-596b-9d54-04df6b33f30f',
    name: 'Perdomo 20th Anniversary',
    why: 'Creamy and sweet with light spice. A gentle way into the strong end.',
  },

  // Sometimes
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '88ddc4d4-725c-5562-8e9f-80c4f6e60eb0',
    name: 'Arturo Fuente Chateau Fuente',
    why: 'Comes wrapped in cedar. Cashew, almond, and cream.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '6980c876-229b-50ba-8de5-b3639e5d4254',
    name: 'Rocky Patel Vintage 1999 Connecticut',
    why: 'An aged Connecticut wrapper. Cream, toast, and cedar.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'f6b8c876-5d9a-5256-a02f-5a0e8b859627',
    name: 'Montecristo Classic Series',
    why: 'Smooth cream and cocoa under a name they know.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'e8e9d949-de8b-5e28-93fb-0adf3ecef31d',
    name: 'Arturo Fuente Flor Fina 8-5-8',
    why: "One of Fuente's best known everyday smokes. Cedar, chestnut, and coffee.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '6bb0d41f-8a51-5bc3-95f1-a9214c079c70',
    name: 'J.C. Newman Brick House',
    why: 'Cedar, leather, and pepper at a fair price.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '1467a9bd-1ada-5103-a50a-5bce9214a787',
    name: 'Montecristo White Series',
    why: 'Creamy, with roasted nuts and a little spice.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'd17f47df-cab9-52b6-8997-9b040afb81dc',
    name: 'Padron Series 2000',
    why: "A robusto from Padron's core line. Earth, cedar, and coffee.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'c81e50ca-3776-5c6e-ad7c-4d4abf6a1c67',
    name: 'My Father Flor de Las Antillas',
    why: "Cocoa, cream, and spice. Cigar Aficionado's number one cigar of 2012.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '3223666a-ac96-5003-b956-d97904383eb5',
    name: 'Kristoff Ligero Maduro',
    why: 'Coffee, dried fruit, and cocoa, with extra ligero for strength.',
  },

  // Experienced
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'da13f8f6-a6e7-575a-a99a-de4df96ea0f8',
    name: 'Ashton Classic',
    why: 'Made for Ashton by the Fuente family. Cream, almond, and cedar.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '0c164960-0420-50b0-9837-ccf0fa29eb2a',
    name: 'AVO Classic',
    why: 'The original AVO blend. Cream, cedar, and cashew.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '95cb1bbd-e14b-5d9c-99bf-51f5e8ecf90e',
    name: 'EP Carrillo New Wave Connecticut',
    why: 'Cream and earth with some pepper. A mild one that is not dull.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '9a128bd5-c09a-51b7-aaeb-175ad9fe064c',
    name: 'La Aroma De Cuba Original',
    why: 'Made by the Garcia family at My Father. Coffee, cocoa, and molasses.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'c75dcd69-9add-5187-8bb8-c83ce7f2febe',
    name: 'Foundation The Wise Man Maduro',
    why: 'A San Andrés wrapper. Cocoa, black cherry, and coffee.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '864cf07a-c536-5ad6-81a1-db82f0c060ca',
    name: 'AJ Fernandez New World Dorado',
    why: 'A box-pressed Nicaraguan puro. Pepper, cedar, and cinnamon.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c5e74cdd-cec5-5c96-a013-250c69640d79',
    name: 'Padron 1926 Serie',
    why: 'Tobacco aged five years. Chocolate, coffee, and black cherry.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c49dade6-bef9-5a04-96a5-d6ed32af3fa3',
    name: 'My Father Le Bijou 1922',
    why: 'Pepin Garcia made it in memory of his father. Leather, earth, and espresso.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'f38a786b-aef9-595a-bfdf-748d828d65c7',
    name: 'La Flor Dominicana Double Ligero',
    why: "La Flor Dominicana's best known power cigar. Leather, spice, and coffee.",
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
