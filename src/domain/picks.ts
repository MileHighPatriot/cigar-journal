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
  /** The maker's name as the catalog has it. No set of four shows a brand twice. */
  brand: string
  /** About what one costs online, in whole dollars. Only there to spread a set across prices. */
  online: number
  /** Why this stick for this guest, from the notes and description on file. */
  why: string
  /** Who makes it and what sets it apart. The four below are what he tells the guest. */
  story: string
  /** Wrapper, binder, and filler in plain words. */
  leaf: string
  /** How it smokes, start to finish. */
  taste: string
  /** Ratings and awards from review sites. Empty when none were found. */
  proof: string
}

/**
 * The floor picks: the sticks each set of four is dealt from. It is his whole Lounge list
 * as it stood in his 2026-10-27 backup, less the few with no strength on file or no price
 * found online. Every one was checked on 2026-11-13 against review sites (Cigar
 * Aficionado, Blind Man's Puff, Cigar Coop, Cigar Dojo, Holt's, Famous Smoke and others)
 * and put under the one guest it suits best. Where reviews are thin or reviewers put a
 * stick outside its strength, its `why` says so. A stick sits under the strength the
 * catalog has on file for it (Mild is levels 1 and 2, Medium is 3, Full is 4 and 5) and is
 * listed once. The first four listed for a guest and strength are the opening set;
 * `weekSet` deals a new four each Sunday from 2026-11-22. `online` is a single-stick price
 * found online (a few are a box or pack price divided), there to run a set from cheapest
 * to priciest. The lounge's own prices are his to set at the shelf. Every fact in `story`,
 * `leaf`, `taste`, and `proof` comes from a page opened on 2026-11-13.
 */
export const PICKS: Pick[] = [
  // New
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'a7d051c2-eba4-5a09-998d-1735d135567d',
    name: 'Hoyo de Monterrey Shade',
    brand: 'Hoyo de Monterrey',
    online: 6,
    why: 'Truly mild, easy on the wallet, and it draws and burns without fuss. A safe first cigar.',
    story:
      'The newest Hoyo de Monterrey, out since June 2025. General Cigar rolls it in Honduras, and it followed the Rojo and Oscuro blends that restarted the line in 2024.',
    leaf: 'Cigar Aficionado lists it as all Honduran: wrapper, binder, and filler.',
    taste:
      'Light and gentle. Hay, wood, peanut, and tea with a faint vanilla finish. It stays about the same from start to finish, so nothing sneaks up on a first-timer.',
    proof:
      'Cigar Aficionado gave the short Rothschild 89 points and called it mild with an open, even draw.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '88ddc4d4-725c-5562-8e9f-80c4f6e60eb0',
    name: 'Arturo Fuente Chateau Fuente',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'Short, mild, and from a family everyone in cigars respects. Done in under an hour.',
    story:
      'Made by the Fuente family in the Dominican Republic and named for their farm, Chateau de la Fuente. Each one is aged, then slipped into a cedar sleeve with a green ribbon at the foot.',
    leaf: 'A Connecticut Shade wrapper grown in the United States over Dominican binder and filler.',
    taste:
      'Smooth and a little sweet. Sweet cedar, nutmeg, and toasted nuts, with more wood in the second half. At 4 1/2 inches it finishes in under an hour.',
    proof:
      "Cigar Aficionado scored it 88 in December 2024. Holt's ranks it second on its list of the best mild cigars, and it is on beginner lists at Mike's Cigars and The Manual.",
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '5b190909-4e78-5f28-bddc-90d6e022d2ff',
    name: 'Macanudo Café',
    brand: 'Macanudo',
    online: 11,
    why: 'The classic first cigar. No pepper, an even burn, and mild from start to finish.',
    story:
      'The original Macanudo blend and the one that made the name. General Cigar makes it in the Dominican Republic, and it has been one of the best-selling premium cigars for decades.',
    leaf: 'A Connecticut Shade wrapper over a Mexican San Andres binder, with Mexican and Dominican filler.',
    taste:
      'Creamy, nutty, and a little sweet. Cedar leads the whole way with a light sweetness under it, and it warms up at the end without turning harsh.',
    proof:
      "Cigar Aficionado gave the Hyde Park 90 points, put it in its Top 25 of 2005, and called it always smooth, always mild, and a good starter cigar. Holt's, Famous Smoke, and Mike's Cigars all list it for beginners.",
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'da13f8f6-a6e7-575a-a99a-de4df96ea0f8',
    name: 'Ashton Classic',
    brand: 'Ashton',
    online: 13,
    why: 'The step-up first cigar. As easygoing as they come, with a more polished taste.',
    story:
      'Ashton was started in 1985 by Robert Levin in Philadelphia. This is the original Ashton blend, and the Fuente family makes it for the company in the Dominican Republic.',
    leaf: 'A golden Connecticut Shade wrapper over Dominican binder and filler aged three to four years.',
    taste:
      'Cream, almond, cashew, and cedar with a touch of sweetness and almost no pepper. The taste holds steady to the end. The wrapper is thin, so light it gently.',
    proof:
      "Cigar Aficionado has scored the 8-9-8 size 89 and 90. Holt's ranks it first on its beginner list, though Holt's and Ashton are sister companies.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '8b9bde1c-d715-51f2-a889-1884de2b319d',
    name: 'Arturo Fuente Hemingway Short Story',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'Only four inches long, so it is done before it wears them out. Sweet, nutty, and well made.',
    story:
      'The smallest cigar in the Hemingway line, where every size is a tapered perfecto with a bookish name. The Fuente family has made cigars since 1912 and has rolled in Santiago, Dominican Republic, since 1980.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler, in a 4 by 49 perfecto.',
    taste:
      'Sweet and nutty. Almond, honey, and cream, with a little cinnamon and cocoa. For all its curves it burns evenly and draws well.',
    proof:
      "Cigar Aficionado scored it 90 in 2018 and again in 2025, both times at medium strength. Holt's has the Hemingway line on its best under $10 and best medium-bodied lists.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '6bb0d41f-8a51-5bc3-95f1-a9214c079c70',
    name: 'J.C. Newman Brick House',
    brand: 'J.C. Newman',
    online: 9,
    why: 'An everyday medium with easy flavors and a low price. Hard to get wrong.',
    story:
      "J.C. Newman is a family company that started in Cleveland in 1895 and now runs out of Tampa. Brick House is an old family brand named for the founder's brick childhood home in Hungary, brought back in 2009 as a Nicaraguan cigar from the company's own factory in Esteli.",
    leaf: 'An Ecuadorian Havana-seed wrapper over Nicaraguan binder and filler.',
    taste:
      'Wood, leather, and nuts with sweet spice and a cappuccino finish. It starts with plenty of cedar and cream, and the pepper stays in the background.',
    proof:
      'Cigar Aficionado named the Churchill its No. 10 cigar of 2024 at 93 points, and the Corona made its Best Buys in 2024 and 2025.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '7c00f9fb-9ce4-56b2-ad19-0ae043a077c6',
    name: 'Rocky Patel Vintage 1990 Broadleaf',
    brand: 'Rocky Patel',
    online: 11,
    why: 'Smooth, nutty, and toasty under a name they may have heard. A medium that leans gentle.',
    story:
      'The first cigar to carry the Rocky Patel name, out in 2003. The 1990 is the wrapper, a Honduran broadleaf that was aged 12 years. It is box-pressed and made in Honduras.',
    leaf: 'A 12-year-old Honduran broadleaf wrapper over a Nicaraguan binder, with Dominican and Nicaraguan filler.',
    taste:
      'Nuts come first, then toast, vanilla, chocolate, and coffee bean, with a hint of mocha at the end. Easy draw, even burn.',
    proof:
      'Cigar Aficionado scored it 92, its highest Rocky Patel rating at the time, and ranked the Robusto No. 22 of 2004. The small Juniors size made its Best Buys of 2024.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '1467a9bd-1ada-5103-a50a-5bce9214a787',
    name: 'Montecristo White Series',
    brand: 'Montecristo',
    online: 17,
    why: 'Creamy and forgiving under the biggest name in cigars. Reviewers call it mild to medium.',
    story:
      'Made for Altadis in the Dominican Republic. It was built as the step up from the original yellow-band Montecristo: the same creamy style with a little more to it.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper over a Nicaraguan binder, with Dominican and Nicaraguan filler.',
    taste:
      'Cream, cashew, and vanilla first, then butter and honey, with a little oak and pepper at the end. The Rothchilde takes about an hour.',
    proof:
      "A blind panel at Blind Man's Puff scored the Rothchilde 94, and one taster called it one of the best mild to medium cigars he has had. Mike's Cigars has it on its beginner list.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '1e905f13-3860-5543-832c-ccb70bbf55f0',
    name: 'Sancho Panza Double Maduro',
    brand: 'Sancho Panza',
    online: 6,
    why: 'Looks pitch dark but smokes sweet, and reviewers call it medium to medium-full. A cheap, low-risk way to try a dark one.',
    story:
      'General Cigar relaunched Sancho Panza in July 2022 with Matt Booth of Room101, with new blends and a new look. It is made in Honduras.',
    leaf: 'A very dark sun-grown Ecuadorian Sumatra wrapper over a Nicaraguan binder from Esteli, with Dominican and Nicaraguan filler.',
    taste:
      'Coffee and cocoa with a touch of oak and caramel on the finish. A caramel sweetness shows early, and it picks up some strength in the second half. Best after a meal.',
    proof:
      'Cigar Aficionado scored the Robusto 92 in February 2024 and put it on its list of 16 highly rated cigars under $8. Stogie Press gave it 91.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'd33a2ebc-ea45-5f42-a2ee-a8e0d883b7fe',
    name: 'Punch Rare Corojo',
    brand: 'Punch',
    online: 9,
    why: 'A smooth way into stronger cigars. Reviewers put it at medium to medium-full, and it comes in short sizes.',
    story:
      'A Honduran-made Punch from General Cigar. It came back in 2001 after a wrapper shortage kept it off shelves, and for years it shipped only once a year. Since 2025 it is made year-round.',
    leaf: 'A reddish Ecuadorian Sumatra wrapper over a Connecticut Broadleaf binder, with Honduran, Nicaraguan, and Dominican filler. The name is about the rare wrapper. It is not a Corojo leaf.',
    taste:
      'Leather and wood with a little cherry. The small sizes add marshmallow and caramel over a peppery core. Reviewers call the smoke smooth and creamy.',
    proof:
      'Cigar Aficionado has scored it from 90 to 92, most recently 90 for the Rapido in 2025 and the El Doble in 2026.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'f5b4f7ea-1974-5a69-adae-dafe829f0891',
    name: 'La Aroma De Cuba Mi Amor',
    brand: 'La Aroma De Cuba',
    online: 10,
    why: 'Dark, sweet, and smooth, with awards to point at. Medium-full, so offer it after a meal.',
    story:
      "An Ashton brand made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Mi Amor came out in 2010 and was Ashton's first cigar with a Mexican wrapper.",
    leaf: 'A dark, oily Mexican San Andres wrapper over two Nicaraguan binder leaves and Nicaraguan filler from the Garcia farms.',
    taste:
      'Malted chocolate, mixed nuts, and coffee, with a cashew finish. A little black pepper runs through it, and it ends sweet. The Robusto runs about an hour and a half.',
    proof:
      "Cigar Aficionado's No. 2 cigar of 2011 and No. 9 of 2023, at 95 points both times. The editors call it a tremendous value. The Robusto scored 92 in 2024.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '21a4259b-bf9e-5923-b245-28eb679bfc00',
    name: 'Padron 1964 Anniversary Series Maduro',
    brand: 'Padron',
    online: 16,
    why: 'The dark Padron that smokes sweet. Rich but not brutal. Hand them a short one, the Principe or the Hermoso.',
    story:
      'The Padron family makes it in Esteli, Nicaragua. Jose Orlando Padron opened his first small factory in Miami in 1964, and this line came out in 1994 for the 30th anniversary. It is box-pressed, and every cigar carries a numbered band to guard against fakes.',
    leaf: 'All Nicaraguan, with a sun-grown maduro wrapper.',
    taste:
      'Rich cocoa and coffee with nuts and toast, and a raisin sweetness at the end. Reviewers find it sweeter than the natural version. Most call it medium-full.',
    proof:
      "Cigar Aficionado's No. 5 cigar of 2011 and No. 4 of 2013, at 94 points both times. Cigar Dojo scored it 95.",
  },

  // Sometimes
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '56e1505a-2c80-5a01-889f-2a4948fa8d1f',
    name: 'Macanudo Inspirado White',
    brand: 'Macanudo',
    online: 7,
    why: 'A Macanudo with more going on than the Café. Still creamy, with a little pepper.',
    story:
      'Part of the Inspirado line that Macanudo brought to the United States in 2016. The blender says it steps away from the classic Macanudo style but keeps the creaminess.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper aged six years, an Indonesian binder, and Nicaraguan and Mexican filler.',
    taste:
      'Sweet bread, coffee, and cream with a peppercorn bite early. It settles into wood, butterscotch, and hay. The Robusto takes about an hour and twenty minutes.',
    proof: 'Cigar Aficionado gave the Corona 89 points and Cigar Dojo gave the Robusto 89.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'a9cdfed5-9dbc-5f56-9984-7cc1f12027ec',
    name: 'J.C. Newman Brick House Double Connecticut',
    brand: 'J.C. Newman',
    online: 9,
    why: 'The best-reviewed value on the mild shelf. Mild and mellow, but with real flavor.',
    story:
      "The third Brick House blend, out in 2017, from J.C. Newman's own factory in Esteli, Nicaragua. The name is literal: both the wrapper and the binder are grown in Connecticut.",
    leaf: 'A Connecticut Shade wrapper over a Connecticut Broadleaf binder, with the same Nicaraguan filler as the regular Brick House.',
    taste:
      'Warm and toasty from the first puff to the last, with almond and peanut. Look for wood, vanilla, tea, and a honey finish.',
    proof:
      'Cigar Aficionado has scored the Churchill 92, 90, and 89, called it mild and mellow yet flavorful, and put it on its Bang for the Buck list.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '9a3337e8-7e94-559c-834a-a2d215a37132',
    name: 'Perdomo 20th Anniversary Connecticut',
    brand: 'Perdomo',
    online: 11,
    why: 'A mild cigar with a story to tell: the wrapper was finished in bourbon barrels.',
    story:
      'Made by the Perdomo family at their factory in Esteli, Nicaragua, to mark 20 years of cigar making. It is the mildest of the three 20th Anniversary cigars.',
    leaf: 'An eight-year-old Ecuadorian Connecticut wrapper, aged eight more months in bourbon barrels, over Nicaraguan binder and filler.',
    taste:
      'Rich and creamy with honey and a little spice at the end. Cigar Aficionado tasted vanilla, citrus, and honey. It has more spice than most Connecticuts.',
    proof:
      "Cigar Aficionado scored the Gordo 88. Holt's has it on its Top 9 Mellow Cigars, and Bespoke Unit gave it five stars.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'f6b8c876-5d9a-5256-a02f-5a0e8b859627',
    name: 'Montecristo Classic Series',
    brand: 'Montecristo',
    online: 16,
    why: 'Mild and lightly sweet under a name every guest knows. An easy yes.',
    story:
      'The Connecticut Shade Montecristo, made by Altadis in the Dominican Republic. It has the same mellow, smooth style as the original Dominican Montecristo.',
    leaf: 'A Connecticut Shade wrapper grown in the United States over Dominican binder and filler.',
    taste:
      'Mild and lightly sweet. A woody core with citrus and vanilla, and a tea and vanilla cookie taste that turns bready. Open draw, even burn.',
    proof: 'Cigar Aficionado has scored it 87 twice and lists it as mild.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '947b385a-c5e9-576e-9813-1bee610f6ace',
    name: 'Foundation Charter Oak Habano',
    brand: 'Foundation',
    online: 7,
    why: 'A very good cigar for very little money. Medium, with some pepper as it goes.',
    story:
      'From Foundation Cigar, started in 2015 by Nick Melillo in his home state of Connecticut after years at Drew Estate. AJ Fernandez makes it in Nicaragua. It joined the Charter Oak line in late 2020.',
    leaf: 'An Ecuadorian Habano wrapper over Nicaraguan binder and filler.',
    taste:
      'Woody and toasty with lemon and orange and a sweet pecan cookie finish. Black pepper and leather build in the second half.',
    proof:
      "Cigar Aficionado put the Lonsdale on its 2025 Best Buys at 90 points. A blind panel at Blind Man's Puff scored it 92.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'e8e9d949-de8b-5e28-93fb-0adf3ecef31d',
    name: 'Arturo Fuente Flor Fina 8-5-8',
    brand: 'Arturo Fuente',
    online: 8,
    why: "Fuente's best-selling shape. Smooth and steady, on the gentle side of medium.",
    story:
      'Made by the Fuente family in the Dominican Republic and created in memory of Arturo Fuente, who founded the company in 1912. The family says the name was picked so the number reads the same from both directions.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler. One size, 6 by 47.',
    taste:
      'Roasted chestnut and bittersweet chocolate, with oak, caramel, and a little leather. It picks up some strength after about an hour.',
    proof:
      "Cigar Aficionado scored it 87. Holt's staff gave it 93, and Famous Smoke calls it about as solid a medium-bodied cigar as you are going to get.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'f741c1c0-7a50-57f4-93f4-721ede17ad90',
    name: 'Macanudo Inspirado Orange',
    brand: 'Macanudo',
    online: 10,
    why: 'The Macanudo that is not mild. Rich and buttery, for someone who knows the name and wants more.',
    story:
      'The first of the Inspirado line. It started in Europe in 2014 and reached American shops in 2016. General Cigar makes it in Honduras, and Cigar Aficionado called it the most ambitious Macanudo to date.',
    leaf: 'A Honduran rosado wrapper over a Honduran binder, with filler from the Dominican Republic, Honduras, and Nicaragua.',
    taste:
      'Rich and buttery, with leather and mesquite and a bright finish of almonds and black pepper. Fuller than any classic Macanudo.',
    proof:
      "Cigar Aficionado's No. 20 cigar of 2017 for the Churchill, at 92 points, after a 93 earlier that year.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '6bfc0907-1dc3-5391-b453-4f5ab21b81b5',
    name: 'Aging Room Quattro Nicaragua Sonata',
    brand: 'Aging Room',
    online: 13,
    why: 'A box-pressed Nicaraguan with chocolate and nuts. A step up without being heavy.',
    story:
      'Blended by Rafael Nodal and made by AJ Fernandez in Nicaragua, out since 2023. Nodal is a musician, so he built it as his sonata and gave the sizes musical names. It is lighter than the original Quattro Nicaragua.',
    leaf: 'All Nicaraguan: wrapper, binder, and filler. Box-pressed.',
    taste:
      'Peppery and nutty with dark chocolate and a toasted almond finish. The maker adds earth, espresso, and a tobacco sweetness all the way through. It builds toward medium-full.',
    proof:
      'Cigar Aficionado scored the robusto-size Espressivo 92 and the Impromptu 93 in 2023. Cigar Coop ranked it No. 12 on its 2023 list.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '1869c494-e7d6-598b-afa8-820ae792f8ec',
    name: 'Perdomo 20th Anniversary Sun Grown',
    brand: 'Perdomo',
    online: 12,
    why: 'Rich and sweet with a bourbon barrel story. Medium to full, and a crowd-pleaser.',
    story:
      "Released in 2012 to mark Perdomo's 20th year. Nick Perdomo grows and ages the tobacco on the family's own farms in Nicaragua. The cigars are chunky and box-pressed.",
    leaf: 'An eight-year-old Nicaraguan sun-grown wrapper, aged ten more months in bourbon barrels, over Nicaraguan binder and filler.',
    taste:
      'Leather, sweet cedar, nuts, and spice, ending in brown sugar. Perdomo calls it rich and earthy with oak and cedar, and suggests Scotch or bourbon with it.',
    proof: 'Cigar Aficionado scored the Churchill 92 in 2013 and the Gordo 90 in 2014.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '57ea9ccd-ba96-5481-b33e-559368ba391e',
    name: 'Aging Room Quattro Nicaragua',
    brand: 'Aging Room',
    online: 13,
    why: 'A Cigar of the Year winner they may have heard of. Rich and chocolatey at medium-full.',
    story:
      'Blended by Rafael Nodal, who came to the United States from Cuba in 1980, and made by AJ Fernandez in Nicaragua. It came out in 2018 as the first Nicaraguan cigar in the Quattro line.',
    leaf: 'All Nicaraguan: wrapper, binder, and filler. Box-pressed.',
    taste:
      'Dark chocolate and wood at its heaviest, caramel and toasted almonds at its lightest. The robusto starts with chocolate, almonds, and espresso and sweetens to caramel in the middle.',
    proof:
      "Cigar Aficionado's Cigar of the Year for 2019, with 96 points for the Maestro. The Concerto was No. 14 of 2021, and The Cigar Authority scored the robusto 94.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '13477e09-b1d2-5c46-951b-2540925c33d0',
    name: 'Arturo Fuente Don Carlos',
    brand: 'Arturo Fuente',
    online: 14,
    why: 'A famous name that smokes richer than it hits. Sweet and refined, medium to medium-full.',
    story:
      'Named for Carlos Fuente Sr., the family patriarch, who said his goal was not to be the biggest, just the best. The line dates to 1976, and the Fuentes make it in the Dominican Republic and keep the exact recipe secret.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler, with tobaccos aged as much as ten years.',
    taste:
      'Citrus balanced by tea, honey, and wood, with a little raisin in the middle and a brown sugar finish.',
    proof:
      'Cigar Aficionado scored the Robusto 92 in 2021. The Don Carlos Eye of the Shark was its Cigar of the Year for 2017 at 97 points.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'af101d83-1b70-57e0-8921-948091e1bdc3',
    name: 'Padron 1964 Anniversary Series',
    brand: 'Padron',
    online: 16,
    why: 'About as well reviewed as a cigar gets. Rich, nutty, and medium-full.',
    story:
      "The Padron family makes it in Esteli, Nicaragua. It came out in 1994 for the company's 30th anniversary. The box press recalls the cigars Jose Orlando Padron smoked in Cuba, and every cigar carries a numbered band to guard against fakes.",
    leaf: 'All Nicaraguan sun-grown tobacco, with a natural wrapper.',
    taste:
      'A woody, nutty core that gets more complex as it goes, with hazelnut and rich cocoa. The draw and burn are excellent.',
    proof:
      "Cigar Aficionado's Cigar of the Year for 2021, with 97 points for the Torpedo. The Exclusivo was No. 3 of 2005.",
  },

  // Experienced
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '6cffe776-ee26-5972-b367-252c7acb63bd',
    name: 'My Father Connecticut',
    brand: 'My Father',
    online: 9,
    why: 'A Connecticut with backbone. Creamy, but it keeps the Garcia family spice.',
    story:
      'Blended by Jose "Pepin" Garcia and his son Jaime and made at My Father Cigars in Nicaragua, out since July 2014. Everything but the wrapper comes from the Garcias\' own farms.',
    leaf: 'An Ecuadorian Connecticut wrapper over a Nicaraguan Corojo 99 binder, with Nicaraguan Habano and Criollo filler.',
    taste:
      'Pepper and spice up front with leather and nuts. Then coffee, cedar, and a buttery creaminess, ending with honey sweetness and cedar.',
    proof:
      "A blind panel at Blind Man's Puff scored it 91. Cigar Aficionado gave the Toro Gordo 89, and The Cigar Authority gave the Robusto 89.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '5d2735d9-c161-529d-9ba9-34e0c0bdf95f',
    name: 'C.L.E. Connecticut',
    brand: 'C.L.E.',
    online: 11,
    why: 'Not the usual Connecticut. Mild in strength, with an orange citrus turn most mild cigars never make.',
    story:
      'From Christian Luis Eiroa, who grew up in a tobacco family in Honduras and ran Camacho before starting CLE in 2012. It is made at his El Aladino factory in Danli, Honduras.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper over Honduran binder and filler.',
    taste:
      'Pepper at the start, then cream, dried fruit, and wood. The fruit turns to orange citrus and takes over the middle, and pepper joins it for an orange spice finish.',
    proof:
      "Cigar Coop scored the Robusto 92 and called it not your father's Ecuadorian Connecticut. The Cigar Authority gave the 11/18 size 96.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '03a4e2e2-7ce3-5bd4-a696-35799e72aa46',
    name: 'J.C. Newman Diamond Crown',
    brand: 'J.C. Newman',
    online: 16,
    why: 'A truly mild cigar with pedigree. Made by Fuente, with a wrapper aged five years.',
    story:
      "J.C. Newman's flagship, made for the company by the Fuente family in the Dominican Republic. It was brought back in 1995 for the company's 100th anniversary. Stanford Newman said he simply wanted to make the best cigar in the world.",
    leaf: 'A Connecticut Shade wrapper aged five years and fermented twice, a Dominican binder, and five different filler tobaccos. Every size is thick, 54 ring in most cases.',
    taste:
      'Mild and easygoing. Wood, wheat, and herbs with a floral note and a graham cracker sweetness. The shorter size is creamy with sandalwood and coffee.',
    proof:
      'Cigar Aficionado lists it as mild, scored the Robusto No. 4 at 88, and put the Robusto No. 1 on its list of ten milder cigars that scored 90 or higher.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'a4231b53-9b41-59bb-99a8-ecdefe0f37a0',
    name: 'Padron Dámaso Series',
    brand: 'Padron',
    online: 17,
    why: 'The mild Padron. Round instead of box-pressed, and a surprise for anyone who knows the brand as strong.',
    story:
      "Named for Damaso Padron, the first of the family to reach Cuba from the Canary Islands in the late 1800s. It came out in 2015 as the family's first milder, round cigar. Each one carries a numbered band.",
    leaf: 'An Ecuadorian Connecticut wrapper over Nicaraguan binder and filler.',
    taste:
      'Sweet almond nougat with coffee, cedar, and a little pepper. Butter and hay early, with a toasty finish. The No. 12 robusto runs about 65 minutes.',
    proof:
      'Cigar Aficionado has scored the line 88 and 89 several times and put the No. 12 on its list of 16 mild cigars. The Cigar Authority gave the No. 15 a 90 and called it elegant.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '9a128bd5-c09a-51b7-aaeb-175ad9fe064c',
    name: 'La Aroma De Cuba Original',
    brand: 'La Aroma De Cuba',
    online: 9,
    why: 'One of the best values in the humidor. Garcia-made, with scores that beat cigars at twice the price.',
    story:
      "An Ashton brand made by the Garcia family at My Father Cigars in Esteli, Nicaragua. The name goes back to a Cuban brand of the late 1800s that Holt's says was once a favorite of Winston Churchill.",
    leaf: 'A Connecticut Broadleaf wrapper over Nicaraguan binder and filler from the Garcia family farms.',
    taste:
      'Cocoa, cedar, molasses, and coffee bean with a woody spice. Cigar Aficionado found roasted peanut and toasted chestnut. It can smoke fuller than medium.',
    proof:
      "Cigar Aficionado scored the Robusto 94 in February 2025 and ranked it No. 23 of 2025, calling it an absolute steal. Holt's ranks it first among medium-bodied cigars.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'b8df4d93-5746-5e32-95d3-1e0d3a90cbe6',
    name: 'Caldwell The King Is Dead',
    brand: 'Caldwell',
    online: 12,
    why: 'A boutique Dominican with a wrapper almost nobody else uses. Milk chocolate and spice.',
    story:
      'From Robert Caldwell, one of the three lines he launched with in 2014, made at Tabacalera William Ventura in the Dominican Republic. Caldwell says the blend took five years to build.',
    leaf: 'All Dominican. The wrapper is a 2008-crop Negrito, a leaf rarely used as a wrapper, over a 2006 Corojo binder, with Corojo, Negrito, and HVA filler.',
    taste:
      'Milk chocolate, earth, red pepper, and cedar. The chocolate leads early, and cedar and plain tobacco come forward in the second half.',
    proof:
      'Cigar Aficionado scored The Last Payday size 92 and ranked it No. 19 of 2015. The small Manzanita scored 91 in 2024, and Cigar Coop gave the Toro 90.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '179a5ae3-e2f5-545c-95c6-43f4a824fbf9',
    name: 'Foundation Highclere Castle Victorian',
    brand: 'Foundation',
    online: 15,
    why: 'A story cigar: commissioned by the Earl of Carnarvon for the real Downton Abbey castle.',
    story:
      'Highclere Castle is the English house where Downton Abbey was filmed. Its owner, the Earl of Carnarvon, had Nick Melillo of Foundation create a cigar for it. The Victorian came out in 2019 as the darker, stronger follow-up, and AJ Fernandez rolls it in Esteli, Nicaragua.',
    leaf: 'An upper-priming Ecuadorian Habano wrapper over a Brazilian Mata Fina binder, with Nicaraguan filler from Esteli, Jalapa, and the island of Ometepe.',
    taste:
      'Sweet espresso moving toward salted caramel, with black pepper, florals, and a graham cracker finish. The draw is lush.',
    proof:
      "Cigar Aficionado's No. 21 cigar of 2020 for the Toro, at 93 points, with strength listed as medium.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'eab37de2-cee9-5b73-8517-48822c25b307',
    name: 'Plasencia Alma del Campo',
    brand: 'Plasencia',
    online: 18,
    why: 'A Nicaraguan from one of the great tobacco-growing families. Smooth, balanced, and medium.',
    story:
      'The Plasencia family has grown tobacco since 1865 and spent decades making cigars for other brands before putting their own name on one. This came out in 2017, built on tobacco from their first Nicaraguan farm in Jalapa. The box lid doubles as an ashtray.',
    leaf: 'All Nicaraguan, from the family farms, with a Habano wrapper from Jalapa.',
    taste:
      'Coffee, dark chocolate, toasted nuts, and sweet wood, with cream and a little spice. Cigar Aficionado found nougat, caramel, and nutmeg. The robusto runs about an hour and twenty-five minutes.',
    proof:
      'Cigar Aficionado scored the Tribu robusto 92 in 2023 and 90 in 2024. Cigar Dojo gave it 92.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'f38a786b-aef9-595a-bfdf-748d828d65c7',
    name: 'La Flor Dominicana Double Ligero',
    brand: 'La Flor Dominicana',
    online: 10,
    why: 'For the guest who wants the strongest stick in the room. Every reviewer calls it full. Best after a real meal.',
    story:
      'Litto Gomez started La Flor Dominicana in 1994, and his family runs both the farm and the factory in the Dominican Republic. This is their power cigar, out since 2003. Ligero is the strongest leaf, from the top of the plant, and this blend is loaded with it.',
    leaf: 'A dark sun-grown Ecuadorian Sumatra wrapper over Dominican binder and filler from the company farm, heavy in ligero.',
    taste:
      'Wood and sharp pepper early, black pepper with a cinnamon finish in the middle, and a strong leather core. Black cherry and coffee show up along the way.',
    proof:
      "The Chisel size was Cigar Aficionado's No. 7 cigar of 2005. Holt's staff scored it 93, The Cigar Authority gave it 92, and He Spoke Style rates its strength 5 out of 5.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '9a517310-2db5-52d7-bbb1-a3367dcd8d9c',
    name: 'Dunbarton Mi Querida',
    brand: 'Dunbarton',
    online: 12,
    why: "Steve Saka's broadleaf. Full in body and flavor, but easier on nicotine than it looks.",
    story:
      'From Steve Saka, the former Drew Estate man whose personal blend became Liga Privada No. 9. It came out in 2016 as the second line from his own company, rolled at the NACSA factory in Esteli. The name means my dearest, and in Nicaragua it is the word for a secret mistress.',
    leaf: 'A heavy Connecticut Broadleaf wrapper over Nicaraguan binder and filler.',
    taste:
      'Earthy and dense, with chocolate, coffee, and a little pepper. Damp earth leads over a cocoa sweetness, and red pepper builds toward the end. Lots of smoke and a long finish.',
    proof: "Cigar Coop scored it 93 twice. Cigar Dojo and Blind Man's Puff each gave it 90.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c5e74cdd-cec5-5c96-a013-250c69640d79',
    name: 'Padron 1926 Serie',
    brand: 'Padron',
    online: 18,
    why: 'The top of the regular Padron shelf. Stronger than the 1964, with a very long finish.',
    story:
      "Named for the year founder Jose Orlando Padron was born, and released in 2002 around his 75th birthday. It is box-pressed, made by the family in Esteli, Nicaragua, and Padron's most decorated regular line.",
    leaf: 'All Nicaraguan, with tobacco Padron says is aged at least five years.',
    taste:
      'Chocolate, coffee, nuts, and black cherry with a very long finish. The small No. 6 is all chocolate and espresso, with an earthy note to balance the sweetness.',
    proof:
      "Cigar Aficionado's Cigar of the Year for 2007, with 97 points for the No. 9. The No. 6 robusto scored 96 and was No. 4 of 2024.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'e8bb0428-04d1-5049-9aca-2f36fcf3270d',
    name: 'Arturo Fuente Fuente Fuente OpusX',
    brand: 'Arturo Fuente',
    online: 34,
    why: 'The famous hard-to-get Fuente. The story sells it as much as the strength.',
    story:
      'Carlito Fuente planted Cuban-seed wrapper at Chateau de la Fuente in 1991, when most people believed the Dominican Republic could not grow good wrapper leaf. The cigar came out in late 1995 and became a cult smoke almost at once. It is still hard to find.',
    leaf: 'All Dominican: wrapper, binder, and filler. The wrapper is Corojo seed from the Fuente farm.',
    taste:
      'Strong and polished. Baking spice, caramel, and cherry with a rum barrel finish. Leathery and spicy without being harsh.',
    proof:
      "Cigar Aficionado's Cigar of the Year for 2005 and again for 2023, when the Reserva d'Chateau scored 97. The Double Robusto was No. 2 of 2020 at 97.",
  },
  // The rest of each set's pool. These come up from the first Sunday change on.
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'cef5c017-15ed-564a-830f-271b29a6da30',
    name: 'J.C. Newman Perla del Mar',
    brand: 'J.C. Newman',
    online: 9,
    why: 'Mild, short, and inexpensive, with a soft box press. An easy first cigar that gets richer as it goes.',
    story:
      'Made by J.C. Newman at its PENSA factory in Nicaragua. The brand goes back to 1905, when four Cuban brothers began rolling cigars from tobacco grown on their family farm. The name means Pearl of the Sea.',
    leaf: 'An Ecuadorian Shade wrapper over aged Nicaraguan binder and long filler from four mountain regions.',
    taste:
      'Bread, straw, and lemon to start, growing richer with a caramel sweetness that carries into the finish. Toasted bread, peanuts, and cream along the way.',
    proof:
      "Cigar Aficionado gave the Shade Short Robusto 90 points in 2023. A blind panel at Blind Man's Puff scored the Shade Toro 88.",
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '910d2e6b-8f95-5ade-a5ef-e51d708e3993',
    name: 'Asylum Insidious',
    brand: 'Asylum',
    online: 9,
    why: 'A sweetened cap on a mild Connecticut wrapper. Built for beginners or anyone who wants a milder cigar.',
    story:
      'From Asylum Cigars, made in Honduras at a factory owned by Christian Eiroa. It was introduced at the 2014 IPCPR trade show in Las Vegas. What sets it apart is the sweetened cap.',
    leaf: 'An Ecuadorian Connecticut wrapper with a sweetened cap over Honduran binder and filler.',
    taste:
      'The sweet cap fades quickly into earth and a little nuttiness, then raisin and a slight maple note. A short finish and an even burn.',
    proof: 'The Cigar Authority scored the Robusto 88 in 2014 and called it a good beginner cigar.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '53fc3344-e99b-5ef2-a41c-0643257de86b',
    name: 'Macanudo Ecuadorian Shade',
    brand: 'Macanudo',
    online: 6,
    why: 'Very mild, sweet, and creamy. The smoother of the two new Macanudos and a good choice for a new smoker.',
    story:
      'A General Cigar brand, but unlike most Macanudos this one is handmade in Esteli, Nicaragua. It joined the core lineup in April 2026 alongside a Sumatra version, in three box-pressed sizes.',
    leaf: 'An Ecuadorian Shade wrapper over a U.S. Broadleaf binder, with Dominican Piloto Cubano and Nicaraguan fillers.',
    taste:
      'A sweet, creamy start with hints of mild spice. The sweetness fades early, and the creamy, lightly spiced profile holds to the end. The Robusto takes about 45 minutes.',
    proof: '',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '47863ce3-1791-5cac-9b9e-5d5f8016156e',
    name: 'Partagas Cortado',
    brand: 'Partagas',
    online: 8,
    why: 'A mild to medium Connecticut shade that suits a newer smoker. Go for the Toro.',
    story:
      "A General Cigar brand made at the STG Esteli factory in Nicaragua. Released in 2021, it is the first Partagas with a shade wrapper and the first made in Nicaragua. It steps away from the brand's dark, oily, and bold norm.",
    leaf: 'An Ecuadorian Connecticut Shade wrapper, an Indonesian binder, and fillers from Honduras, Mexico, and Nicaragua.',
    taste:
      'Sweet graham cracker up front with star anise and wood. Honey and vanilla turn creamy with an espresso note building, and it finishes dry and toasty.',
    proof:
      'Cigar Aficionado gave the Toro 90 points and put it on its list of ten milder cigars that scored 90 or higher.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '0e839dbe-5e95-5715-9a24-54651caa7ebd',
    name: 'Romeo Y Julieta 1875',
    brand: 'Romeo Y Julieta',
    online: 9,
    why: 'A name the occasional smoker already knows, and easy on the wallet. Mild to medium, nutty and a little sweet.',
    story:
      'The classic non-Cuban Romeo y Julieta, from Altadis U.S.A., rolled at Tabacalera de Garcia in the Dominican Republic. The 1875 in the name is the year the brand was founded.',
    leaf: 'An Indonesian shade-grown wrapper over Dominican binder and Dominican long filler.',
    taste:
      'Cedar and nuts over a sweet undertone of vanilla, cinnamon, and baked apple. Baking spices come in later, with a woodsy finish and a bit of bite at the end.',
    proof:
      "Cigar Aficionado scored the Bully 89 in 2023, and a blind panel at Blind Man's Puff gave the Bully 89 in 2015.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'd9f40162-0fe5-5c5b-99a7-af1d569fb38d',
    name: 'CAO Cameroon',
    brand: 'CAO',
    online: 10,
    why: 'A sweet Cameroon wrapper for a change from Connecticut. Medium, so it is a step up.',
    story:
      "CAO was launched in 1993 by Cano Ozgener, whose family company was known for Turkish handmade pipes. This line debuted in 1999 as L'Anniversaire. It is now made at STG Esteli in Nicaragua in box-pressed sizes.",
    leaf: 'An African Cameroon wrapper over Nicaraguan binder and filler.',
    taste:
      'Wood, salt, and peppered cream first, then sweet cocoa, roasted coffee, and toasted oak. It ends on dry toast, graham cracker, and baking spice. Mellow, with a good draw.',
    proof: "A blind panel of five at Blind Man's Puff scored the Robusto 93 in February 2024.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '17771a60-d7e5-5605-a6b7-ad7a2478f554',
    name: 'La Flor Dominicana Suave',
    brand: 'La Flor Dominicana',
    online: 8,
    why: 'The mildest La Flor, medium in body, with a story a regular will like. Woody and nutty with some sweetness.',
    story:
      'Litto and Ines Gomez founded La Flor Dominicana in 1994. They grow tobacco on their own farm in La Canela and roll in Tamboril. Suave descends from their very first cigar, rebuilt after 30 years and shown at the 2025 PCA show.',
    leaf: 'An Ecuadorian Corojo wrapper, a Mexican San Andres binder, and Dominican filler. There is also a Grand Maduro version.',
    taste:
      'Woody at first, then salt, earth, and nuts, with a hint of butterscotch on the finish. Medium-bodied and sweet overall, with notes of spice and cedar.',
    proof:
      'Cigar Aficionado gave the Suave Maceo 90 points in its April 2026 issue. The Grand Maduro No. 6 scored 92.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '8910520c-2fbe-5754-b7d7-0fb5a4cc7929',
    name: 'Punch Golden Era',
    brand: 'Punch',
    online: 11,
    why: 'A Honduran Corojo puro rolled by the Eiroas. Real craft, medium in strength, and a story for a regular.',
    story:
      "A General Cigar brand, rolled at the Eiroa family's Aladino factory in Danli, Honduras. It joined the regular Punch line in May 2023 to celebrate Corojo from the golden age of cigars. Julio R. Eiroa first grew this Corojo in 1997.",
    leaf: "All Honduran: a Cuban-seed Corojo wrapper and binder with Habano and Corojo filler, the Corojo from the Eiroa family's farm.",
    taste:
      'Caramel, nuts, honey, and leather first, then light brown sugar and cinnamon bread. It ends creamy with a butterscotch-like finish. The Robusto takes about 50 minutes.',
    proof:
      "A blind panel of four at Blind Man's Puff scored the Robusto 94. Cigar Aficionado gave the Churchill 90 in its May/June 2026 issue.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '9472e011-8281-5186-b1c8-b34c28efb496',
    name: 'Matilde Serena',
    brand: 'Matilde',
    online: 9,
    why: 'A boutique cigar from a famous blender that a regular may not know. Mild to medium, and best smoked slowly.',
    story:
      "Matilde was founded in 2013 by Jose Seijas, who had run Altadis's Dominican factory. Serena is made at Tabacalera Palma in Tamboril, Dominican Republic. It came out in 2016 as Matilde's first Connecticut-wrapped cigar.",
    leaf: 'An Ecuadorian Connecticut shade wrapper over a Dominican binder, with Dominican and Nicaraguan filler.',
    taste:
      'A mild start with light pepper, salty-sweet caramel, and roasted nuts, then leather and a cream soda note. Smoke it slowly and you get fig, honey, cashew, and oak.',
    proof:
      "A blind panel at Blind Man's Puff scored the Corona 90 in 2017. Cigar Dojo gave the Corona 90 in 2019 and called it a box worthy bargain.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'c3637ead-45b7-565a-80c9-4367977aa8f2',
    name: 'H. Upmann 1844 Classic',
    brand: 'H. Upmann',
    online: 8,
    why: 'Creamy and forgiving at about $8. Mild to medium, so it sits on the light side of the shelf.',
    story:
      'The non-Cuban H. Upmann sold in the US, made in Honduras at Flor de Copan for Altadis U.S.A. and blended by its Grupo de Maestros. It came out in 2021 as the first in the 1844 line with a Connecticut Shade wrapper.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper over Honduran binder and filler.',
    taste:
      'Creamy and nutty, with lemon, honey, pecan, and a touch of cedar. Almond butter and a peppery spice up front, vanilla cream in the middle, then leather and earth.',
    proof:
      "Cigar Aficionado gave the Robusto 90 points in 2021. A blind panel at Blind Man's Puff scored the Toro 93 in 2022.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'd29632ac-29f2-58f0-a3c9-b1eec77b3f09',
    name: 'Romeo Y Julieta 1875 Nicaragua',
    brand: 'Romeo Y Julieta',
    online: 9,
    why: 'A gentle way to try a Nicaraguan cigar without much pepper. Smooth and sweet, mild to medium.',
    story:
      'Made in Esteli, Nicaragua by the Plasencia family for Altadis U.S.A. It came out in 2018 as a Nicaraguan take on the Dominican-made 1875. The orange band sets it apart from the classic.',
    leaf: 'All Nicaraguan: a Habano wrapper over Nicaraguan binder and filler.',
    taste:
      'Smooth, with sweet cedar, honey, and citrus. Hay, white pepper, and cream early, then graham cracker and honey as the pepper fades, with baking spice at the end.',
    proof:
      "A blind panel at Blind Man's Puff scored the Toro 91, and Cigar Aficionado gave the Toro 89, both in 2019.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'afce7eda-9c13-59fe-bac0-e69dbd94b51b',
    name: 'AJ Fernandez New World Connecticut',
    brand: 'AJ Fernandez',
    online: 9,
    why: 'Creamy and gentle the whole way. Mild to mild-medium, which is good news for a new smoker.',
    story:
      "Made in Nicaragua at AJ Fernandez's own factory. The New World line is a team effort between A.J. and his father, Ismael. This is the second blend, released in 2015, and it is rolled round, not box-pressed like the original.",
    leaf: 'A Connecticut Shade wrapper grown in the United States over a Mexican San Andres binder, with Nicaraguan and Brazilian fillers.',
    taste:
      'Cream, nuts, cedar, and toast with a little pepper. Creamy butterscotch first, then dark toast, coffee, and cedar, with pecans and some spice at the end.',
    proof:
      'Cigar Coop scored the Corona Gorda 92 in 2015, and The Cigar Authority gave the Toro 90 in 2017.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'eb8800c5-c50c-5561-b742-c8c4f1aa01a7',
    name: 'Cohiba Red Dot',
    brand: 'Cohiba',
    online: 31,
    why: 'A splurge at about $31 for someone who knows the Cohiba name. A true medium, with pepper that builds.',
    story:
      'Made by General Cigar in the Dominican Republic. This is the original non-Cuban Cohiba, nicknamed Red Dot for the red dot inside the O on the band. It shares only a name with the Cuban Cohiba.',
    leaf: 'A Cameroon wrapper over an Indonesian Jember binder and Dominican Piloto Cubano filler.',
    taste:
      'Leather, oak, nuts, and honey first, then stronger pepper and wood with some chocolate in the middle. The pepper builds to a spicier finish with cedar, raisin, and coffee.',
    proof: "The Cigar Authority's blind panel scored the Robusto 90.44 in August 2024.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '0ffa886b-b98c-5c21-9e42-429a87cce96c',
    name: 'Punch Knuckle Buster Habano',
    brand: 'Punch',
    online: 5,
    why: 'A no-fuss Punch for about $5. Medium, with caramel, pepper, and almond. An everyday cigar.',
    story:
      'A General Cigar brand, handmade in Danli, Honduras. It came out in 2020 as a value-priced, everyday cigar, a hardworking blend for hardworking people. This is the original Knuckle Buster, and there are Maduro and Shade versions too.',
    leaf: 'A Nicaraguan Habano wrapper and binder over Nicaraguan and Honduran Habano filler.',
    taste:
      'Caramel, pepper, and almond. The almond gives way to earth, dark chocolate, and charred wood, with cream and coffee and a tangy citrus finish.',
    proof: 'Cigar Aficionado gave the Toro 89 in June 2021. Stogie Press scored the Toro 86.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '797fd189-e162-5fb2-a113-9f57cfe3bdc6',
    name: 'My Father La Gran Oferta',
    brand: 'My Father',
    online: 8,
    why: 'A well-known name at about $8 with plenty going on. Spicy and earthy, medium to medium-full.',
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua, with tobacco from their own farms. The name means the great offering. It came out in 2018, and the artwork follows an old cigar brand of the same name from around 1913.',
    leaf: 'An oily Ecuadorian Habano Rosado wrapper over Cuban-seed Nicaraguan binder and filler from the Garcia farms.',
    taste:
      'Spicy and earthy. Black pepper, almonds, and chocolate build to a salted-caramel finish. The early spice calms quickly into coffee and cream, with red pepper and charred oak late.',
    proof:
      "Cigar Aficionado gave the Robusto 91 in October 2019. A blind panel at Blind Man's Puff scored the Lancero 88.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '88dcb6dd-c782-5703-a52c-e640f6d9316e',
    name: 'Kristoff Sumatra',
    brand: 'Kristoff',
    online: 11,
    why: 'For someone who already smokes and likes spice with cocoa and espresso. Medium-full.',
    story:
      "Kristoff is Glen Case's brand, and the cigars are made in the Dominican Republic. The Sumatra came out in 2009. Like other Kristoffs, it has a pigtail cap and a closed foot.",
    leaf: 'An Ecuadorian Sumatra wrapper over a Brazilian binder, with Cuban-seed filler from the Dominican Republic and Nicaragua.',
    taste:
      'It opens with a blast of black pepper, then cocoa, espresso, leather, and earth. Sweet earth, cedar, and almond in the middle, ending on espresso, cocoa, and walnut. About 71 minutes.',
    proof: "A blind panel at Blind Man's Puff scored the Robusto 91 in 2021.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'b8bb7b14-b7c0-5db2-8258-2ea64c3e51a5',
    name: 'Perdomo Lot 23',
    brand: 'Perdomo',
    online: 9,
    why: 'An easy, cheap yes at about $9 with a good single-farm story. Earthy and nutty, medium-full.',
    story:
      "Made by the Perdomo family at Tabacalera Perdomo in Nicaragua. It is named for one family farm in Esteli, started in 2000, and all the tobacco in the blend is grown on that plot. Perdomo compares it to a winemaker's single-vineyard reserve.",
    leaf: 'All Nicaraguan: a Sun Grown wrapper over Cuban-seed binder and filler.',
    taste:
      'Earthy and nutty, with almond and cedar. Earth and spice up front lead to a coffee note in the middle, then a sweeter finish of brown sugar and nuts.',
    proof: 'Cigar Aficionado has given the Robusto 90 points three times: 2007, 2008, and 2019.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'c0339245-0ad1-5fdc-b7d3-bba1ce862c70',
    name: 'J.C. Newman Diamond Crown Julius Caeser',
    brand: 'J.C. Newman',
    online: 15,
    why: 'A Fuente-made luxury cigar with a great founder story. Medium from start to finish.',
    story:
      'A J.C. Newman brand made by the Fuente family in the Dominican Republic. It came out in 2010 to honor founder Julius C. Newman. An immigration officer misspelled his middle name as Caeser in 1888, and it stuck.',
    leaf: 'An Ecuadorian Havana-seed wrapper over a Dominican binder, with Caribbean and Central American filler.',
    taste:
      'Creamy cedar, leather, espresso, and earth with a touch of raisin sweetness. Coffee and wood trade places, and the wood turns to a sweet cedar spice.',
    proof:
      'Cigar Aficionado named the Robusto its No. 14 cigar of 2014 at 92 points and gave the Troublemaker 91 in 2025.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '368b894a-4b6b-5ae9-8540-1588405c0bb9',
    name: 'Fonseca by My Father',
    brand: 'Fonseca',
    online: 10,
    why: 'An old Cuban name remade by the Garcia family, with two top 25 nods in 2020. Medium to full.',
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Fonseca began as a Cuban brand in 1892, and the Garcias bought the trademark from the Quesada family in December 2019. Their version came out in August 2020.',
    leaf: 'All Nicaraguan: a shade-grown Corojo 99 Rosado wrapper over binder and filler, all grown by the Garcia family.',
    taste:
      'Gingerbread, toast, and a hint of red pepper in the Petit Corona. The Cedros brings leather, fruit, coffee, hazelnut, and oak, with vanilla and black coffee in the middle.',
    proof:
      "Cigar Aficionado ranked the Petit Corona No. 18 of 2020 at 93 points. Blind Man's Puff scored the Cedros 90 and ranked it No. 17 on its 2020 list.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '78463c04-b139-5e86-a806-ae532ab6da0f',
    name: 'Rocky Patel Sixty',
    brand: 'Rocky Patel',
    online: 17,
    why: 'Rich, aged, and award-winning at about $17. It runs above medium, medium-full to full.',
    story:
      'Made by Rocky Patel at his own factory in Esteli, Nicaragua. It was released in 2021 to mark his 60th birthday. The box-pressed cigars were already aged two years before release.',
    leaf: 'A dark Mexican San Andres wrapper over Nicaraguan binder and filler.',
    taste:
      'Rich and toasty, with dried herbs, ground black pepper, and an easy, open draw. Dark chocolate and black pepper first, then sweet tobacco, cocoa, and leather.',
    proof:
      "Cigar Aficionado named the 6 x 60 Sixty its No. 2 cigar of 2022 at 96 points and gave the Robusto 91. A blind panel at Blind Man's Puff scored the Toro 90.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'b6715b0f-2d52-5243-995e-12fa8e2887c5',
    name: 'Rojas Street Tacos Barbacoa',
    brand: 'Rojas',
    online: 9,
    why: 'A small-batch boutique cigar with a food-truck theme, about $9. Medium to full, and it opens with hot pepper.',
    story:
      'From Rojas Cigars, the brand of Noel Rojas, handmade at a small factory in Esteli, Nicaragua. It is the first blend in the Street Tacos series, released in March 2021 and inspired by tacos sold from food trucks and street carts.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder and Nicaraguan filler from the Somoto region.',
    taste:
      'It opens with hot pepper, butter, wood, and leather, with a sugary sweetness that fades toward dark chocolate. Then it turns woodier, with coffee and spice at the end.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '0b417961-d8dc-5df7-a854-b77123d87fc3',
    name: 'Matilde Renacer',
    brand: 'Matilde',
    online: 9,
    why: 'The comeback cigar of Jose Seijas, the man linked to Montecristo and H. Upmann at Altadis. Get the Corona.',
    story:
      'Jose Seijas started Matilde with his sons after retiring from Altadis, where he is linked to Montecristo and H. Upmann. The cigars are made in the Dominican Republic. Renacer means rebirth, and it was the first release, in early 2014.',
    leaf: 'An Ecuadorian Habano wrapper over a Dominican binder, with mostly Dominican filler and some Nicaraguan.',
    taste:
      'Rich earth, cocoa, and spice. The Corona shows hearty coffee bean, cedar, subtle chocolate, and toffee, with a refined cocoa finish.',
    proof:
      'Cigar Aficionado gave the Corona 91 in 2014. Cigar Dojo scored the Corona 93 percent in 2015.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'd17f47df-cab9-52b6-8997-9b040afb81dc',
    name: 'Padron Series 2000',
    brand: 'Padron',
    online: 9,
    why: 'Rich but not heavy, medium to medium-full. A well-made step up for a newer smoker at about $9.',
    story:
      'Made by the Padron family at their Tabacos Cubanica factory in Esteli, Nicaragua. Jose Orlando Padron started the company in Miami in 1964 with about $600 saved from carpentry work. The 2000 is the robusto in the original core line.',
    leaf: 'All Nicaraguan: a sun-grown wrapper in natural or maduro over Nicaraguan binder and filler, aged 2.5 years.',
    taste:
      'The maduro opens with pepper and spice, then settles into coffee, cedar, earth, and cocoa. The natural is sweeter, with raisin, caramel, wood, and nuts. The maduro is the fuller of the two.',
    proof:
      'Cigar Aficionado gave the 2000 Maduro 92 points in April 2023. The Cigar Authority gave the Natural 92, and Cigar Dojo scored the Maduro 91.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'c81e50ca-3776-5c6e-ad7c-4d4abf6a1c67',
    name: 'My Father Flor de Las Antillas',
    brand: 'My Father',
    online: 9,
    why: 'The gentlest of the Garcia cigars and a No. 1 cigar of the year. Medium, smooth, and light on pepper.',
    story:
      'Made by the Garcia family in Esteli, Nicaragua. The name means flower of the Antilles, a nickname for Cuba, and the box art updates a label from the early 1900s. It came out in 2012 as the first My Father line to be entirely box-pressed.',
    leaf: 'All Nicaraguan: an oily, reddish-brown sun grown wrapper over Nicaraguan filler and the double binder the Garcias are known for.',
    taste:
      'Leather, espresso, wood, and nutmeg to start, with a little pepper that fades fast. Then it turns sweeter and stays smooth to the end.',
    proof:
      "Cigar Aficionado named the Toro its No. 1 cigar of 2012 with 96 points. Holt's ranks the line fifth on its top 10 medium-bodied list.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '502b623a-3892-5125-bbb1-98c623ecca71',
    name: 'J.C. Newman Brick House Maduro',
    brand: 'J.C. Newman',
    online: 9,
    why: 'A dark, low-cost maduro that works for a novice. Medium-full, with cocoa and a little red pepper.',
    story:
      'Made by J.C. Newman at PENSA, its Nicaraguan factory. The name honors the childhood home in Hungary of founder Julius Caeser Newman, and the company brought it back in 2009. The Maduro arrived in 2012 under a darker wrapper.',
    leaf: 'A dark Brazilian Arapiraca maduro wrapper over Nicaraguan binder and filler.',
    taste:
      'Cocoa and natural tobacco up front with red pepper and cedar, then charred oak and bittersweet chocolate. Medium in the first half and fuller in the second.',
    proof: 'Cigar Aficionado gave the Toro 91 points. Cigar Coop scored the Toro 89.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '015aa00c-0501-55c6-9f1a-bfa95b13dab4',
    name: 'CAO Brazilia',
    brand: 'CAO',
    online: 10,
    why: 'A long-running, well-liked dark cigar. Medium-full, and it opens peppery before it mellows.',
    story:
      'A CAO cigar, now part of General Cigar, made in Honduras. It launched in 2001, when most makers hid their Brazilian leaf. CAO did the opposite and put Brazil in the name and the flag colors on the box.',
    leaf: 'A dark, oily Brazilian Arapiraca wrapper over Nicaraguan binder and filler.',
    taste:
      'It starts out strong and peppery, then mellows to a woody smoke with some wine notes. Toasty, earthy, nutty, and floral along the way.',
    proof:
      'Cigar Aficionado gave the Corcovado 88 points in February 2017, and Cigar Dojo scored the Gol 86.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'aa7b6b2c-172a-53a3-871a-17191942975e',
    name: 'CAO Flathead',
    brand: 'CAO',
    online: 10,
    why: 'Dark, rich, and sweet-leaning, with a big award behind it. Full, so not a first cigar.',
    story:
      'A CAO cigar from General Cigar, made in Nicaragua at STG Esteli. It came out in 2013 as a hot-rod tribute: sharply box-pressed with a flat head like an engine block. Each size is named for an engine part, and the box looks like an engine.',
    leaf: 'A Connecticut Broadleaf wrapper and a Cuban-seed Connecticut Habano binder over Nicaraguan and Dominican Piloto Cubano ligero.',
    taste:
      'It takes off with ripe fruit, leather, and molasses that gain intensity as it smokes. Spice, cedar, and cream early, with espresso and sugarcane after the halfway point.',
    proof: 'Cigar Aficionado ranked the V660 Carb No. 3 on its Top 25 of 2015 with 95 points.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'ac6c03b6-7778-56f4-9a17-73615f9ad7bf',
    name: 'Montecristo 1935 Anniversary Nicaragua',
    brand: 'Montecristo',
    online: 14,
    why: 'A famous name with big awards and rich coffee and chocolate notes. Medium to full, depending on the size.',
    story:
      "Made for Altadis U.S.A. by A.J. Fernandez at his San Lotano factory in Ocotal, Nicaragua. It was created with Rafael Nodal to mark Montecristo's 85th anniversary in 2020. The brand began in Cuba in 1935.",
    leaf: "All Nicaraguan wrapper, binder, and filler, grown on A.J. Fernandez's farms.",
    taste:
      'Spicy and earthy with leather and red pepper, then sweeter coconut and malted milk before a woody finish. The Churchill is medium and led by coffee. The Demi smokes in under an hour.',
    proof:
      'Cigar Aficionado ranked it No. 2 cigar of the year twice: the No. 2 size in 2021 with 95 points and the Espeso in 2024 with 97.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '285ebd15-4247-59ca-b3cb-926d7702ee97',
    name: 'AJ Fernandez Enclave Broadleaf',
    brand: 'AJ Fernandez',
    online: 9,
    why: 'A dark, affordable broadleaf from a big-name maker. Medium-full, with earth and sweet chocolate.',
    story:
      "A.J. Fernandez's own brand, made at his factory in Nicaragua and blended with his father Ismael. It came out in 2017 as the dark follow-up to the original Enclave. It was the first time he put a broadleaf wrapper on one of his own cigars.",
    leaf: 'A Connecticut Broadleaf wrapper over Nicaraguan binder and filler.',
    taste:
      'Earth, mineral, and salt before sweet turns of milk chocolate, vanilla bean, and anise. The Robusto adds coffee, leather, and a honey-like sweetness, with a peppery final third.',
    proof: 'Cigar Aficionado ranked the Churchill No. 19 on its Top 25 of 2019 with 92 points.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '15c3edf8-6258-59ad-bd6e-7aee456cedca',
    name: 'Perdomo 20th Anniversary Maduro',
    brand: 'Perdomo',
    online: 12,
    why: 'Strong but smooth, with chocolate and espresso. Medium-full, and best for someone who already smokes.',
    story:
      "Made by Tabacalera Perdomo in Nicaragua and blended by founder Nick Perdomo. It was created for Perdomo's 20th anniversary and first shown in 2012. It is box-pressed, comes in big ring gauges, and its wrapper spends time in bourbon barrels.",
    leaf: 'All Nicaraguan, Cuban-seed leaf. The 8-year-old maduro wrapper is aged another 14 months in bourbon barrels.',
    taste:
      'Chocolate, leather, and cinnamon before lighting. Cuban coffee with cream in the middle, then leather, earth, and wood with a creamy espresso finish. Spice takes over late without turning harsh.',
    proof:
      "The Cigar Authority's blind panel scored the Epicure 90.13 in March 2025. Cigar Coop gave the Robusto 88.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '4a34b95a-d703-5def-935b-9b587664e9c9',
    name: 'La Aroma De Cuba Pasión',
    brand: 'La Aroma De Cuba',
    online: 13,
    why: 'A rich, well-made Garcia smoke at a fair price. Leathery and spicy, medium to medium-full.',
    story:
      'An Ashton brand made by the Garcia family at My Father Cigars in Esteli, Nicaragua. It launched in 2021 as the first all-Nicaraguan cigar under the La Aroma de Cuba name. The blend took two years to get right.',
    leaf: "All Nicaraguan, from the Garcia family's farms. The wrapper is Cuban-seed leaf grown under shade in Namanji.",
    taste:
      'Leathery and spicy, with minerals, a sweet hint of cinnamon, and a cedary finish. Wood and a nougat-like sweetness lead, with smoked cashew, molasses, and pepper building.',
    proof:
      'Cigar Aficionado scored the Box-Pressed Torpedo 94 in February 2024 and ranked it No. 11 on its Top 25 of 2024.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '079935f2-b43e-5465-a78d-1a9c361c09db',
    name: 'My Father Jaime Garcia Reserva Especial',
    brand: 'My Father',
    online: 8,
    why: 'Dark, rich maduro flavor at a low price. It can smoke anywhere from medium to powerful.',
    story:
      "Made at My Father Cigars in Esteli, Nicaragua, and blended entirely by Jaime Garcia, son of Pepin Garcia and the company's master blender. It was the first line to carry his name, debuting at a New York City event in December 2009.",
    leaf: 'A dark Connecticut Broadleaf wrapper over Nicaraguan binder and filler.',
    taste:
      'It opens with black pepper, earth, and dark tobacco, moves to dark fruit and espresso, and ends with dried prunes and nutmeg. The Robusto takes about an hour and a half.',
    proof:
      "The Cigar Authority gave the Robusto 89 in February 2017, and Cigar Aficionado's Cigar Insider gave it 87 in June 2010.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '96a2e4c6-0c50-5595-a220-ec2277bbdcb4',
    name: 'Rocky Patel A.L.R. Second Edition',
    brand: 'Rocky Patel',
    online: 14,
    why: 'More dessert than power: chocolate, vanilla, and coconut. Medium to medium-full, with big rankings behind it.',
    story:
      'Made by Rocky Patel at his own TAVICUSA factory in Nicaragua. A.L.R. stands for Aged, Limited and Rare, and every cigar rests two years after rolling. It is a completely new blend, not a tweak of the 2018 First Edition.',
    leaf: "A Mexican San Andres wrapper over Nicaraguan binder and filler from Rocky Patel's farms in Esteli and Condega.",
    taste:
      'Malted chocolate, vanilla bean, and shredded coconut in the Toro. The Robusto opens bold and cedary with hints of chocolate, vanilla, and black licorice, and ends a little charry.',
    proof:
      'Cigar Aficionado ranked the Toro No. 5 of 2019 with 94 points and No. 4 of 2023 with 96.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'abb8768b-0226-5950-b345-f5654492c997',
    name: 'Ashton Virgin Sun Grown (VSG)',
    brand: 'Ashton',
    online: 16,
    why: 'A classic full-bodied benchmark with a long award record. Rich but balanced and refined, built for a regular.',
    story:
      "An Ashton brand made by the Fuente family in the Dominican Republic and blended by Carlito Fuente. It debuted in 1999 as Ashton's full-bodied line. The sizes have magic-themed names like Wizard and Sorcerer.",
    leaf: 'A sun-grown Sumatra-seed wrapper from a private estate in Ecuador over Dominican binder and filler aged four to five years.',
    taste:
      'Cedar, espresso bean, earth, black pepper, and leather with a strong finish. The Robusto adds oak, cocoa, and nuts with hints of red wine and molasses.',
    proof:
      'Cigar Aficionado gave the Robusto 92 points in 2018 and has put VSG sizes on its Top 25 seven times from 2004 to 2023, as high as No. 5 in 2007.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c49dade6-bef9-5a04-96a5-d6ed32af3fa3',
    name: 'My Father Le Bijou 1922',
    brand: 'My Father',
    online: 8,
    why: 'A Cigar of the Year winner that balances power and finesse. Rich, dark, and hearty.',
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Pepin Garcia created it to honor his father, Jose, born in 1922. Le Bijou is French for the jewel, and it is darker and stronger than the original My Father.',
    leaf: 'All Nicaraguan, with a dark Cuban-seed wrapper the Garcias call Habano Oscuro.',
    taste:
      'Starts sweet and woody, then picks up black pepper, nuts, and salt. Cherry-like sweetness and dark chocolate in the middle, with an earthy roasted coffee finish.',
    proof:
      'Cigar Aficionado named the Torpedo Box Pressed its No. 1 cigar of 2015 at 97 points. The Churchill was No. 7 in 2022, and The Cigar Authority gave the torpedo 93.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'a7ae5523-a578-5f41-b82a-2c2aa355636d',
    name: 'My Father The Judge',
    brand: 'My Father',
    online: 14,
    why: "Cigar Aficionado's 2024 Cigar of the Year. Bold but balanced, a full-bodied pick for a seasoned smoker.",
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. It came out in 2016 as a stronger take on the core My Father line, named for a judge who is a friend of the family. Every size is chunky and box-pressed.',
    leaf: 'A dark Ecuadorian Sumatra-seed wrapper over two Nicaraguan binders, Corojo and Criollo, and Nicaraguan filler from the Garcia farms.',
    taste:
      'Rich and complex. Spice, dark chocolate, and almonds early, then leather, cocoa, and coffee, ending on earthy wood and espresso.',
    proof:
      'Cigar Aficionado named the Grand Robusto its No. 1 cigar of 2024 at 98 points. The same size scored 93 and ranked No. 7 in 2017.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '6b9516e1-7bdb-56aa-b13c-910261cc243a',
    name: 'Don Pepin Garcia Original',
    brand: 'Don Pepin Garcia',
    online: 10,
    why: 'The foundation Pepin Garcia blend, full of his signature pepper and spice. Medium to full.',
    story:
      'From Jose "Pepin" Garcia and My Father Cigars, made at the My Father factory in Miami. Known as the Blue Label for its blue band, it is the foundation Pepin blend, and later Garcia hits grew from it.',
    leaf: 'All Nicaraguan, with a Habano Rosado wrapper over Nicaraguan binder and filler.',
    taste:
      'Bold and earthy at the start, with spice and cedar. It turns sweeter with chocolate and caramel, then ends peppery and leathery.',
    proof:
      "Cigar Aficionado's Cigar Insider gave the Generosos 90 in May 2014. The Cigar Authority gave it 92 in January 2016.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '0e934244-3796-54dd-a41e-56c674c6b1ca',
    name: 'Plasencia Alma Fuerte',
    brand: 'Plasencia',
    online: 23,
    why: 'A luxury Nicaraguan with real awards and a long, rich burn. Full in body, medium-full in strength.',
    story:
      'Made by Plasencia Cigars in Nicaragua. The family has grown tobacco for five generations and supplies leaf to much of the industry. Father and son Nestor and Nestor Andres launched Alma Fuerte in 2016. The name means strong soul.',
    leaf: 'All Nicaraguan wrapper, binder, and filler, from Esteli, Condega, Jalapa, and Ometepe.',
    taste:
      'Slow to warm up, then layers of cocoa powder, leather, and toast. Creamy and sweet with coffee and milk chocolate, and black pepper on the finish.',
    proof:
      'Cigar Journal named the Robustus I its No. 1 cigar of 2020. Cigar Aficionado ranked the Generacion V No. 9 of 2017 at 93 points, and Cigar Dojo gave the Nestor IV 93.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'bd90d3ec-24e9-5978-8c1f-a2e4d1bf0f82',
    name: 'Foundation Aksum',
    brand: 'Foundation',
    online: 16,
    why: 'A boutique blend with a story, for guests who know Foundation or AJ Fernandez. Medium to medium-full.',
    story:
      'A Foundation Cigar blend by founder Nick Melillo, made in Nicaragua at Tabacalera AJ Fernandez in Claro and Maduro. It launched in 2023 as Metapa and became Aksum in February 2024, same blend. Aksum was an ancient kingdom in what is now Ethiopia.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Connecticut Broadleaf binder and Nicaraguan filler from Esteli and Jalapa.',
    taste:
      'The Claro is sweet and spicy, with red pepper flake, cinnamon, vanilla, and coconut over coffee bean and earth. The Maduro is a bit stronger and spicier, with cedar, pepper, leather, and chocolate.',
    proof:
      "Cigar Aficionado ranked the Claro Robusto No. 12 of 2024 at 93 points. As Metapa Claro it was Cigar Dojo's No. 3 Cigar of the Year for 2023.",
  },
  // The rest of his Lounge list, checked the same way on 2026-11-13.
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '19769b64-77c0-5d94-bf44-bba0900913fc',
    name: 'AJ Fernandez Ramon Allones',
    brand: 'AJ Fernandez',
    online: 13,
    why: 'A dark, bold Nicaraguan with big scores and an old Cuban name. Medium to full.',
    story:
      'AJ Fernandez makes it at his factory in Nicaragua. General Cigar owns the old Cuban Ramon Allones name in the U.S. and handed both the making and the selling to Fernandez. It is known for its very dark wrapper.',
    leaf: 'A dark Nicaraguan Habano wrapper over a Nicaraguan Corojo 99 binder and Corojo 99 and Criollo 98 filler.',
    taste:
      'Chocolate, earth, dried fruit, cedar, and black pepper, getting fuller toward the end. Espresso, anise, and spiced cake show up too, with a dried cherry finish.',
    proof:
      "Blind Man's Puff's blind panel gave the Toro 94, and Cigar Coop named it its No. 4 cigar of 2018. Cigar Aficionado gave the Churchill 93 points in June 2026.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'd973eb64-5495-51c0-a1a1-2c6ba4e80928',
    name: 'AJ Fernandez San Lotano Requiem Habano',
    brand: 'AJ Fernandez',
    online: 9,
    why: 'An easy draw, caramel and vanilla sweetness, and a fair price. Medium to full.',
    story:
      "AJ Fernandez makes it in Nicaragua. San Lotano was his grandfather's Cuban label, and he brought it back in 2010 as his first line sold nationwide. This is the Habano blend.",
    leaf: 'A Cuban-seed Habano wrapper grown in Brazil over a Nicaraguan binder and filler from Nicaragua and Honduras.',
    taste:
      'Floral and woody on an easy draw, with touches of vanilla and toasted caramel. Coffee bean and nuts come through, with a hint of peanut on the finish.',
    proof: 'Cigar Aficionado gave the Churchill 91 points in February 2018 and 88 in August 2022.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'cf8d73b6-bba0-5422-af3f-a5c98867cccd',
    name: 'Alec Bradley Thirty Years',
    brand: 'Alec Bradley',
    online: 10,
    why: 'The new 2026 anniversary blend, picked by a father and his two sons. Medium to full.',
    story:
      "Made at Raices Cubanas in Honduras for Alec Bradley's 30th year. Founder Alan Rubin came back to help his sons, Alec and Bradley, pick the final blend. The company now belongs to Scandinavian Tobacco Group.",
    leaf: 'A Honduran wrapper from Trojes over two binders, one from Jamastran in Honduras and one from Jalapa in Nicaragua. Honduran and Nicaraguan filler.',
    taste: 'Balanced, with pepper, leather, cinnamon, and warm earth.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'ab862946-c816-5be3-a322-5f309ace5613',
    name: 'Arturo Fuente Añejo',
    brand: 'Arturo Fuente',
    online: 17,
    why: 'Rare, strong, and sweet from a Cognac barrel aged wrapper. A treat for a regular who wants power.',
    story:
      "Made by the Fuente family in the Dominican Republic. Carlito Fuente created it after Hurricane Georges wrecked the OpusX wrapper leaf in 1998, swapping in a dark broadleaf aged in Cognac barrels. It ships in small batches around Father's Day and Christmas.",
    leaf: 'A Connecticut Broadleaf maduro wrapper aged in Cognac barrels over Dominican binder and filler, with ligero normally kept for OpusX.',
    taste:
      'Bold and powerful. Sweet molasses and brown sugar up front, then earth, leather, and espresso with touches of anise and raisin. It turns earthier in the last third.',
    proof:
      'The Cigar Authority scored the No. 50 94 in 2018. Cigar Aficionado gave the No. 50 91 points in December 2025.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'ab875c46-f4bf-5bc2-be60-51b97d24117e',
    name: 'Arturo Fuente Chateau Fuente Maduro',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'A short, fair-priced Fuente maduro with dark chocolate sweetness. An easy pick for a casual smoker.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is the Chateau Fuente in a dark broadleaf wrapper, still dressed in its cedar sleeve. The filler blend is the same as the natural version.',
    leaf: 'A Connecticut Broadleaf maduro wrapper grown in the United States over Dominican binder and filler.',
    taste:
      'Approachable, with dark chocolate, molasses, and pepper. The smoke is meaty and rich with woody flavors and a slightly dry finish.',
    proof:
      'Cigar Aficionado gave the Chateau Fuente Maduro 88 points in August 2010. The longer Double Chateau Fuente Maduro scored 89 in April 2025.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'a6e7eaa5-d80e-5330-a319-9c955c2a320e',
    name: 'Arturo Fuente Chateau Fuente Sun Grown',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'A short Fuente at a fair price with a little spice. A safe crowd pleaser that scores 89 to 90.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is the Chateau Fuente in a darker Ecuadorian sun grown wrapper, still dressed in its cedar sleeve.',
    leaf: 'An Ecuadorian sun grown wrapper over Dominican binder and filler.',
    taste:
      'Tart wood early gives way to vanilla, orange peel, and clove. Cedar, espresso bean, and spice run through it with a hint of anise.',
    proof:
      'Cigar Aficionado gave the 4 1/2 inch Chateau Fuente Sun Grown 89 points in April 2026 and 90 in 2012.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '4c6af46c-c47f-532a-8c23-52d9adb00737',
    name: 'Arturo Fuente Curly Head',
    brand: 'Arturo Fuente',
    online: 3,
    why: 'The cheapest Fuente in the humidor, and a good everyday smoke.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is their budget lonsdale, rolled with medium-length filler instead of long filler. It comes in one size, 6 1/2 x 43.',
    leaf: 'A Connecticut Shade wrapper over Dominican binder and medium-length Dominican filler.',
    taste: 'Cream and spice.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'f0f12f02-f82e-5ff0-9771-ffe8cdde94f2',
    name: 'Arturo Fuente Don Carlos 90 Años',
    brand: 'Arturo Fuente',
    online: 22,
    why: 'A double-wrapped Don Carlos made as a tribute. Medium, woody, and a real story to tell.',
    story:
      "Carlito Fuente made it for what would have been his father's 90th birthday in 2025. A finished Don Carlos is aged a year, given a second wrapper of Dominican corojo from the family farm, then aged at least another year.",
    leaf: 'Two wrappers: African Cameroon underneath and Dominican corojo from Chateau de la Fuente on top, over Dominican binder and filler.',
    taste:
      'Deeply woody, with leather, walnut, anise, and a touch of black peppercorn. Medium, with an excellent draw and an even burn.',
    proof:
      'Cigar Aficionado gave the 5 3/4 x 47 size 91 points in 2026. Cigar Dojo named it its Unorthodox Cigar of the Year for 2025.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '6959bb2d-ead3-5f1f-a890-6a0dc5b50449',
    name: 'Arturo Fuente Don Carlos Personal Reserve',
    brand: 'Arturo Fuente',
    online: 25,
    why: "A pricey Don Carlos offshoot made for Carlos Fuente Sr.'s 80th birthday. Sweet, spicy, and medium.",
    story:
      "Made by the Fuente family in the Dominican Republic. It first shipped in 2015 for Carlos Fuente Sr.'s 80th birthday. It comes as a robusto and as the Eye of the Shark.",
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      'Baking spices, gingerbread, and cinnamon, with a nougat and tea-like finish. Well made, sweet, and spicy.',
    proof:
      'Cigar Aficionado gave the Robusto 91 points in 2017. The Eye of the Shark was its No. 1 cigar of 2017 at 97 points.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'c1ef5729-f4a2-5137-8b48-b6b7d6a018f9',
    name: 'Arturo Fuente Gran Reserva',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'The core Fuente. Smooth and gentle, mild to medium, and it burns well.',
    story:
      'Made by the Fuente family in the Dominican Republic. This is the core Fuente line, rolled with aged Dominican tobacco in classic sizes like the 8-5-8 and the Rothschild. It is one of the most popular Dominican lines of all time.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      'Wood and creamy vanilla early, then cocoa, almond, and coffee, ending on leather and caramel. Smooth all the way, with a great burn.',
    proof:
      "Cigar Aficionado gave the 8-5-8 87 points in April 2015. The Cigar Authority's blind panel scored the 8-5-8 Natural 88.75 out of 100 in 2024.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '327f37d8-5bea-584b-b5c2-fee3bca3c09c',
    name: 'Arturo Fuente Gran Reserva Candela',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'The mildest stick here, in a green wrapper. Grassy, easygoing, and a little sweet.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is the Gran Reserva in a green candela wrapper, which Fuente sells as Claro. Candelas were once common and now suit a smaller crowd who like the easygoing taste.',
    leaf: 'A green candela wrapper over Dominican binder and filler.',
    taste:
      'As grassy as the green wrapper suggests, and mild. Pine, wood, green tea, and buttered toast, with a touch of nut and honey sweetness.',
    proof: 'Cigar Aficionado gave the 8-5-8 Claro 89 points in October 2022.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '768afee0-a560-5fa9-91c7-f012807d4d23',
    name: 'Arturo Fuente Gran Reserva Maduro',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'A fair-priced maduro with cocoa and toffee sweetness. The short Rothschild just scored 90.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is the flagship Gran Reserva in a dark broadleaf wrapper, in the same core sizes as the natural version.',
    leaf: 'A Connecticut Broadleaf maduro wrapper grown in the United States over aged Dominican binder and filler.',
    taste:
      'Rustic looking but polished and toasty, with cocoa powder, roasted nuts, cinnamon, and toffee. A little black pepper comes before a dried fruit finish.',
    proof:
      'Cigar Aficionado gave the Rothschild Maduro 90 points in June 2026. The 8-5-8 Maduro scored 87 in October 2007.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '26994aeb-a8a2-50e5-8175-ffdbe38ebf3c',
    name: 'Arturo Fuente Gran Reserva Rosado Sun Grown',
    brand: 'Arturo Fuente',
    online: 10,
    why: 'One of the harder Fuentes to find, which regulars like. Chocolate, leather, and a perfect burn.',
    story:
      'Made by the Fuente family in the Dominican Republic. The 8-5-8 in this rosado wrapper first showed up in 2002 in a tiny run and came back in 2009 and 2018. It is one of the more rare and sought-after Fuentes.',
    leaf: 'An Ecuadorian rosado sun grown wrapper over Dominican binder and filler.',
    taste:
      'Hickory, red wine, and cocoa sweetness, with dark chocolate, leather, and bread. The burn is perfect.',
    proof:
      "Cigar Aficionado gave the 8-5-8 Sun Grown 92 points in December 2011. Blind Man's Puff's blind panel gave the 8-5-8 Rosado Sun Grown 88.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '61e33a5f-7f74-5443-afdd-d4ba7162369d',
    name: 'Arturo Fuente Hemingway',
    brand: 'Arturo Fuente',
    online: 8,
    why: 'The 4 inch Short Story is short, medium, well made, and a little sweet. A classy first cigar.',
    story:
      'Made by the Fuente family in the Dominican Republic. Carlos Fuente Jr. found old perfecto molds and brought the tapered shape back in 1983, when few factories still rolled it. Every size in the line is a perfecto.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      "The narrow foot lights slowly, then it opens up. Toasty and nutty, with almond paste, honey, and cream, plus baking spices, citrus, and Cameroon's sweet spice.",
    proof:
      'Cigar Aficionado gave the Short Story 92 points in April 2021 and 90 in February 2025. The Work of Art was its No. 6 cigar of 2018.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '9947701f-2260-53e9-b67f-259eca8c565a',
    name: 'Arturo Fuente Hemingway Best Seller',
    brand: 'Arturo Fuente',
    online: 9,
    why: 'A short, fat perfecto that keeps scoring 90 or 91. Sweet baking spice and an easy burn.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is a short, fat perfecto in the Hemingway series, which dates to 1983 and brought back the old tapered shapes.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      'Almonds, sweet baking spices, and candied orange peel, ending like gingerbread. Cappuccino and wood come through too, with a superb burn.',
    proof:
      "Cigar Aficionado gave the Best Seller 91 points in 2018 and 90 in 2022. It was the magazine's No. 12 cigar of 2005.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'be9e7fba-a1ab-50bc-b76e-c7cede5ffabd',
    name: 'Arturo Fuente Hemingway Classic',
    brand: 'Arturo Fuente',
    online: 13,
    why: 'A long, elegant perfecto with 92 point scores. For someone with time who likes subtle flavor.',
    story:
      'Made by the Fuente family in the Dominican Republic. It is the 7 inch perfecto in the Hemingway series, tapered at both ends, a shape that is hard to roll.',
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      'Elegant, toasty, and woody, with tea, cashew, and caramel. The draw starts firm and opens up into cedar, black tea, walnut, and vanilla.',
    proof:
      "Cigar Aficionado gave the Classic 92 points in 2010 and 2018. It was the magazine's No. 7 cigar of 2009.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '86a7572d-bee6-5c50-abd2-1ba9c80a33ff',
    name: 'Arturo Fuente Hemingway Maduro',
    brand: 'Arturo Fuente',
    online: 9,
    why: 'A famous Fuente shape in a dark, chocolatey wrapper. Steady 90 and 91 scores make it a safe pick.',
    story:
      'Made by the Fuente family at Tabacalera A. Fuente in the Dominican Republic. It is the Hemingway perfecto, tapered at both ends, in a dark Connecticut Broadleaf wrapper instead of the usual Cameroon. The Untold Story size comes only in this maduro.',
    leaf: 'A dark Connecticut Broadleaf maduro wrapper grown in the United States over Dominican binder and filler.',
    taste:
      'Rich and earthy, with semisweet chocolate, coffee bean, and molasses, and a woody, nutty finish. The burn can start uneven and straightens out past the tapered foot.',
    proof:
      'Cigar Aficionado scored the Short Story Maduro (4 x 49) 91 points in December 2022 and 90 in April 2020.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '97c262f7-5739-5f6e-8edf-7f7cf50008ed',
    name: 'Arturo Fuente Hemingway Signature',
    brand: 'Arturo Fuente',
    online: 12,
    why: 'A true medium from a name most smokers know. Woody and lightly spiced, with 92 point scores.',
    story:
      "Made by the Fuente family at Tabacalera A. Fuente in the Dominican Republic. The Signature is the 6 inch perfecto in the Hemingway series, long and slim with a small nipple at the foot. Sister sizes have made Cigar Aficionado's Top 25 three times.",
    leaf: 'An African Cameroon wrapper over Dominican binder and filler.',
    taste:
      'Mostly woody, with touches of nutmeg and citrus. Cedar and spice, with chestnut, cocoa powder, molasses, and cinnamon.',
    proof: 'Cigar Aficionado gave the Signature (6 x 46) 92 points in June 2024 and December 2019.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '593060cc-7794-598e-b024-c8bfec689170',
    name: 'Arturo Fuente Rare Pink',
    brand: 'Arturo Fuente',
    online: 14,
    why: 'Limited, hard to find, and it comes with a real story. Two Cigar Aficionado Top 25 finishes back it up.',
    story:
      'Made by the Fuente family in the Dominican Republic and launched in late 2020. Liana Fuente led the project to raise money for breast cancer research, and part of every box sold goes to the cause. The perfecto shapes come from the Hemingway line.',
    leaf: 'An Ecuadorian Habano wrapper over a Dominican binder and Dominican and Nicaraguan filler.',
    taste:
      'Coffee, cedar, and natural tobacco, with dark chocolate and molasses. Black pepper builds toward the end.',
    proof:
      'Cigar Aficionado ranked the Happy Ending No. 10 of 2021 at 93 points and the Sophisticated Hooker No. 10 of 2022. It gave the Signature (6 x 46) 91 in August 2025.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'a6882f42-da21-5cf9-b0e5-6e03c1cf42ff',
    name: 'Arturo Fuente Rosado Sungrown Magnum R',
    brand: 'Arturo Fuente',
    online: 11,
    why: 'Smooth, sweet, and well made, at a balanced medium. The 44 is a short size.',
    story:
      'Made by the Fuente family in the Dominican Republic and released in December 2009. Carlos Fuente Jr. built it as a step away from the trend toward strong cigars, balanced and elegant. The Vitola Forty-Four is named for the 44 cigars in its box.',
    leaf: 'An Ecuadorian rosado sun grown wrapper from the lower leaves of the plant, aged eight to ten years, over Dominican binder and filler.',
    taste:
      'Rich wood and leather with hints of vanilla and coffee bean and a caramel finish. Sweeter early, more cedar and pepper at the end. The robusto runs about an hour and a half.',
    proof:
      'Cigar Aficionado ranked the Vitola Forty-Four No. 5 of 2012 and No. 6 of 2016, both at 94 points. The Cigar Authority gave the R44 93 in May 2018.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '9099b024-67c1-5204-93f7-3f5b47db7d5b',
    name: 'Ashton Aged Maduro',
    brand: 'Ashton',
    online: 13,
    why: 'Dark, sweet, and smooth, at a medium strength. For the guest who asks for a maduro.',
    story:
      "Ashton's maduro line, made for the Philadelphia company by the Fuente family at Tabacalera A. Fuente in the Dominican Republic. The broadleaf wrapper is fermented slowly. Not overly complex, but rich, with standout natural sweetness.",
    leaf: 'A Connecticut Broadleaf maduro wrapper grown in the United States over Dominican binder and filler.',
    taste:
      'Sweet and cocoa-forward. Dark chocolate, almond, maple, and molasses, with spicy cocoa, wood, and a little black pepper.',
    proof: 'Cigar Aficionado gave the No. 30 (6 3/4 x 44) 89 points in April 2017.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '05c9bbb3-a841-53f7-80de-32f5304cd122',
    name: 'Asylum 13',
    brand: 'Asylum',
    online: 10,
    why: 'Full strength and built for seasoned smokers. Known for its huge ring gauges.',
    story:
      "The flagship Asylum blend from Tom Lazuka and Christian Eiroa, the former owner of Camacho, launched in 2012. It is rolled in Nicaragua and best known for very thick sizes like 7 x 70 and 8 x 80. It is the company's fullest blend.",
    leaf: 'All Nicaraguan: a dark Habano wrapper over Nicaraguan binder and filler.',
    taste:
      'Opens with a blast of pepper, then cocoa, leather, and earth. Chocolate and pepper carry to the end, with toasted almond and citrus at the finish.',
    proof:
      'Cigar Coop scored the Robusto (5 x 50) 90 in January 2013, and The Cigar Authority scored the same size 90 in December 2016.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '4f5ae0ae-18b0-5e09-acf9-b82e736548e4',
    name: 'Asylum 13 Medulla',
    brand: 'Asylum',
    online: 11,
    why: 'Medium, bright, and easy to like. More about flavor than strength, for novice or veteran.',
    story:
      "The round version of Asylum's Medulla Oblongata blend, launched in 2017 by Tom Lazuka under Christian Eiroa's CLE Cigar Co. and made at El Aladino in Honduras. Boxes came half round and half box pressed, so smokers could compare one blend in two shapes.",
    leaf: 'All Honduran: a high-priming Corojo wrapper from the Eiroa family farm over Honduran binder and filler.',
    taste:
      'Bright and lively. Cedar, citrus, and sourdough with a graham cracker sweetness, plus fig, caramel, and earth. The robusto runs about 1 hour 10 minutes.',
    proof:
      'The Cigar Authority gave the Robusto (5 x 50) 91 in September 2017, and Cigar Dojo gave the blend 91 that December.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'e3897e52-e722-5d1f-b9a2-a896a1de045e',
    name: 'Asylum 13 Medulla Maduro',
    brand: 'Asylum',
    online: 11,
    why: 'Earthy, leathery, and a bit gritty. One for people who like a stronger stick.',
    story:
      "The maduro follow-up to Asylum's Medulla, made by CLE Cigar Co. at the El Aladino factory in Danli, Honduras. It swaps the Corojo wrapper for a dark Mexican San Andres leaf. Medulla is the round shape, and the box pressed twin is called Oblongata.",
    leaf: 'A Mexican San Andres maduro wrapper over Honduran Corojo binder and filler.',
    taste:
      'Starts with citrus and cedar and a sweet, dark chocolate note, then turns earthy. It finishes long with leather and a little red pepper.',
    proof:
      'The Cigar Authority gave the round Robusto (5 x 50) 89 in January 2020. Cigar Dojo gave the box pressed Oblongata Maduro, the same blend, 87 in February 2019.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '689cfa53-8072-53bc-9bda-82fae19ef99e',
    name: 'Asylum Insidious Maduro',
    brand: 'Asylum',
    online: 9,
    why: 'A sweetened tip and medium strength make it a friendly first dark cigar.',
    story:
      "The maduro version of Asylum Insidious, made in Honduras by Christian Eiroa's CLE Cigar Co. and released in 2015. It keeps the same Honduran blend under a Mexican San Andres wrapper. Like the original, the cap is sweetened.",
    leaf: 'A Mexican San Andres maduro wrapper over Honduran binder and filler.',
    taste:
      'The sweet tip fades early into earth and coffee. Maple shows up in the middle, and it ends with chocolate and roasted nuts. A bit stronger than you would expect from a sweet tip.',
    proof: 'The Cigar Authority scored the Toro (6 x 52) 89 in March 2015.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '4c7aaa00-4303-57c0-a5eb-2ca1f21fa58e',
    name: 'C.L.E. Habano',
    brand: 'C.L.E.',
    online: 10,
    why: 'A cedary, medium Honduran smoke from Christian Eiroa, the man who once owned Camacho.',
    story:
      'Part of the core line from Christian Eiroa, who once owned Camacho and now runs CLE Cigar Co. in Honduras. This is the Habano wrapped member of the family. It comes in his signature 11/18 shape, which bulges in the middle, as well as regular sizes.',
    leaf: 'A Honduran Habano wrapper over a Honduran binder, with Honduran leaf in the filler.',
    taste:
      'Tangy and cedary with floral notes, a touch of oaky white wine, and an herbal finish. Creamy cedar and baking spice show up too.',
    proof: 'Cigar Aficionado gave the 11/18 (6 1/4 x 54) 87 points in October 2018.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'c3a7938b-dda7-5c05-8aa8-897dc49bdc1d',
    name: 'CAO America',
    brand: 'CAO',
    online: 10,
    why: 'The striped wrapper gets attention, and the smoke is an easy medium.',
    story:
      'A CAO cigar from 2007 with a barber pole look: dark Connecticut Broadleaf with a pinstripe of lighter Connecticut Shade, both grown in the United States. The band is red, white, and blue. The filler is all ligero from four countries.',
    leaf: 'Two American wrappers, Connecticut Broadleaf with a Connecticut Shade stripe, over a Brazilian binder. Filler from the Dominican Republic, Italy, Nicaragua, and the United States.',
    taste:
      'Woody and toasty, with pecan and warm apple pie, hints of coffee, and a floral finish. Leather, chocolate, and cedar round it out.',
    proof:
      'Cigar Aficionado gave the Monument torpedo (6 1/4 x 54) 90 points in October 2021 and 88 in August 2022.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'eee34c62-b253-5a62-8839-2389d3f47426',
    name: 'CAO Arcana Thunder Smoke',
    brand: 'CAO',
    online: 12,
    why: 'One for the curious: a rare all-African filler from Cameroon, South Africa, and Zimbabwe.',
    story:
      "The third release in CAO's Arcana series, shipped in 2024 and made at General Cigar Dominicana in the Dominican Republic. The filler is all African leaf. The name comes from the local name for Victoria Falls, the smoke that thunders.",
    leaf: 'A Honduran Olancho San Agustin wrapper over a Mexican San Andres binder. The filler is from Cameroon, South Africa, and Zimbabwe.',
    taste: 'Cocoa, cedar, and fruit to start. It turns earthy and musty, with more pepper late.',
    proof: '',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '78747b81-025c-57a3-b719-13533b2ab32a',
    name: 'CAO BX3',
    brand: 'CAO',
    online: 9,
    why: 'Brazilian leaf three ways, with chocolate and citrus. Well built and an easy medium, so it is low risk.',
    story:
      "A CAO line from 2022, rolled at STG Esteli in Nicaragua. The name stands for Brazil times three, because Brazilian leaf is in the wrapper, the binder, and the filler. It follows CAO's earlier Brazilia and Amazon Basin.",
    leaf: 'A Brazilian Mata Fina wrapper over a Brazilian Arapiraca binder. The filler mixes Brazilian Mata Fina with leaf from Honduras, Mexico, and Nicaragua.',
    taste:
      'Citrus and milk chocolate with a little bitter espresso, then oak late. Earth, wood, hay, and pepper too. The robusto runs about an hour and a half.',
    proof:
      "The Blind Man's Puff panel scored the Robusto 88 in May 2023. Cigar Coop and Cigar Dojo each gave it 86.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '93a79a47-4593-5e16-b64e-84437a133689',
    name: 'CAO FASA Noche',
    brand: 'CAO',
    online: 6,
    why: 'A well-built dark cigar for little money. Medium, and peppery rather than sweet.',
    story:
      "The night half of CAO's value-priced FASA series, launched in 2024 next to FASA Sol and rolled at STG Esteli in Nicaragua. The two share a binder and filler and differ only in the wrapper, so you can taste what the wrapper does.",
    leaf: 'A dark Connecticut Broadleaf wrapper over a Cameroon binder, with Dominican Piloto Cubano and Nicaraguan filler.',
    taste:
      'Strong red pepper to start, then musty and salty, with little of the usual broadleaf sweetness. It burns slow and even.',
    proof: 'Cigar Dojo scored the Toro (6 x 50) 87 in September 2024.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '5a899df0-00f4-5320-a30a-c24d031bb393',
    name: 'CAO FASA Sol',
    brand: 'CAO',
    online: 6,
    why: 'An easy, low-cost medium cigar from a name people know, with a Honduran wrapper.',
    story:
      "The day half of CAO's value-priced FASA series, introduced in 2024 next to FASA Noche and made in Honduras. Same binder and filler as Noche, different wrapper: the Honduran Olancho San Agustin leaf CAO first used on OSA Sol.",
    leaf: 'A Honduran Olancho San Agustin wrapper over a Cameroon binder, with Dominican Piloto Cubano and Nicaraguan filler.',
    taste: 'Cinnamon, toast, almonds, and spice. Balanced and complex, with a smooth wrapper.',
    proof: '',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '0d3a2d20-ccd8-5b11-b216-77f88562d70a',
    name: 'CAO FASA Sombra',
    brand: 'CAO',
    online: 6,
    why: 'The shade-wrapped, gentlest FASA, and easy on the wallet. Butter, cream, and almond.',
    story:
      "The third and last blend in CAO's FASA series, added in April 2025 and made in the Dominican Republic. Sombra is Spanish for shade. It puts an Ecuadorian shade-grown wrapper on the same binder and filler as FASA Sol and Noche.",
    leaf: 'An Ecuadorian shade-grown wrapper from Connecticut seed over a Cameroon binder, with Dominican Piloto Cubano and Nicaraguan filler.',
    taste: 'Butter, hay, cream, and almond. Smooth yet layered, and on the mild side.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'aaedc485-381a-59e3-a479-63948f6994aa',
    name: 'CAO Flathead Speed Shop',
    brand: 'CAO',
    online: 9,
    why: 'The tamer, everyday Flathead. Medium bodied and steady, box pressed in big sizes.',
    story:
      "CAO's 2026 addition to its car-themed Flathead family, box pressed with the flat head the line is named for. It trades the original's broadleaf wrapper for Ecuadorian Habano and is the everyday, medium-bodied Flathead.",
    leaf: 'An Ecuadorian Habano wrapper over a Mexican San Andres binder, with Nicaraguan and Dominican filler.',
    taste:
      'Medium bodied and steady. Mostly leather from start to finish, with earth, hay, dried wood, and nuts, and a very good draw.',
    proof:
      "Cigar Czars rated the V654 Crankshaft 3.75 out of 5. The original Flathead V660 Carb, a different blend, was No. 3 on Cigar Aficionado's Top 25 of 2015.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'd28b5358-9a14-52b2-9f2b-af356031e1ae',
    name: 'CAO Flathead Steel Horse',
    brand: 'CAO',
    online: 9,
    why: 'A well-known name at a fair price with real kick. Cocoa, leather, and pepper.',
    story:
      'A motorcycle-themed spin-off of CAO Flathead that came out in 2015, made at STG Esteli in Nicaragua. It keeps the flat head but uses its own blend, and the sizes carry biker names like Apehanger and Bullneck.',
    leaf: 'A Connecticut-grown Habano wrapper over a Brazilian Arapiraca binder, with Dominican, Honduran, and Nicaraguan filler.',
    taste:
      'Cocoa, creamy smoke, leather, and white pepper to start. The middle turns to leather, pepper, and roasted walnut, and it ends on dry cocoa and nuts as the strength climbs.',
    proof: "Blind Man's Puff's blind panel scored the Apehanger 93 in December 2015.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c9806106-0463-5f07-9758-0c8934eb7207',
    name: 'CAO Flathead V23',
    brand: 'CAO',
    online: 13,
    why: 'A big, strong limited edition with a Le Mans racing story. One for a regular smoker.',
    story:
      'A 2023 limited edition Flathead made to mark 100 years of the 24 Hours of Le Mans, with a box modeled on the Ford GT40. It comes in one size, a box-pressed 6 x 60.',
    leaf: 'A Honduran Jamastran wrapper over a Nicaraguan Habano binder, with filler from Brazil, Honduras, and Nicaragua.',
    taste:
      'A full-bodied powerhouse, medium to full in strength. Earthy and nutty, with raisin and pepper.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'c1a5ffce-99a4-5ece-b7e9-4156d16bad5c',
    name: 'CAO Italia',
    brand: 'CAO',
    online: 12,
    why: 'Sweet, spicy, and even-burning, with a fun Italian tobacco story. Medium in strength.',
    story:
      "Part of CAO's World series, where each cigar features tobacco from a different country. This one is built around Habano-seed leaf grown in the Benevento region of southern Italy, and the sizes have Italian names like Ciao and Gondola.",
    leaf: 'A Honduran wrapper and binder over filler from Italy, Nicaragua, and Peru.',
    taste:
      'Cedar and spice backed by sweet caramel, fruit, and baked apple. A little espresso bean and pepper, and a sweet, lingering finish. It burns even.',
    proof: 'Cigar Aficionado gave the Gondola 91 points in December 2024.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '0bf86ae0-d85c-5916-bba7-08ae4be36d3d',
    name: 'CAO Zócalo',
    brand: 'CAO',
    online: 9,
    why: 'Earthy, peppery, and rich for under $10. Medium-full, with a Mexican wrapper.',
    story:
      "CAO's first cigar with a Mexican wrapper, named for the main square of a Mexican city. It started as a limited 6 x 60 in 2018 and became a regular line in 2021. It is made at STG Esteli in Nicaragua.",
    leaf: 'A Mexican San Andres wrapper over a Cameroon binder, with Nicaraguan filler.',
    taste:
      'Opens with earth, leather, and pepper. Cedar, roasted caramel, and mocha come in through the middle, and it ends on leather and mocha as the pepper fades.',
    proof:
      "Blind Man's Puff's blind panel scored the Robusto 91 in September 2021. Cigar Aficionado gave the original 6 x 60 size 89 points in 2018.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '31c4a8a2-79d6-52eb-976a-b1ea6a2a9d6e',
    name: 'Cohiba Blue',
    brand: 'Cohiba',
    online: 16,
    why: 'The Cohiba name at the lowest Cohiba price. Leather, earth, and pepper, medium to medium-full.',
    story:
      'The everyday Cohiba from General Cigar, introduced in 2017 and rolled in the Dominican Republic. This is the non-Cuban Cohiba sold in the United States. Unusual for a Cohiba, it uses Honduran leaf for both wrapper and binder.',
    leaf: 'A Honduran Habano wrapper and binder over filler from Honduras, Nicaragua, and the Dominican Republic.',
    taste:
      'Bold leather, earth, and pepper early, then roasted nuts and coffee. It ends on pepper, espresso, and charred wood. The Robusto runs about 68 minutes.',
    proof:
      "Blind Man's Puff's panel scored the Robusto 90 in August 2017. Cigar Aficionado gave the Robusto 86 points in December 2017.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '4fb4c755-084d-55e5-96b8-0a9bbd1bd516',
    name: 'Cohiba Connecticut',
    brand: 'Cohiba',
    online: 26,
    why: 'Gentle and even-burning with a famous name. Mild-medium to medium, at a premium price.',
    story:
      'The first General Cigar Cohiba with a Connecticut Shade wrapper, launched in 2019 and made in the Dominican Republic. This is the non-Cuban Cohiba sold in the United States.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper over a Mexican San Andres binder, with Brazilian, Dominican, and Nicaraguan filler.',
    taste:
      'Mild and steady. Woody and nutty, with leather, cedar, baking spice, hay, and hints of black pepper and cinnamon. The Robusto runs about an hour.',
    proof:
      "Cigar Aficionado gave the Crystal Robusto 88 points in December 2019. Blind Man's Puff's blind panel scored the Robusto 89 in October 2019.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '2974c973-88b7-5d27-92f4-0f4330067664',
    name: 'Cohiba Riviera',
    brand: 'Cohiba',
    online: 19,
    why: 'Chocolatey, smooth, and very well made, with strong ratings. Medium to medium-full.',
    story:
      "Launched in 2023 and made in Nicaragua, this is the first General Cigar Cohiba with a Mexican wrapper and the first that is box pressed. It is also the first non-Cuban Cohiba to make Cigar Aficionado's Top 25.",
    leaf: 'A Mexican San Andres wrapper over a Honduran binder, with Honduran and Nicaraguan filler.',
    taste:
      'Layered and chocolatey, with oak, spice, leather, and a sweet, nutty finish. Pepper and espresso run through it, and it turns earthier at the end. The Robusto runs about 70 minutes.',
    proof:
      "Cigar Aficionado gave the Robusto 92 points and ranked it No. 20 on its Top 25 of 2024. Blind Man's Puff's blind panel scored the Robusto 93 in January 2024.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'ed0ce22a-26a5-54c3-81d4-b3fed88fb7cb',
    name: 'Cohiba Royale',
    brand: 'Cohiba',
    online: 28,
    why: 'The strongest Cohiba from General Cigar. Dark, earthy, and smoky, at a premium price.',
    story:
      'Released in 2020 as the fullest-bodied Cohiba from General Cigar and the first one made in Honduras. Its tobaccos are aged five to six years. This is the non-Cuban Cohiba sold in the United States.',
    leaf: 'A Nicaraguan broadleaf wrapper from Jalapa over a Dominican Piloto Cubano binder, with Nicaraguan, Honduran, and Dominican filler.',
    taste:
      'Strong and earthy, with coffee bean, smoked hickory, and dark cherry. Leather, char, and black pepper build toward the end, and the finish is smoky like peated Scotch.',
    proof:
      "Cigar Aficionado gave the Gran Royale 91 points in December 2020. Blind Man's Puff's blind panel scored the Toro 88 in September 2020.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '35f3b8da-74fc-59cd-a662-28cecc48ed05',
    name: 'Diesel Vintage Series',
    brand: 'Diesel',
    online: 7,
    why: 'Aged Nicaraguan tobacco from AJ Fernandez for about $7. Leathery, and medium-plus in strength.',
    story:
      'A maduro Diesel line made by AJ Fernandez in Nicaragua, launched in 2023 as a regular production cigar. The hook is aged Nicaraguan filler, five to eight years old, at a low price.',
    leaf: 'A Mexican San Andres maduro wrapper over a Nicaraguan Habano binder from Esteli, with Nicaraguan Habano filler from Jalapa.',
    taste:
      'Mostly leather, with some burnt wood and red pepper, then light roasted hazelnut in the final third. A firm roll. The Robusto Gordo runs about an hour and a half.',
    proof:
      'Cigar Aficionado rated the Maduro Double Corona 91 points in its May/June 2025 issue. Cigar Dojo scored the Robusto Gordo 86 percent in May 2024.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '4e81a72d-64d2-59dd-b841-22d20525c7e7',
    name: 'Diesel Vintage Series Natural',
    brand: 'Diesel',
    online: 9,
    why: 'An easygoing AJ Fernandez smoke at a low price. Medium to medium-full, woody with a little caramel.',
    story:
      "The second blend in Diesel's Vintage Series, made by AJ Fernandez in Nicaragua as a regular production line. It puts an Ecuadorian Habano wrapper over Nicaraguan filler aged five to seven years.",
    leaf: 'An Ecuadorian Habano wrapper over a Nicaraguan Habano binder from Esteli, with Nicaraguan Habano filler from Jalapa.',
    taste:
      'Sharp and woody at first, then herbal and cedary with sweet hints of caramel and oaky bourbon barrel. The Double Corona adds leather, almond, and black pepper. It draws and burns evenly.',
    proof:
      'Cigar Aficionado gave the Double Corona 91 points in August 2024 and the Robusto 88 points in February 2025.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '6ff57538-9892-5cf7-8a0d-511f57b9aa1a',
    name: 'Diesel Whiskey Row',
    brand: 'Diesel',
    online: 9,
    why: 'Sweet, spicy, and well made, with a bourbon barrel story. Medium or a touch lighter.',
    story:
      'Made by AJ Fernandez in Nicaragua with Rabbit Hole Distilling of Louisville and launched in 2018. The binder leaf is aged in barrels that held Rabbit Hole bourbon. It does not taste like bourbon, but there is plenty of oak.',
    leaf: 'An Ecuadorian Habano wrapper over a Mexican San Andres binder aged in bourbon barrels, with Nicaraguan filler.',
    taste:
      'Caramel and pepper up front with oak and hay behind, and cinnamon through the nose. It ends on baking spice, stone fruit, and caramel. The Robusto runs about 1 hour 10 minutes.',
    proof:
      'Cigar Dojo scored the Robusto 88 percent in October 2018. Cigar Coop scored the short Rothschild 89 in August 2020.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'b0698f6c-6b86-5c3c-bc2c-4b03a663d969',
    name: 'Don Pepin Garcia E.R.H.',
    brand: 'Don Pepin Garcia',
    online: 9,
    why: 'A 92-point My Father cigar for about $9. Balanced and tasty, medium-full.',
    story:
      "Made by the Garcia family of My Father Cigars in Esteli, Nicaragua. E.R.H. stands for El Rey de los Habanos, the small factory the Garcias opened in Miami's Little Havana after leaving Cuba.",
    leaf: 'An Ecuadorian Sumatra Rosado wrapper over Nicaraguan binder and filler.',
    taste:
      'Licorice, earth, and dry wood build into clove, nutmeg, and a cocoa powder finish. Cedar, pepper, and coffee show up too. It starts medium and builds to a stronger finish.',
    proof:
      'Cigar Aficionado gave the Robusto 92 points in June 2025 and the Toro Gordo 89 in Cigar Insider.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '660062ce-c137-5bcb-b141-5e4b0e307d2b',
    name: 'Dunbarton Red Meat Lovers',
    brand: 'Dunbarton',
    online: 16,
    why: 'A boutique Steve Saka broadleaf built for after a steak dinner. High scores, medium to full.',
    story:
      'Blended by Steve Saka of Dunbarton Tobacco & Trust to smoke after a steak dinner, first made in 2019 for the Red Meat Lovers Club. It started as a Smoke Inn exclusive and went national in 2023. It is made at the NACSA factory in Nicaragua.',
    leaf: 'A Connecticut Broadleaf wrapper over a Mexican San Andres binder, with Nicaraguan and Pennsylvania filler.',
    taste:
      'Mocha, a mix of chocolate and coffee, leads the whole way. Earth, black pepper, and cedar sit behind it, with sweet wood in the middle and more pepper at the end.',
    proof:
      "Blind Man's Puff's blind panel scored the original 6 x 56 size 95 in June 2019. Cigar Coop scored the Beef Stick 90 in May 2023.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'e192de93-366e-566a-be44-07f81188e859',
    name: 'Dunbarton Red Meat Lovers Fritanga',
    brand: 'Dunbarton',
    online: 16,
    why: 'A spicier, bolder Red Meat Lovers in a box-pressed toro. It turns full in the second half.',
    story:
      "An amped-up version of Steve Saka's Red Meat Lovers blend in a 6 x 52 box-pressed toro, made at the NACSA factory in Nicaragua. It is named for Nicaraguan open-flame street grilling and debuted at a Red Meat Lovers Club dinner in March 2025.",
    leaf: 'A Connecticut Broadleaf wrapper over a Mexican San Andres binder, with Nicaraguan and Pennsylvania filler.',
    taste:
      'Mocha, stone fruit, white pepper, and cream at the start. The pepper builds and the mocha turns to coffee by the middle, and it ends spicy. The burn is excellent.',
    proof: 'Cigar Coop scored it 88 in May 2026.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'edb04ac9-f559-562d-ac8c-10f23e6f66d8',
    name: 'Eiroa Classic',
    brand: 'Eiroa',
    online: 15,
    why: 'An all-Honduran boutique cigar with a family story. Medium to medium-full, with cedar and cinnamon.',
    story:
      "The original Eiroa from Christian Eiroa's CLE Cigar Company, all Honduran tobacco rolled at his factory in Danli. His family owned Camacho before selling it in 2008. The band carries the Spanish toast Salud, Amor y Pesetas: health, love, and money.",
    leaf: 'A Honduran Corojo wrapper over Honduran binder and filler.',
    taste:
      'Cedar, gingerbread, and cinnamon, with almond and chocolate in the second half. Some sizes lean to dates, dried fig, and molasses, and the Robusto is peppery and woody.',
    proof:
      'The Cigar Authority scored the 4 x 48 size 93 in February 2016. Cigar Aficionado gave the 7 x 38 size 88 points in February 2023.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '5205a0cc-bf9b-5cc6-8463-f7904babff46',
    name: 'El Rey del Mundo Appointment Brazil',
    brand: 'El Rey del Mundo',
    online: 8,
    why: 'A new, low-priced medium smoke with a Brazilian wrapper. Hazelnut, cream, and dark chocolate.',
    story:
      "The second cigar in El Rey del Mundo's Appointment series, shipped to stores in April 2026 and rolled in Honduras. It swaps in an Arapiraca wrapper grown in Brazil's Alagoas region.",
    leaf: 'A Brazilian Arapiraca wrapper over Nicaraguan binder and filler.',
    taste: 'Hazelnut, cream, cinnamon, and dark chocolate.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'f299e6d2-ec27-5bce-a76c-37e9d15b566f',
    name: 'El Titan de Bronze Nicaragua',
    brand: 'El Titan de Bronze',
    online: 9,
    why: 'A famous Miami boutique name at a low price. Bold and earthy, medium-full.',
    story:
      "El Titan de Bronze has rolled small-batch cigars in Miami's Little Havana for more than thirty years. This is its first cigar made outside the United States, rolled at the NACSA factory in Nicaragua, and it costs well under the Miami-made lines.",
    leaf: 'A dark Connecticut Broadleaf wrapper over a Mexican binder and Nicaraguan filler.',
    taste:
      'Bold and earthy, with leather, cocoa nib, and savory herbs, and a chewy finish that hints of raisin. The robusto draws and burns evenly.',
    proof: 'Cigar Aficionado gave the Robusto 92 points in its August 2026 issue.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '23010162-2235-5da7-9d05-09f9968db3e6',
    name: 'EP Carrillo INCH Maduro',
    brand: 'EP Carrillo',
    online: 12,
    why: 'A big, sweet broadleaf maduro from a well-known name. Medium-full, with coffee and chocolate.',
    story:
      "Made by Ernesto Perez-Carrillo's company in the Dominican Republic. INCH is his line of very thick cigars, 60 ring gauge and up, and this is the Connecticut Broadleaf maduro version. It has been around since the line launched in 2012.",
    leaf: 'A Connecticut Broadleaf wrapper over a Nicaraguan binder, with Dominican and Nicaraguan filler.',
    taste:
      'Earth and coffee with sweeter raisin, caramel, and chocolate pudding, plus some black pepper. A classic broadleaf smoke.',
    proof:
      'Cigar Aficionado gave the No. 62 91 points in October 2025 and 90 in February 2024. Cigar Coop scored the No. 64 90 in 2016.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'e42ad5ca-6787-5973-8373-ef6a482848a8',
    name: 'EP Carrillo INCH Nicaragua',
    brand: 'EP Carrillo',
    online: 11,
    why: 'A thick, truly full Nicaraguan puro for a regular who wants power. Simple but powerful.',
    story:
      "An all-Nicaraguan cigar in E.P. Carrillo's thick INCH series, made by the Plasencia family in Esteli with tobacco from their own farms. It was the first INCH made outside the company's Dominican factory.",
    leaf: 'All Nicaraguan: a shade-grown Jalapa wrapper over Nicaraguan binder and filler.',
    taste:
      'Leather, earth, and spice with a touch of char on the finish. The No. 62 is solidly rolled, with an open draw and an even burn.',
    proof: 'Cigar Aficionado gave the No. 62 91 points in October 2023 and 89 in June 2025.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '470381ba-9ac2-58c3-9a25-36a78cc5e65f',
    name: 'Esteban Carreras Chupacabra Natural',
    brand: 'Esteban Carreras',
    online: 9,
    why: "Medium, creamy, and easy to like, with a great draw. One of the brand's best sellers.",
    story:
      "Esteban Carreras rolls it at its own factory in Esteli, Nicaragua, and it is one of the brand's best sellers. It is named for the goat-sucker of folklore and has a pigtail cap and a closed foot.",
    leaf: 'All Nicaraguan: a Habano wrapper over Nicaraguan binder and filler.',
    taste:
      'White pepper, unsweetened chocolate, and espresso in a creamy smoke. Baking spice and toast build in the middle, and cedar and coffee finish it.',
    proof:
      "Blind Man's Puff's blind panel gave the Toro a 91 overall in February 2014, with a 98 for draw.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '51305dce-ecf2-5a8f-8980-1c236c3d3595',
    name: 'Esteban Carreras Mr. Brownstone Maduro',
    brand: 'Esteban Carreras',
    online: 9,
    why: 'A strong broadleaf maduro, full from the first puffs. A powerhouse for experienced smokers.',
    story:
      'Made by Esteban Carreras at its own factory in Nicaragua. This is the original Mr. Brownstone, launched at the 2017 trade show, with the small Boolit size added in 2018.',
    leaf: 'A Connecticut Broadleaf maduro wrapper over an Ecuadorian Habano binder and Nicaraguan filler from Condega and Jalapa.',
    taste:
      'Cocoa, coffee, earth, and pepper with a little citrus. The strength is full from the first puffs, and the flavor turns full in the last third. Not very complex, but satisfying.',
    proof:
      'Cigar Coop scored the Smack toro 91 in September 2017 and called it worth thinking about a box.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '17128604-f946-5783-a34a-e83c2a3d515a',
    name: 'Esteban Carreras Mr. Brownstone Natural',
    brand: 'Esteban Carreras',
    online: 9,
    why: 'Cocoa and sweetness at a fair price, in an all-Nicaraguan blend. Medium to full bodied.',
    story:
      'The natural-wrapper follow-up to Mr. Brownstone, added at the 2018 trade show. Esteban Carreras makes it at its own factory in Nicaragua.',
    leaf: 'All Nicaraguan: a Habano wrapper over a Jalapa binder and filler from Jalapa, Condega, and Esteli.',
    taste: 'Cocoa, citrus, and dried fruit with some sweetness. Medium to full bodied.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '0c70bb96-4b98-5d99-935d-6ae676f51c82',
    name: 'Foundation Charter Oak Pasquale',
    brand: 'Foundation',
    online: 13,
    why: 'Mocha, cream, and an easy draw in a short corona. A fuller take on Charter Oak Broadleaf.',
    story:
      "From Foundation Cigar Company, made at AJ Fernandez's factory in Nicaragua. It is named for one of founder Nicholas Melillo's grandfathers and sold with its shade sibling, Pegnataro, as the Charter Oak Especiales. It comes in one size.",
    leaf: 'A Connecticut Broadleaf wrapper over a Nicaraguan Jalapa binder, with Nicaraguan filler from Esteli and Jalapa.',
    taste:
      'Opens with mocha, cream, fruit sweetness, and earth. Coffee takes over in the middle and black pepper grows toward the end. Excellent burn and draw.',
    proof:
      "Cigar Coop scored it 90 in December 2024. Cigar Aficionado's Cigar Insider gave it 89 in November 2023.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '3c25c8c9-b818-5623-bd25-110a67a7dbff',
    name: 'Foundation The Wise Man Corojo',
    brand: 'Foundation',
    online: 12,
    why: 'Gentle and nutty with an easy draw. Mild-medium in most sizes, so it is kind to a beginner.',
    story:
      'From Foundation Cigar Company, made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Foundation brought it out in 2024 as the successor to its El Gueguense.',
    leaf: 'All Nicaraguan: a Corojo 99 wrapper over binder from Esteli and Jalapa and filler from Esteli, Condega, and Jalapa.',
    taste:
      'Cedar and nuts at the core, with easygoing cinnamon, cashew, and a bit of honey, then a graham cracker finish. The Toro draws and burns open and even.',
    proof:
      "Cigar Aficionado's Cigar Insider gave the Lancero 91 points in November 2025 and the Toro and Double Corona 89 each in February 2025.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'c75dcd69-9add-5187-8bb8-c83ce7f2febe',
    name: 'Foundation The Wise Man Maduro',
    brand: 'Foundation',
    online: 12,
    why: 'A boutique name with a story. Full, dense, and chewy, with leather, oak, and dark chocolate.',
    story:
      "From Nick Melillo's Foundation Cigar Company. The original, made by Aganorsa Leaf, was Cigar Aficionado's No. 3 cigar of 2018. In 2024 it was reblended and production moved to the Garcia family's My Father factory in Nicaragua.",
    leaf: 'A Mexican San Andres wrapper over Nicaraguan binder from Esteli and Jalapa and filler from Esteli, Condega, and Jalapa.',
    taste:
      'Dense and chewy, with leather, oak, coffee, dark chocolate, and black pepper. The Churchill leans earthy and oaky.',
    proof:
      'Cigar Aficionado gave the current Lancero 93 points in November 2025. The original Robusto earned 95 points and No. 3 of 2018.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '13a261b7-18d9-58f2-a1b8-5c1a54bb5000',
    name: 'H. Upmann 180th Anniversary',
    brand: 'H. Upmann',
    online: 20,
    why: 'A limited, truly full anniversary cigar with a rare wrapper leaf. Big flavor for a regular smoker.',
    story:
      'A limited edition made by AJ Fernandez in Nicaragua with Rafael Nodal, marking 180 years of the H. Upmann name. The wrapper is medio tiempo, the small top leaves that grow above the ligero on some plants.',
    leaf: 'All Nicaraguan: a medio tiempo wrapper over Nicaraguan binder and filler.',
    taste:
      'Hickory and barbecue hardwood on the first puffs, then ground peppercorn, black cherry, and coffee. Toasted oak, leather, chocolate, and black licorice round it out.',
    proof:
      'Cigar Aficionado gave the Churchill 91 points in December 2024. Cigar Dojo named it its No. 2 Cigar of the Year for 2024.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'dcae8a7a-c8ad-5c23-9330-5629a798e166',
    name: 'H. Upmann Nicaragua AJ Fernandez Heritage',
    brand: 'H. Upmann',
    online: 11,
    why: 'A familiar name, a fair price, and scores of 90 and up. Medium-full, with espresso all the way.',
    story:
      "The second H. Upmann line made by AJ Fernandez in Esteli, Nicaragua, for Altadis U.S.A. It pairs a triple-fermented Brazilian wrapper with tobacco from Fernandez's own Nicaraguan farms.",
    leaf: 'A Brazilian Mata Fina wrapper over a Nicaraguan Habano binder and Nicaraguan filler.',
    taste:
      'Espresso leads from start to finish, with chocolate, stone fruit, cinnamon, and pepper around it. The Robusto draws well and burns razor sharp.',
    proof:
      "Cigar Aficionado gave the Toro 91 points in June 2026 and the Robusto 90 in August 2022. Cigar Coop scored the Toro 91, and Blind Man's Puff's panel gave it 93.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '364d3dc6-909f-57a4-ad53-d9ba2c2c6a22',
    name: 'Hoyo de Monterrey Oscuro',
    brand: 'Hoyo de Monterrey',
    online: 5,
    why: 'A known name, a short size, and a low price, with a Brazilian Mata Fina wrapper. Medium-plus.',
    story:
      "Made in Danli, Honduras, and released with Rojo in 2024 as part of General Cigar's relaunch of the Honduran Hoyo de Monterrey. It is the first Hoyo de Monterrey with a Brazilian Mata Fina wrapper.",
    leaf: 'A Brazilian Mata Fina Oscuro wrapper over an Ecuadorian Sumatra binder, with Honduran, Nicaraguan, and Dominican filler.',
    taste: 'Cherry cola, rye bread, molasses, white pepper, and cayenne. A medium-plus blend.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'd49febf6-6dd8-522c-bee6-6c50e3b5efcd',
    name: 'J.C. Newman Diamond Crown Black Diamond',
    brand: 'J.C. Newman',
    online: 24,
    why: 'A premium Fuente-made stick with a rare wrapper. Medium to medium-full, with mocha and cedar.',
    story:
      'Made for J.C. Newman by the Fuente family in the Dominican Republic and sold as the strongest Diamond Crown. It first reached stores in late 2016 and was updated in 2022. The binder and filler are aged five years.',
    leaf: 'A dark Havana-seed wrapper grown in Connecticut over Dominican binder and filler.',
    taste:
      'Mocha, earth, fruit, pepper, and cedar, with leather and cinnamon throughout. The first half is the best of it.',
    proof:
      "Cigar Coop scored the Radiant 93 in 2019. Blind Man's Puff's panel gave the Emerald a 90 overall, and Cigar Aficionado scored the Radiant and the Emerald 88 each.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '91c4e31c-7b9a-50b3-a83e-cbefb321b1d1',
    name: 'J.C. Newman Diamond Crown Maduro',
    brand: 'J.C. Newman',
    online: 15,
    why: 'A sweet, gentle maduro made by the Fuentes. Mild to medium, so it is easy on a newer smoker.',
    story:
      "The maduro version of J.C. Newman's Diamond Crown, made by the Fuente family in the Dominican Republic. The broadleaf wrapper is fermented twice, and most sizes are a thick 54 ring gauge.",
    leaf: 'A Connecticut Broadleaf wrapper over a Dominican binder, with five fillers from the Caribbean and Central America.',
    taste:
      'Coffee, chocolate, cedar, and leather with a little malt and red pepper. Not a bold, in-your-face maduro, so the flavors come through.',
    proof:
      'The Cigar Authority gave the No. 4 92, and Cigar Coop scored it 90 in February 2020. Cigar Aficionado gave the Robusto No. 5 88 in December 2008.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '9cc60288-0407-574f-9cec-c8b2b7131b49',
    name: 'J.C. Newman Diamond Crown Maximus',
    brand: 'J.C. Newman',
    online: 15,
    why: 'Fuente-made and well built. Medium to medium-full, a safe step up toward fuller cigars.',
    story:
      "The fuller Diamond Crown, made for J.C. Newman by the Fuente family in the Dominican Republic and introduced in 2002. The dark sungrown wrapper comes from Oliva Tobacco's El Bajo farm in Ecuador.",
    leaf: 'An Ecuadorian sungrown wrapper over Dominican binder and filler.',
    taste:
      'Earth and leather that turn creamy, with graham cracker and raisin sweetness. Cedar and black pepper come through, with more spice in the Robusto.',
    proof:
      'Cigar Aficionado ranked the Double Corona No. 1 No. 4 on its Top 25 of 2009 and gave the Toro No. 4 90 points in December 2015.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'a9c3966f-0e76-5e12-9e34-ba8a9b96b30e',
    name: 'J.C. Newman Perla del Mar Corojo',
    brand: 'J.C. Newman',
    online: 9,
    why: 'Light, bright, a little sweet, and cheap. Well made, and medium or a touch more.',
    story:
      'Made by J.C. Newman at its PENSA factory in Esteli, Nicaragua. Perla del Mar began as a Cuban brand in 1905, and Newman relaunched it in 2012. The Corojo blend arrived in late 2020, and every size is box-pressed.',
    leaf: 'An Ecuadorian Corojo wrapper over Nicaraguan binder and filler.',
    taste:
      'Sweet and fruity up front with citrus, cedar, and white pepper through the nose. The sweetness fades near the end and a mild earthy note comes in.',
    proof:
      "Cigar Aficionado's Cigar Insider gave the Robusto 90 points in February 2021. A blind panel at Blind Man's Puff scored the Corona Gorda 93.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'b8e53bd2-8997-55b2-9633-4ff6e83814f8',
    name: 'J.C. Newman Perla del Mar Maduro',
    brand: 'J.C. Newman',
    online: 9,
    why: 'An easy, low-cost maduro full of chocolate and coffee. Medium, with pepper that builds late.',
    story:
      'Made by J.C. Newman at its PENSA factory in Nicaragua. The Maduro joined the Perla del Mar line in 2016 and got an upgraded blend and a new rectangular box press in 2020. It is sold as a value cigar.',
    leaf: 'A Connecticut Broadleaf wrapper grown in the United States over Nicaraguan binder and filler.',
    taste:
      'Opens with black pepper, then dark chocolate and roasted coffee take over, with earth and cedar behind. Pepper builds again late.',
    proof:
      "Cigar Aficionado lists the Corona Gorda at 90 points in its May/June 2026 issue and gave the Double Toro 89 in October 2023. Blind Man's Puff's panel gave the Double Toro 89.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'a34175a4-5071-5918-a06b-89219326236b',
    name: 'J.C. Newman The American',
    brand: 'J.C. Newman',
    online: 19,
    why: 'Every leaf is American and it is rolled in Tampa. Earthy, pricey, and unusual. Medium or a bit more.',
    story:
      "Hand rolled at J.C. Newman's El Reloj factory in Tampa, Florida, using only tobacco grown in Florida, Connecticut, and Pennsylvania. Even the boxes, bands, and molds are made in the United States. Only two rollers make it, so supply is limited.",
    leaf: 'A Florida Sun Grown wrapper from Corojo 99 seed over a Connecticut Broadleaf binder, with filler from Pennsylvania and Connecticut.',
    taste:
      'Earthy from the first puff, with toasted rye, leather, and a fig sweetness, and very little pepper. The last part is the most complex, adding coffee, clove, hazelnut, and cedar.',
    proof:
      "Cigar Coop scored the Toro 92 in 2020. Cigar Dojo and a Blind Man's Puff blind panel each gave the Robusto 89.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'cb4016f9-c28a-5817-bca2-412fa85e6980',
    name: 'Kristoff Guardrail',
    brand: 'Kristoff',
    online: 9,
    why: 'A good story and a rare leaf from Zimbabwe for someone who wants something different. Solidly medium.',
    story:
      'Named for the motorcycle crash into a guardrail in Oklahoma that put Kristoff founder Glen Case in the hospital. It is made in the Dominican Republic and stands out for the Zimbabwe tobacco in its filler.',
    leaf: 'A Brazilian maduro wrapper over a Dominican binder, with filler from the Dominican Republic and Zimbabwe.',
    taste:
      'Coffee, cocoa, cedar, and cream with some caramel sweetness and pepper in the background. Leather and raisin show up in the middle, and the finish gets spicier.',
    proof:
      "Cigar Coop gave the Robusto 91 in August 2023. The Cigar Authority's blind panel gave it 90.42.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'abe2e939-b8e3-5a33-9eca-cbf238fa5ec4',
    name: 'Kristoff Original Maduro',
    brand: 'Kristoff',
    online: 11,
    why: 'A dark, sweet, slow-burning maduro that stays medium. Chocolate up front, cream at the end.',
    story:
      "One of Kristoff's first lines, from founder Glen Case, who left a career in finance to make cigars. It is rolled in the Dominican Republic with a pigtail cap and a covered foot, and packed in rough wooden boxes on loose tobacco.",
    leaf: 'A dark Brazilian maduro wrapper over a Dominican binder and Dominican and Nicaraguan filler.',
    taste:
      'Starts strong with dark chocolate, pepper, and espresso, then turns earthy with some leather. The second half is creamy and smooth with caramel. The Robusto burns slowly and lasts over an hour.',
    proof: 'Cigar Aficionado scored the Lancero 88 in 2019 and 87 in 2014.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'd7d4ae2d-5d73-5092-bbbe-d9d36f6cd466',
    name: 'Kristoff Pistoff Kristoff',
    brand: 'Kristoff',
    online: 9,
    why: "Kristoff's strongest cigar, with a big pepper blast at the start. For a regular who wants power.",
    story:
      'A full strength Kristoff released in July 2016 and made in the Dominican Republic. Founder Glen Case called it the strongest cigar the company had made. A customer suggested the name and Case changed the spelling.',
    leaf: 'A dark Mexican San Andres wrapper over an Indonesian binder and Nicaraguan filler.',
    taste:
      'The covered foot gives a blast of pepper at first light, then espresso and red wine notes calm it down. The middle is heavy on leather with cedar and oak, and the end turns sweet with chocolate.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'a28c169e-6a1c-5a44-9f1d-12ec68b96add',
    name: 'Kristoff San Andrés',
    brand: 'Kristoff',
    online: 11,
    why: 'Chocolate, coffee, and pepper for someone who likes a dark, spicy cigar. Medium-full.',
    story:
      'A Kristoff line that debuted at the 2015 trade show, made in the Dominican Republic. Like other Kristoffs it has a rugged wrapper, a pigtail cap, and a covered foot.',
    leaf: 'A Mexican San Andres wrapper over an Ecuadorian Habano-seed binder and Nicaraguan filler.',
    taste:
      'A peppery cocoa hit at first light settles into malted chocolate with cream. Leather and earth take over, with espresso behind and a charry second half. The Robusto runs about fifty minutes.',
    proof: 'Cigar Aficionado gave the Robusto 89 points in August 2016.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'a7cbd8c7-e9b9-50dc-b5c9-c2f76fcc90d8',
    name: 'Kristoff Shade Grown',
    brand: 'Kristoff',
    online: 11,
    why: 'Creamy, nutty, and steady from start to finish, with nothing harsh. A big, slow, medium smoke.',
    story:
      'A 2019 Kristoff line made in the Dominican Republic. Its Connecticut-seed shade wrapper is grown in Honduras, which is unusual. It has the usual Kristoff pigtail cap and closed foot.',
    leaf: 'A Connecticut-seed shade wrapper grown in Honduras over a Dominican binder and Dominican and Nicaraguan filler.',
    taste:
      'Sweet buttered bread, hay, nuts, and baking spice, with cedar and a little sweetness at the end. It changes very little as it burns. The Robusto takes close to two hours.',
    proof:
      "Cigar Aficionado gave the Churchill 85 points in August 2023. Developing Palates' team rated the Robusto Good in June 2020.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '8a970bfe-b06e-592c-b650-c0ffd59bd02e',
    name: 'Kristoff Vengeance',
    brand: 'Kristoff',
    online: 11,
    why: 'Sweet and dark in a short robusto. Medium to medium-full, so it is a gentle start on the full shelf.',
    story:
      "An early Kristoff name that Glen Case brought back in 2018 with a new blend, the brand's first with a Connecticut Broadleaf wrapper. It is made in the Dominican Republic with a pigtail cap and closed foot.",
    leaf: 'A Connecticut Broadleaf wrapper over an Indonesian binder and Dominican and Nicaraguan filler.',
    taste:
      'Bright pepper and big espresso at the start, then lots of maduro sweetness with chocolate, cocoa, and coffee. Cedar, earth, and baking spice sit underneath.',
    proof: "The Blind Man's Puff blind panel gave the Toro 94 in June 2020.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '069ecc4f-8e5d-5534-b7a9-f464a370526f',
    name: 'La Aurora Preferidos Ruby',
    brand: 'La Aurora',
    online: 26,
    why: "La Aurora's top line, in a tube, at a top price. Rich and strong, medium-full to full.",
    story:
      "Made by La Aurora in the Dominican Republic. Preferidos is the company's top line, built around a bulging perfecto shape that La Aurora brought back in 1999 and that is hard to roll. Ruby is the one with a Brazilian maduro wrapper.",
    leaf: 'A Brazilian maduro wrapper over a Dominican binder, with filler from the Dominican Republic, Brazil, and Cameroon.',
    taste:
      'Cedar, coffee, and cream at the core. The robusto leans on hickory, black cherry, and raisin, with considerable strength.',
    proof:
      'Cigar Aficionado ranked the Brazilian-wrapped Preferidos Maduro Robusto No. 11 on its Top 25 of 2009 with 92 points.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '0d99dc60-b25f-508d-b541-6ff543ddce86',
    name: 'La Flor Dominicana Air Bender',
    brand: 'La Flor Dominicana',
    online: 9,
    why: 'A true powerhouse with Top 25 finishes behind it. Not for beginners or an empty stomach.',
    story:
      'Made by Litto Gomez at Tabacalera La Flor in the Dominican Republic. It began as an event-only cigar and became a regular line in 2010. Its best known size is the Chisel, a wedge-headed shape Gomez created in 2003.',
    leaf: "An Ecuadorian Habano wrapper over Dominican binder and filler grown on the maker's own farm.",
    taste:
      'Bold from the first puff. Sweet cocoa, spicy licorice, savory leather, and plenty of spice, with wood and a floral sweetness along the way.',
    proof:
      'Cigar Aficionado gave the Chisel 94 points as its No. 10 cigar of 2010 and 92 points as No. 20 of 2021. The Matatan robusto was No. 23 of 2011.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '486ef6d3-a8d6-5e77-82f7-9efdcccf3ada',
    name: 'La Flor Dominicana Cameroon Cabinet',
    brand: 'La Flor Dominicana',
    online: 10,
    why: 'Smooth, woody, and well made. The robusto smokes medium, easier than its shelf suggests.',
    story:
      'Made by La Flor Dominicana in the Dominican Republic. It uses dark, oily, aged Cameroon leaf from the upper part of the plant, and the maker keeps supply small.',
    leaf: 'An aged Cameroon wrapper over a Dominican binder and Dominican and Nicaraguan filler.',
    taste:
      'Earthy and smooth, with wood and spice on the palate and a wheaty finish. Cedar, leather, nuts, and coffee along the way.',
    proof:
      'Cigar Aficionado ranked the Chisel No. 12 on its Top 25 of 2012 and scored the No. 5 robusto 89 in 2014.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '0a6e1bb9-1851-5614-a52d-a0bbcf98e812',
    name: 'La Flor Dominicana Double Claro',
    brand: 'La Flor Dominicana',
    online: 9,
    why: 'A green candela from a respected maker. Something different for a regular, with a surprising punch.',
    story:
      "La Flor Dominicana's first candela, released in 2012 and made in the Dominican Republic with filler from the company's La Canela farm. Candela leaf is cured quickly so it stays green. It packs a surprising punch for a candela.",
    leaf: 'A green Ecuadorian candela wrapper over a Nicaraguan binder and Dominican filler.',
    taste:
      'Green hay, toasted cedar, earth, and black pepper to start, with the hay turning creamy and grassy. Honey and tangy citrus come in too.',
    proof: 'Cigar Aficionado gave the No. 50 robusto 89 points in its October 2019 issue.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '430e4657-6d8a-5fef-9996-036dc90d159b',
    name: 'La Flor Dominicana Double Ligero Maduro',
    brand: 'La Flor Dominicana',
    online: 11,
    why: 'One of the strongest regular La Flor Dominicana cigars, with steady scores above 90. For seasoned smokers.',
    story:
      'Blended by Litto Gomez and made at Tabacalera La Flor in the Dominican Republic from strong ligero leaf grown on the company farm. It is closely tied to the Chisel, the wedge-headed shape Gomez created.',
    leaf: 'An Ecuadorian maduro wrapper over Dominican binder and ligero filler.',
    taste:
      'Dense and chewy, with espresso, earth, and black pepper over black cherry and anise. Dark fruit, leather, and licorice too. Full strength with a long finish.',
    proof:
      'Cigar Aficionado gave the Chisel Maduro 92 points in August 2023 and ranked the Chiselito Maduro No. 21 of 2024. The Cigar Authority gave the Chisel Maduro 91 in 2018.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '35793b8e-03ab-5b6b-bdb3-10ceb5546800',
    name: 'La Flor Dominicana Oro',
    brand: 'La Flor Dominicana',
    online: 17,
    why: 'A 93-point, Top 25 cigar in a gold tube. Rich and pricey, medium-full, a notch under full.',
    story:
      'Made by La Flor Dominicana in the Dominican Republic. It is a stronger take on the Coronado blend, using wrapper from higher on the plant. It is best known for its gold tubes and comes in Natural and Maduro.',
    leaf: "A Nicaraguan Habano sun grown wrapper over Dominican binder and filler from the maker's La Canela farm.",
    taste:
      'A spicy punch in the first few puffs, then it mellows. Toasty, with leather, cashew, spice, and earth and a graham cracker finish. Cedar, coffee, and rye show up too.',
    proof:
      'Cigar Aficionado gave the Chisel 93 points in October 2022 and ranked it No. 12 of 2022 and No. 14 of 2013.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '92c6564a-741c-5a35-b6fb-c9625a356eb9',
    name: 'La Gloria Cubana Esteli',
    brand: 'La Gloria Cubana',
    online: 6,
    why: 'A short, low-cost robusto that scored well in a blind test. Medium-full, with cedar and spice.',
    story:
      'A La Gloria Cubana made at the STG Esteli factory in Nicaragua and named for that city. It came out in 2018 at a budget price. Only the wrapper is Nicaraguan, so it is not a Nicaraguan puro.',
    leaf: 'A Nicaraguan Jalapa wrapper over Honduran binder and filler.',
    taste:
      'Cedar, spice, and white pepper at the core. Leather, nuts, and oak early, then more coffee with some sweetness and baking spice in the middle.',
    proof: "The Blind Man's Puff blind panel gave the Robusto 93 in October 2019.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '19bdb0d2-3e5f-5476-a216-fd7781dbd8f5',
    name: 'La Gloria Cubana Serie R',
    brand: 'La Gloria Cubana',
    online: 10,
    why: 'A well-known thick cigar with dark coffee and sweet wood. A crowd-pleaser in a big ring gauge.',
    story:
      "La Gloria Cubana's big ring gauge line, made in the Dominican Republic. The brand was created by cigar maker Ernesto Perez-Carrillo and is now owned by General Cigar. Serie R is credited with helping start the trend toward thick cigars.",
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder and Dominican and Nicaraguan filler.',
    taste:
      'Dark-roasted coffee and sweet wood that carry to the finish. Earth, spice, and leather with a touch of dried fruit.',
    proof:
      'Cigar Aficionado gave the No. 4 robusto 90 points in October 2008 and 88 in October 2011.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '41098bee-bfd1-5ae0-b5aa-97a5328c70bc',
    name: 'La Gloria Cubana Serie R Esteli',
    brand: 'La Gloria Cubana',
    online: 10,
    why: 'A big, affordable Nicaraguan with a Top 25 finish behind it. Leather and coffee under an oily wrapper.',
    story:
      "La Gloria Cubana's Nicaraguan-made take on its big ring Serie R, launched in 2013 for brick-and-mortar cigar shops. It is all Nicaraguan tobacco, rolled in Esteli under an oily Jalapa wrapper.",
    leaf: 'All Nicaraguan: a sun grown Jalapa wrapper over Nicaraguan binder and filler.',
    taste:
      'A core of leather and coffee with nutty and floral notes. Some sticks smoke earthier and woodier.',
    proof: 'Cigar Aficionado gave the No. 54 91 points and ranked it No. 22 on its Top 25 of 2014.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '6d58cdea-c31a-5acf-b71e-171a8387ee0d',
    name: 'La Gloria Cubana Serie R Maduro',
    brand: 'La Gloria Cubana',
    online: 10,
    why: 'A thick, dark maduro at a fair price with steady high 80s scores. Easy pick for a guest who likes them big.',
    story:
      "The dark-wrapper version of Serie R, the large ring gauge line La Gloria Cubana introduced in 1999. It is made in the Dominican Republic at General Cigar's El Credito operation.",
    leaf: 'A Connecticut Broadleaf maduro wrapper over a Nicaraguan binder and Dominican and Nicaraguan filler.',
    taste:
      'Earthy and dark. Earth, licorice, and charcoal in the No. 4, with a dry finish of oak and minerals. The larger No. 7 shows oak, cinnamon, and clove.',
    proof: 'Cigar Aficionado gave the No. 4 88 points in 2017 and the No. 7 88 points in 2020.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '5e72b464-726b-5727-b5ed-2b0741bdf005',
    name: 'La Gloria Cubana Serie S Maduro',
    brand: 'La Gloria Cubana',
    online: 9,
    why: 'A big, bold, earthy maduro for under ten dollars. Chocolate and coffee up front, pepper at the end.',
    story:
      'The second Serie S blend, launched in July 2023 and made at El Credito in the Dominican Republic. It uses a darker, longer-matured Mexican San Andres wrapper than the first Serie S and comes in the same three large sizes.',
    leaf: 'A Mexican San Andres maduro wrapper over a Nicaraguan binder and Nicaraguan and Dominican filler.',
    taste:
      'Opens with chocolate, coffee, earth, and black pepper, then coffee takes over. The last third brings more pepper.',
    proof: 'Cigar Aficionado gave the Robusto Gordo 89 points in December 2023.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '730a98a6-68ce-503e-808f-4141c013408b',
    name: 'La Gloria Cubana Society Cigar',
    brand: 'La Gloria Cubana',
    online: 9,
    why: 'Smooth, creamy, and a solid medium, with a fan-built story. The gentlest pick on the full shelf.',
    story:
      "A limited edition shaped by more than 2,000 members of the La Gloria Cubana Society, the brand's fan group. The first release in 2022 was a box-pressed Honduran puro rolled at El Credito in the Dominican Republic.",
    leaf: 'All Honduran tobacco: an Olancho San Agustin wrapper, a Jamastran binder, and filler from Jamastran and La Entrada.',
    taste:
      'Salty peanut, milk chocolate, and creamy coffee, with baking spice and cedar. It ends on toasted almond.',
    proof: "A Blind Man's Puff panel scored the box-pressed toro 91, Very Good, in a blind review.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '4330a833-a52c-56fc-ac8d-cc793535851c',
    name: 'Los Statos Deluxe',
    brand: 'Los Statos',
    online: 9,
    why: 'A steady, woody smoke with a great draw and a fun story. Medium, maybe a touch more.',
    story:
      "The flagship of the relaunched Los Statos Deluxe brand from Forged Cigar Co., reblended in 2022 by Matt Booth and Justin Andrews. It is made at STG's factory in Danli, Honduras.",
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder and Nicaraguan and Dominican filler.',
    taste:
      'Cedar, charred oak, and nuts with a little citrus, then graham cracker, caramel, and vanilla in the middle. It stays steady to the end. The Robusto runs about 67 minutes.',
    proof:
      "A Blind Man's Puff panel scored the Robusto 91 in a blind review. Cigar Aficionado gave the Robusto 87 points in October 2023.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'b39a141b-efe2-58c2-8c4f-df8fe01fb7cb',
    name: 'Los Statos Deluxe Connecticut',
    brand: 'Los Statos',
    online: 9,
    why: 'Creamy, nutty, and easygoing, in eye-catching packaging. The mildest of the Los Statos Deluxe blends.',
    story:
      'The mildest Los Statos Deluxe blend, created by Matt Booth and Justin Andrews and rolled at Joya de Nicaragua. Each cigar comes wrapped in white paper inside a purple paper tube instead of cellophane.',
    leaf: 'An Ecuadorian Connecticut wrapper over a Nicaraguan Habano binder, with Nicaraguan filler and Pennsylvania Broadleaf.',
    taste:
      'Thick cream, peanuts, and white pepper, then roasted peanuts and a glazed donut sweetness. It ends simpler, with hardwood. The Robusto runs about an hour.',
    proof:
      'Cigar Dojo scored the Robusto 87 in February 2025 and ranked it the best of the Los Statos Deluxe lineup.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '38af0039-e5c8-5dc7-9b6a-4f9f15caab93',
    name: 'Los Statos Deluxe Limited Edition',
    brand: 'Los Statos',
    online: 16,
    why: 'A one-time run of 3,000 boxes with an unusual blend. Good for a regular who wants something scarce.',
    story:
      "A one-size limited release created by Matt Booth, Justin Andrews, and William Ventura, and rolled at Ventura's factory in the Dominican Republic. It shipped in March 2024 in a run of 3,000 boxes of 10, with the blend to be retired after that.",
    leaf: 'A Mexican San Andres maduro wrapper over an Ecuadorian Sumatra binder. The filler is Connecticut Broadleaf, Pennsylvania Broadleaf, and Nicaraguan Corojo 98.',
    taste:
      'Medium to medium-plus in body with a lot of flavor changes along the way. Charred wood, chocolate, coffee with cream, molasses, and a hint of black pepper.',
    proof: 'Cigar Dojo ranked it second in the Los Statos Deluxe lineup, behind the Connecticut.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '87ce1a92-da2e-5633-8690-83f0ec194ac1',
    name: 'Los Statos Deluxe Maduro',
    brand: 'Los Statos',
    online: 10,
    why: 'Dark and coffee-heavy, twisted in paper like a candy. Full in body but light on strength, and it burns slow.',
    story:
      "The Connecticut Broadleaf version of Los Statos Deluxe, added in 2023, a year after Matt Booth and Justin Andrews relaunched the brand. It is made at STG's factory in Danli, Honduras, and comes twisted in blue and white paper like a candy.",
    leaf: 'A Connecticut Broadleaf wrapper over a Nicaraguan binder, with Honduran and Dominican filler.',
    taste:
      'Strong coffee, black pepper, and dry leather to start, with a brief chocolate sweetness. The burn is slow and needs no touch-ups. The Robusto lasts about 1 hour 20 minutes.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '64374328-8500-54d7-a7d0-647424a67162',
    name: 'Macanudo Emissary España',
    brand: 'Macanudo',
    online: 13,
    why: 'Rare Spanish filler tobacco gives a regular something new to try, and the scores are solid. Medium.',
    story:
      'The first Macanudo Emissary, released in March 2024 and built around 10-year-old filler tobacco grown near Riolobos, Spain. It blends leaf from five countries and is rolled in Honduras.',
    leaf: 'A Connecticut Broadleaf wrapper aged five years over a Nicaraguan binder. The filler is Dominican, Colombian, Nicaraguan, and Spanish.',
    taste:
      'Sweet, rich natural tobacco with coffee, baking spice, wood, and pepper, and more pepper at the end. The Torpedo is earthier, with citrus, coffee bean, and a toasted nut finish.',
    proof:
      'Cigar Insider gave the Torpedo 91 points in January 2025. Cigar Coop scored the Robusto 89 in October 2024.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '049ba920-be49-51c4-a80b-87790e8d9943',
    name: 'Macanudo Emissary France',
    brand: 'Macanudo',
    online: 13,
    why: 'French filler tobacco and a 2025 Top 25 spot make this one a story to tell. Bold and medium-full.',
    story:
      "The second Macanudo Emissary, released in March 2025, features four-year-old filler grown in France's Mugron valley, between Bordeaux and the Spanish border. It is rolled in Honduras with tobacco from five countries.",
    leaf: 'An Ecuadorian Habano wrapper aged ten years over a Broadleaf binder. The filler is Dominican, Broadleaf from the United States, Brazilian, and French.',
    taste:
      'Bold leather and black pepper with sweeter coffee bean and cocoa in the Churchill. The Robusto is more herbal and oaky, turning earthy.',
    proof:
      'Cigar Aficionado gave the Churchill 95 points and ranked it No. 12 on its Top 25 of 2025. Cigar Insider gave the Robusto 88 points in June 2025.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '3889bcb9-6472-5822-955b-ee09c53e1b1b',
    name: 'Macanudo Estate Reserve',
    brand: 'Macanudo',
    online: 22,
    why: 'A wine barrel story, limited supply, and a 91 from Cigar Coop. Gentle, mild to medium.',
    story:
      "A limited Macanudo series made with Flint Knoll Winery of Napa Valley and rolled in the Dominican Republic. The Broadleaf binder is aged in French oak barrels that held the winery's Cabernet Sauvignon.",
    leaf: 'An Ecuadorian Connecticut Shade wrapper over a barrel-aged Connecticut Broadleaf binder. The filler is Brazilian Mata Fina, Dominican, and Nicaraguan.',
    taste:
      'Opens with fruit and creamy vanilla that has a wine-like sweetness, then moves to earth and cedar with a little sourdough late.',
    proof:
      'Cigar Coop scored the first-release Churchill 91 in June 2023. Cigar Aficionado gave the No. 2 Churchill, a later release, 90 points in June 2024.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '1606b205-bd3b-532a-a8a9-26a9eb834748',
    name: 'Macanudo Inspirado Black',
    brand: 'Macanudo',
    online: 8,
    why: 'A dark, mocha-sweet Macanudo that burns and draws well for about eight dollars. Medium, fuller at the end.',
    story:
      'The darker partner to Inspirado White, launched in the United States in 2017 and made in the Dominican Republic. It was pitched as a bolder cigar than the classic mild Macanudo lines.',
    leaf: 'A Connecticut Broadleaf wrapper over an Ecuadorian Sumatra binder and Nicaraguan filler from Esteli.',
    taste:
      'Opens with a burst of white pepper, then mocha, berry, and wood. Coffee takes over from chocolate in the middle, and it finishes earthier.',
    proof: 'Cigar Coop scored the Robusto 89 in June 2018 and rated it Buy Multiples.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'ae8fa18a-a497-5a63-bd34-172b01bcb315',
    name: 'Macanudo Inspirado Green',
    brand: 'Macanudo',
    online: 7,
    why: 'Sweet, earthy, and cheap, with a 91 for the Toro. Medium in the Robusto, stronger in the bigger sizes.',
    story:
      'An Inspirado built around South American tobacco, with a Brazilian wrapper and Colombian filler. It is made in the Dominican Republic and reached stores in 2020.',
    leaf: 'A Brazilian Arapiraca wrapper over an Indonesian binder, with Colombian and Dominican filler.',
    taste:
      'Thick, spicy smoke with maple syrup, hickory, and molasses over coffee bean, and a bright cedar finish. The Robusto shows earth, molasses, oak, and leather.',
    proof:
      'Cigar Aficionado gave the Toro 91 points in June 2021. Cigar Insider gave the Robusto 87 in February 2021.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'bb982aba-a7cb-56b3-9bc0-054e45a401b6',
    name: 'Macanudo Inspirado Red',
    brand: 'Macanudo',
    online: 8,
    why: 'The boldest Inspirado, heavy on coffee and cocoa. Medium-full, with filler aged up to twelve years.',
    story:
      "A Nicaraguan-made Inspirado released in 2018 for Macanudo's 50th anniversary. Its filler tobaccos are aged five, ten, and twelve years.",
    leaf: 'An Ecuadorian Habano ligero wrapper over a Nicaraguan Jalapa binder, with Honduran and Nicaraguan filler.',
    taste:
      'Leather, cedar, cocoa, and espresso, with coffee and dark caramel at the end. The Robusto runs about 77 minutes.',
    proof:
      "A Blind Man's Puff panel scored the Robusto 89 in a blind review. Cigar Aficionado gave the Toro 87 points in 2018.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'ec9ed59a-93a9-5da7-982d-9c084cf5e5da',
    name: 'Macanudo Sumatra',
    brand: 'Macanudo',
    online: 6,
    why: 'A well-made, easy medium smoke for about six dollars. New in 2026, rich but not bold.',
    story:
      'A box-pressed Macanudo launched in April 2026 as the richer partner to the Macanudo Ecuadorian Shade. The two share a binder and filler and are rolled in Esteli, Nicaragua.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Broadleaf binder from the United States, with Dominican and Nicaraguan filler.',
    taste:
      'Cocoa, wood, and leather to start, with leather taking over after about 20 minutes. Rich but not bold, with a very good draw and even burn. The Robusto lasts 45 minutes.',
    proof: 'Cigar Czars rated the Robusto 3.75 out of 5 and called it a very good value.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: 'ba737ddd-b5f0-5fca-8295-aacf4a66b819',
    name: 'Macanudo Vintage',
    brand: 'Macanudo',
    online: 12,
    why: 'A single-year wrapper aged about ten years. Mellow, creamy, and refined, with a story to tell.',
    story:
      'Macanudo Vintage is built around a wrapper crop from one standout year. This edition uses Connecticut Shade from 2010, a hot season in the Connecticut River Valley, aged about a decade. General Cigar makes it in the Dominican Republic.',
    leaf: 'A Connecticut Shade wrapper from the 2010 crop over a Honduran binder. The filler is Honduran, Nicaraguan, and Dominican Piloto Cubano.',
    taste:
      'Cedary, creamy, and mellow, starting with herbs and sweet tobacco. The middle adds sweet cream and some nuts, and it ends with light earth and a caramel-like finish.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '08f5d1af-655b-54c3-b799-1819cb767aa0',
    name: 'Macanudo Vintage Maduro 2013',
    brand: 'Macanudo',
    online: 11,
    why: 'A ten-year-old Broadleaf wrapper with big leather and pepper flavor. Medium-full, with full body.',
    story:
      'A Macanudo built around a Connecticut Broadleaf wrapper from the hot, wet 2013 growing season, aged about ten years. General Cigar makes it in the Dominican Republic and began shipping it in July 2023.',
    leaf: 'A 2013 Connecticut Broadleaf maduro wrapper over a Honduran binder, with Brazilian Mata Fina, Nicaraguan, and Dominican filler.',
    taste:
      'Spice, black pepper, and heavy leather up front, then creamy chocolate and espresso in the middle. It ends drier with leather, cedar, and pepper. About an hour in the Robusto.',
    proof: "A blind panel at Blind Man's Puff scored the Robusto 92, a rating of Great.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'dd31fc83-0987-55b1-85c4-84669f3f384c',
    name: 'Matilde Oscura',
    brand: 'Matilde',
    online: 9,
    why: 'Dark and cocoa sweet, but smoother than it looks. Medium to medium-full.',
    story:
      "Blended by Jose Seijas and made in the Dominican Republic. It is the second Matilde line, built to be bolder than the first, and the strongest of the company's core blends.",
    leaf: 'A dark Mexican San Andres wrapper over an Ecuadorian Sumatra binder, with Dominican, Nicaraguan, and Pennsylvania filler.',
    taste:
      'Cocoa and a touch of sweetness up front with a pepper kick, then creamy and nutty with some coffee. Leather and pepper build at the end.',
    proof:
      "Cigar Aficionado gave the Toro Bravo 91 points in October 2022. Blind Man's Puff scored the Toro Bravo 91 in December 2015.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'cf51a53a-3a26-510d-9ded-fa831f942b7d',
    name: 'Micallef Black',
    brand: 'Micallef',
    online: 7,
    why: 'A well-made dark cigar at a low price. Medium to full, building in the second half.',
    story:
      "Made at Micallef's own factory in Esteli, Nicaragua. It was the first cigar in the Color Series, built as the brand's strongest blend after its fan group kept asking for something bolder.",
    leaf: 'A Mexican San Andres maduro wrapper over an Ecuadorian Habano binder and Nicaraguan filler.',
    taste:
      'Mocha, bitter dark chocolate, and coffee with mineral, earth, and black pepper, plus a little fruit and citrus. The strength grows in the second half.',
    proof: 'Cigar Coop ranked the Toro number 13 on its 2023 Cigar of the Year list.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '5f4e8559-8ee6-59c1-b49b-e2676b57c37d',
    name: 'Micallef Blue',
    brand: 'Micallef',
    online: 7,
    why: "An easy, low-priced medium smoke from Micallef's Color Series, with tobacco from four countries.",
    story:
      "The second cigar in Micallef's Color Series, a medium follow-up to the stronger Black. It is made at the company's factory in Esteli, Nicaragua, with tobacco from four countries.",
    leaf: 'A Mexican San Andres Sumatra wrapper over an Ecuadorian Habano binder with Nicaraguan and Dominican filler.',
    taste:
      'Natural tobacco, citrus, cedar, and cream with some pepper. The Robusto opens with smoky oak and a salty note and runs about an hour and 15 minutes.',
    proof: 'Cigar Coop ranked the Toro number 29 on its 2024 Cigar of the Year list.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '2fe08480-e7c4-5c1d-a250-01428d618b0e',
    name: 'Micallef Connecticut',
    brand: 'Micallef',
    online: 11,
    why: 'Gentle, sweet, and well made. Mild to medium, and a safe first cigar.',
    story:
      'Made in Esteli, Nicaragua, with the Gomez Sanchez family. The tobacco is aged four years, and the cigars rest at least a year after rolling.',
    leaf: 'An Ecuadorian Connecticut wrapper over a Nicaraguan Habano binder with Nicaraguan and Dominican filler.',
    taste:
      'Graham cracker, black tea, almond, and lemon peel, with sweet creamy cedar and cinnamon. Honey-roasted peanut and vanilla follow, and it ends on earth and coffee.',
    proof:
      "Blind Man's Puff scored the Toro 92 in April 2020. Cigar Aficionado gave the Robusto 88 points in August 2022.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'ca4615c2-ee02-5288-a248-f0f20b412cff',
    name: 'Micallef Green',
    brand: 'Micallef',
    online: 7,
    why: 'Smooth, balanced, and medium. Cocoa, coffee, and nuts, and a good one for a newer smoker.',
    story:
      "The fifth blend in Micallef's low-priced Color Series, made at the company's own factory in Esteli, Nicaragua. It is the one built around a Brazilian wrapper.",
    leaf: 'A Brazilian Mata Fina wrapper over a Mexican San Andres Negro binder and Nicaraguan filler.',
    taste:
      'Opens with cayenne, cocoa, wood, almond, coffee, and cream. The pepper softens, walnut and mocha come in, and it finishes on dark chocolate, cedar, coffee, and leather.',
    proof:
      "The Cigar Authority scored the Toro 91.33 in November 2025. Cigar Coop's Smoking Syndicate show scored the Robusto 90 in May 2026.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '60542ed8-7263-5b8e-a38c-21ee18861ae9',
    name: 'Micallef Herencia Habano',
    brand: 'Micallef',
    online: 13,
    why: 'A sweet, easy-drawing medium cigar. Brown sugar and pecan, box-pressed, with a 91 behind it.',
    story:
      "Made at Micallef's factory in Nicaragua. Herencia means heritage, and this is the Gomez Sanchez family's heritage cigar. It is box-pressed.",
    leaf: 'A Nicaraguan Habano wrapper over an Ecuadorian Sumatra binder with Nicaraguan and Honduran filler.',
    taste:
      'Brown sugar sweetness, pecan, dried date, and herbs, closing on cocoa and coffee. It draws easily and burns evenly.',
    proof: "Cigar Aficionado's Cigar Insider gave the Toro 91 points in October 2020.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'e0d02c8b-799b-5fb9-a7cb-6772a2076e3e',
    name: 'Micallef Herencia Maduro',
    brand: 'Micallef',
    online: 13,
    why: 'A medium, box-pressed maduro for someone who likes a darker leaf, with four-year-aged tobacco.',
    story:
      "The maduro half of Micallef's Herencia pair, made in Nicaragua. It has the same binder and filler as the Herencia Habano under a darker wrapper, and the tobacco is aged four years.",
    leaf: 'A Nicaraguan maduro wrapper over an Ecuadorian Sumatra binder with Nicaraguan and Honduran filler.',
    taste:
      'Pepper, wood, spice, leather, and earth, with coffee and chocolate. Medium to full in body.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '42ef4df2-a8ce-57f8-9803-5e6fe82207cc',
    name: 'Micallef Reserva',
    brand: 'Micallef',
    online: 39,
    why: "Micallef's top cigar, with a great origin story and a 93 from Cigar Aficionado. Very pricey.",
    story:
      'The cigar the brand started with. Al Micallef met the Gomez Sanchez brothers rolling cigars at a Texas lounge after their car broke down, and asked them for a personal blend. It sells in boxes of five.',
    leaf: 'A Mexican San Andres Habano wrapper over a Nicaraguan binder with filler from Honduras, the Dominican Republic, and Peru.',
    taste:
      'Nutty and balanced. Roasted nuts, dried fruit, leather, and fresh coffee, with a long finish.',
    proof:
      'Cigar Aficionado gave the Churchill 93 points in January 2019, under the name Reserva Limitada Privada.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '4debdcbc-f1d1-510a-a110-ea1acbb93621',
    name: 'Montecristo Espada Conquistador',
    brand: 'Montecristo',
    online: 18,
    why: 'A new all-Nicaraguan Montecristo made by Plasencia. Medium to full, with cedar and dark chocolate.',
    story:
      "Made by Plasencia in Nicaragua for Altadis U.S.A., using only Nicaraguan tobacco grown by the Plasencia family. It is the newest cigar in the Espada series, which began in 2014 as Montecristo's first all-Nicaraguan line.",
    leaf: 'All Nicaraguan: a Jalapa wrapper, an Ometepe binder, and filler from Condega and Esteli.',
    taste:
      'Cedar, dark chocolate, toasted nut, and coffee. It is built to be stronger than the first Espada but not as powerful as the Espada Oscuro.',
    proof: '',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '37f2616f-0f91-5eb0-bc8c-04217243bc9c',
    name: 'My Father Blue',
    brand: 'My Father',
    online: 11,
    why: 'The gentle pick on the full shelf. Medium, with toasted almond, cocoa, and a hint of vanilla.',
    story:
      "The first My Father cigar made in Honduras, rolled at the Garcia family's new factory there with tobacco from their own Honduran farm. Every size is box-pressed, and the blue and white packaging nods to the Honduran flag.",
    leaf: 'A Connecticut Broadleaf Rosado wrapper grown in the United States over Honduran binder and filler.',
    taste:
      'Toasted almond, cocoa powder, sweet herbs, and a hint of vanilla before a somewhat dry finish. It draws easily and burns evenly.',
    proof: 'Cigar Aficionado gave the Robusto 91 points in December 2025.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '97caa53b-af7f-5ac9-b75e-776dc303e699',
    name: 'My Father Jaime Garcia Reserva Especial Connecticut',
    brand: 'My Father',
    online: 9,
    why: 'Mellow, creamy, and easy to like. Mild to medium, made at the My Father factory.',
    story:
      "Blended by Jaime Garcia, son of Jose 'Pepin' Garcia, and made at the My Father factory in Esteli, Nicaragua. It began in 2012 as a New England regional release and went nationwide in 2024.",
    leaf: 'An Ecuadorian Connecticut Shade wrapper over Nicaraguan binder and filler.',
    taste:
      'Creamy to start, with berry, cedar, and wood, leaning more toward cedar and wood at the end. Almond, butterscotch, and white pepper show too.',
    proof:
      'Cigar Coop scored this Connecticut blend 89 in December 2016, in a lonsdale size made for one shop.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'fb79aafd-985e-59da-8417-e5bc66f47b69',
    name: 'My Father La Dueña',
    brand: 'My Father',
    online: 8,
    why: 'Sweet, cocoa-rich, and medium. An easy dark cigar, balanced more than complex.',
    story:
      'Made at My Father Cigars in Esteli, Nicaragua, as a tribute to Janny Garcia. The name means the female owner. Pete Johnson of Tatuaje blended it with Jaime Garcia to be lighter than most My Father cigars.',
    leaf: 'A Connecticut Broadleaf wrapper over a binder and filler that mix Connecticut Broadleaf and Nicaraguan tobacco.',
    taste:
      'Cocoa and broadleaf sweetness lead, with coffee, leather, and a little black pepper. The middle turns to earth and leather, and it ends creamier with a touch of brown sugar.',
    proof: 'The Cigar Authority scored the 5 x 50 Robusto 90 in May 2015.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'bb64e45f-dd02-5e7a-b76e-400628e5e391',
    name: 'My Father La Lealtad',
    brand: 'My Father',
    online: 11,
    why: 'A brand-new My Father with a 93 from Cigar Aficionado. Rich and layered, medium-full.',
    story:
      "The second line from the Garcia family's Honduran factory, after My Father Blue. The name means loyalty, and the blend uses Honduran and Nicaraguan tobacco from the family's farms.",
    leaf: 'An Ecuadorian Habano Rosado Oscuro wrapper over Honduran and Nicaraguan binder and filler.',
    taste:
      'An earthy base carries stewed fruit, coffee bean, chocolate, and toffee, with citrus, clove, and cinnamon. The finish is like mulled wine.',
    proof: 'Cigar Aficionado gave the Robusto 93 points in October 2026.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'b33dd9ac-715a-57e6-9592-191c31da0db9',
    name: 'My Father La Opulencia',
    brand: 'My Father',
    online: 10,
    why: "Cigar Aficionado's number 2 cigar of 2018. Rich, box-pressed, and it builds strength as it burns.",
    story:
      'Made by the Garcia family at My Father Cigars in Nicaragua. It is a box-pressed cigar named after an old Cuban trademark the Garcias revived, with a label that reworks artwork from 1897.',
    leaf: 'A dark Mexican San Andres Rosado Oscuro wrapper over Nicaraguan Corojo and Criollo binders and Nicaraguan filler from the Garcia farms.',
    taste:
      'Earthy chocolate and cocoa, with oak in the middle and lighter, sweeter notes of anise and nougat. It gets stronger as the flavors build.',
    proof: 'Cigar Aficionado gave the Toro 95 points and ranked it number 2 on its Top 25 of 2018.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'da76b43d-74fe-51fc-907b-40159a39f732',
    name: 'My Father La Promesa',
    brand: 'My Father',
    online: 10,
    why: 'Nutty, steady, and well made, with a good story in the name. Medium to medium-full.',
    story:
      "Made at My Father Cigars in Nicaragua with tobacco from the Garcia family farms. It is named for the promise Jose 'Pepin' Garcia made to his family before leaving Cuba, that he would prove himself in the cigar world.",
    leaf: 'An Ecuadorian Habano Rosado Oscuro wrapper over Nicaraguan binder and filler.',
    taste:
      'Mostly nutty, with caramel, mild milk chocolate, and white pepper, then creamy cedar. A little earthy bitterness at the end.',
    proof:
      "Cigar Aficionado gave the Lancero 92 points in February 2026. Blind Man's Puff scored the Lancero 89.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c7c41729-959b-5e29-b70e-887fdc5e0b81',
    name: 'Oscar Valladares 10th Anniversary',
    brand: 'Oscar Valladares',
    online: 20,
    why: 'A showy boutique stick with a green leaf at the foot. Medium to medium-full.',
    story:
      "Made at Oscar Valladares' factory in Danli, Honduras, to mark the company's first ten years. A band of green candela leaf wraps the foot of the dark cigar, and it comes in boxes of 10.",
    leaf: 'A dark Mexican San Andres maduro wrapper with Honduran candela at the foot, over a Honduran binder.',
    taste:
      'The first puffs are grassy and sweet from the candela. Once the burn passes it, the smoke turns to citrus, chocolate, earth, and vanilla bean.',
    proof: "Cigar Aficionado's Cigar Insider gave the Toro 91 points in December 2022.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'b25bfff4-fdd7-564c-98c5-51b546488c81',
    name: 'Oscar Valladares 2012 by Oscar Barber Pole',
    brand: 'Oscar Valladares',
    online: 11,
    why: 'The green and dark striped wrapper starts conversations, and it smokes as a true medium.',
    story:
      "Made at Oscar Valladares' own factory in Danli, Honduras. It began in late 2017 as an exclusive for The Cigar Shop in the Carolinas and later went nationwide. It is box-pressed and comes as a Toro or a Lancero.",
    leaf: 'A barber pole of dark Mexican San Andres maduro and green candela over a Nicaraguan binder with Honduran and Nicaraguan filler.',
    taste:
      'Grass, coffee, and white pepper to start, with some maduro sweetness. Coffee takes over, a light smoky note shows in the middle, and pepper builds toward the end.',
    proof:
      "Cigar Coop scored the Toro 91 in January 2018. Blind Man's Puff scored the Lancero 92 in April 2022.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '303131c8-5162-5f81-8901-eaa74ce42b89',
    name: 'Padron 1926 Serie Maduro',
    brand: 'Padron',
    online: 18,
    why: "Padron's top-shelf maduro. Full strength, scored in the 90s, and one for a seasoned smoker.",
    story:
      "Made by the Padron family in Esteli, Nicaragua. It came out in 2002, shortly after founder Jose O. Padron's 75th birthday, and every leaf is aged at least five years. All sizes are box-pressed.",
    leaf: 'All Nicaraguan: a dark maduro wrapper over Nicaraguan binder and filler, aged five years.',
    taste:
      'Earthy and peppery, with dark-roast coffee and dark chocolate. Black pepper builds, then fades late into molasses and brown sugar.',
    proof:
      'Cigar Aficionado ranked the No. 48 Maduro number 2 on its Top 25 of 2023. Cigar Coop put the 1926 Maduro in its Hall of Fame in 2011.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '775a8704-b748-5f1c-8c5f-33761b78a6f3',
    name: 'Padron 1926 Serie No. 40 (40th Anniversary)',
    brand: 'Padron',
    online: 32,
    why: "Cigar Aficionado's first Cigar of the Year. A full strength special occasion torpedo with a story to tell.",
    story:
      "Made by the Padron family in Nicaragua for the company's 40th anniversary in 2004. It is a box-pressed torpedo with every leaf aged at least five years. It came in hand-painted boxes of 40 and is now a rare part of the 1926 line.",
    leaf: 'All Nicaraguan wrapper, binder, and filler, aged at least five years. It comes in a natural or a maduro wrapper.',
    taste:
      'Heavy chocolate framed by earthy spices, with a long finish. Cocoa, cayenne, cinnamon, cedar, nuts, and coffee. Slightly stronger than a Padron Anniversary.',
    proof:
      'Cigar Aficionado named the natural wrapper version its number 1 cigar of 2004, with a 93 point rating.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'fb207e08-24e5-5f06-b565-adb6b889f1eb',
    name: 'Padron Black PB-99',
    brand: 'Padron',
    online: 45,
    why: 'A rare, pricey Padron for the collector. Medium, with fruit, spice, and a sweet raisin note.',
    story:
      "Made by the Padron family in Nicaragua and named for what would have been founder Jose Orlando Padron's 99th birthday. Unlike most Padrons it is round, not box-pressed, and the Black line goes only to select retailers.",
    leaf: 'All Nicaraguan wrapper, binder, and filler. It comes in a natural or a maduro wrapper.',
    taste:
      'Tangy fruit and spice against sweeter toasted marshmallow and raisin, with a light woody note. Dark cocoa, earth, and black pepper are there too, and the maduro is darker and sweeter.',
    proof: 'Cigar Aficionado scored the PB-99 89 points in its April 2026 issue.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '850dc2f7-53b5-50af-8400-94ddd14af936',
    name: 'Padron Series 3000',
    brand: 'Padron',
    online: 10,
    why: 'A fair-priced Padron and the perfect introduction to the brand. Medium to medium-full.',
    story:
      'Made by the Padron family in Esteli, Nicaragua. The 3000 is the 5 1/2 x 52 size in the original Padron line, the perfect introduction to the brand. It comes in natural or maduro.',
    leaf: 'All Nicaraguan wrapper, binder, and filler, in a natural or a maduro wrapper.',
    taste:
      'The natural opens with black and red pepper, toasted cedar, and earth, then cream and dark-roast coffee. Charred wood and dark chocolate show too, ending in salted nuts and vanilla.',
    proof: "The Cigar Authority's blind panel scored the 3000 Natural 90.13 out of 100.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '4bbe94e0-42bf-5ae8-9e2d-1628866ccc20',
    name: 'Padron Series 6000',
    brand: 'Padron',
    online: 12,
    why: 'A steady 90-plus scorer at a fair price. Cocoa and leather, medium-full, a step under full.',
    story:
      'Made by the Padron family in Esteli, Nicaragua. The 6000 is the only pointed-head torpedo among the numbered sizes in the original Padron line. It comes in natural or maduro.',
    leaf: 'All Nicaraguan wrapper, binder, and filler, in a natural or a maduro wrapper.',
    taste:
      'Big cocoa and leather notes edged with raisin, coffee, and cedar. A lush draw and an even burn.',
    proof:
      'Cigar Aficionado scored the 6000 93 in October 2024 and 91 in August 2026. The 6000 Maduro was number 23 on its Top 25 of 2004.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'abb5b303-842e-5f99-9ba6-ddced2aaeb0d',
    name: 'Padron Series 7000',
    brand: 'Padron',
    online: 13,
    why: 'A big, easy-drawing Padron that scores 90 and up. Thick as it is, the Maduro smokes medium.',
    story:
      'Made by the Padron family in Esteli, Nicaragua. At 6 1/4 x 60 the 7000 is the thickest size in the original Padron line. It comes in natural or maduro.',
    leaf: 'All Nicaraguan wrapper, binder, and filler, in a natural or a maduro wrapper.',
    taste:
      'The Maduro starts toasty and tangy, then shows hardwood, leather, and hazelnut that turn rich and balanced. An open, easy draw.',
    proof:
      'Cigar Aficionado scored the 7000 Maduro 92 in October 2026 and 90 in both October 2023 and December 2024.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '1ff459b6-abd6-5f13-9e5f-0f683f570d0e',
    name: 'Partagas Black Label',
    brand: 'Partagas',
    online: 13,
    why: 'Dark, heavy, and charry. Full strength, for a regular who likes strong black coffee.',
    story:
      'The dark, full-bodied member of the Partagas family, made in the Dominican Republic. It is built around a nearly black wrapper and a filler heavy in strong ligero leaf.',
    leaf: 'A nearly black Connecticut Broadleaf wrapper over a Dominican binder with Dominican and Nicaraguan filler.',
    taste:
      'Heavy licorice, tar, and char that carry through to a sticky finish. Charry anise and toast with earth, nuts, and herbs.',
    proof:
      'Cigar Aficionado gave the 6 x 60 Piramide 88 points in 2010 and 2005, and 87 in June 2020.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'a62a4d1c-4a65-5237-b32a-864904ae0a7d',
    name: 'Partagas Valle Verde',
    brand: 'Partagas',
    online: 7,
    why: 'A low-priced, earthy San Andres smoke. Medium-full and it ends full, so not a first cigar.',
    story:
      'A 2023 Partagas made in Honduras by Scandinavian Tobacco Group. It pairs a Mexican San Andres wrapper with a Cameroon binder.',
    leaf: 'A Mexican San Andres wrapper over a Cameroon binder, with filler from Mexico and Nicaragua.',
    taste:
      'The Robusto opens mellow, creamy, and nutty with a little pepper, moves to baking spice and clove, then turns darker with leather and ends full but smooth.',
    proof: 'Cigar Aficionado gave the Toro 6 x 52 88 points in December 2023.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'aada4000-19ac-5246-bc57-046e2736fcd8',
    name: 'Partagas Y Nada Más Cibao',
    brand: 'Partagas',
    online: 8,
    why: 'New in 2026 and cheap to try. Medium to full, with dark wood, mocha, and leather.',
    story:
      'The second cigar in the Partagas Y Nada Mas series, shipped in May 2026. It is made at Tabacalera La Isla in the Dominican Republic and built around tobacco from the Cibao Valley.',
    leaf: 'An Ecuadorian Corojo wrapper over an Ecuadorian Sumatra binder, with Dominican filler from the Cibao Valley plus Pennsylvania Broadleaf.',
    taste: 'Medium to full-bodied, with dark wood, mocha, leather, and white pepper.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'e28d89c4-9dc5-506e-a33f-e3f851a56e52',
    name: 'Partagas Y Nada Más Santiago',
    brand: 'Partagas',
    online: 7,
    why: 'A true medium at a low price with a 91 from Cigar Aficionado. An easy pick for the now and then smoker.',
    story:
      'The first cigar in the Partagas Y Nada Mas series, released in 2025 and named for the Dominican city of Santiago. It is rolled at Tabacalera William Ventura, not at the usual Partagas factory.',
    leaf: 'A Habano 2000 wrapper over a Sumatra binder, with Piloto Cubano, Corojo, Ecuadorian, and Broadleaf filler.',
    taste:
      'Toasted cedar, earth, and crushed red pepper to start, shifting to black pepper with a little creamy leather. It ends with heavy toast and stays medium throughout.',
    proof: 'Cigar Aficionado gave the Robusto 91 points in its March/April 2026 issue.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '3c85bb9a-2816-529d-975b-38459903fbd5',
    name: 'Perdomo Lot 23 Connecticut',
    brand: 'Perdomo',
    online: 10,
    why: 'Smooth, creamy, and easy on the wallet. Mild to medium, and a gentle first cigar.',
    story:
      'Made by Tabacalera Perdomo in Nicaragua. Nick Perdomo Sr. started the Lot 23 project in 2000, and the binder and filler all come from one farm plot in Esteli, like a single-vineyard wine.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper aged five years over Cuban-seed Nicaraguan binder and filler from the Lot 23 farm.',
    taste:
      'Smooth and creamy, sweet and woody, with mocha, roasted nuts, and honey at first. It mellows to earth and leather, with soft cedar and honey on the finish.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '422e65aa-4e8f-544a-8702-83e8ce3d1fbc',
    name: 'Perdomo Lot 23 Maduro',
    brand: 'Perdomo',
    online: 10,
    why: 'A value maduro full of cocoa and coffee, all from one Nicaraguan farm. Medium to full.',
    story:
      "Made by Tabacalera Perdomo in Nicaragua. All of the tobacco comes from the family's Lot 23 farm, which Nick Perdomo developed with his father starting in 2000, and it is aged at least five years. The maduro joined in 2007.",
    leaf: 'All Nicaraguan: a Cuban-seed Nicaraguan maduro wrapper over Cuban-seed Nicaraguan binder and filler from one farm.',
    taste:
      'Cocoa and coffee blend into mocha early, with dried fruit, pepper, cedar, and oak behind. Coffee leads in the middle, and pepper and cedar join it at the end.',
    proof:
      'Cigar Coop scored the Toro 6 x 50 91 points in June 2020 and rated it Box Worthy Consideration.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '9eef1ad6-8061-5590-acd1-6dbf0b65c8ac',
    name: 'Perdomo Reserve 10th Anniversary Maduro',
    brand: 'Perdomo',
    online: 11,
    why: 'Mocha-sweet and well made. Medium in strength, so a safe step up for a newer smoker.',
    story:
      'Made by Tabacalera Perdomo in Nicaragua and added to the Reserve 10th Anniversary line in 2020. It is box-pressed, and the six-year-old maduro wrapper spends another 14 months in bourbon barrels.',
    leaf: 'All Nicaraguan: a Cuban-seed Nicaraguan maduro wrapper over Cuban-seed Nicaraguan binder and filler.',
    taste:
      'Mocha up front with citrus, oak, and cedar. Espresso takes the lead, and a little red pepper builds late.',
    proof:
      "Cigar Coop scored the Robusto 91 and ranked it number 6 on its 2021 Cigar of the Year countdown. Blind Man's Puff's blind panel scored the Epicure 91.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '2f857ea9-600f-503d-a69e-07d267963470',
    name: 'Plasencia Alma del Cielo',
    brand: 'Plasencia',
    online: 27,
    why: 'A sweet, refined, high-priced Plasencia with a real farm story. Gentle in strength, big on craft.',
    story:
      'Made by the Plasencia family in Nicaragua with tobacco from Finca San Julian, a farm 3,500 feet up in the mountains. Nestor Plasencia bought the farm in 1998 as a gift for his wife, whose family once owned it.',
    leaf: 'All Nicaraguan and all grown by the Plasencias: a Jalapa wrapper, with some filler from the San Julian farm.',
    taste:
      'Opens with incense, then turns sweet and buttery with oak, marzipan, mint, and brown sugar. Butterscotch on the finish.',
    proof:
      'Cigar Aficionado scored the Celeste 94 in its July/August 2026 issue and the Boreal 90 in 2025.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'ffdb7b44-86f1-5507-8140-29d482e7fe44',
    name: 'Plasencia Alma del Fuego',
    brand: 'Plasencia',
    online: 18,
    why: 'Spicy, mineral, and built on volcanic-island leaf. A craft pick with a story, medium to full.',
    story:
      'Made by the Plasencia family in Nicaragua, the third cigar in their Alma series. It is built around tobacco from the volcanic island of Ometepe, aged seven years. It is box-pressed.',
    leaf: 'All Nicaraguan: a sun grown wrapper from Jalapa over two binders, one from Ometepe, with about half the filler from Ometepe.',
    taste:
      'Spicy and woody with coffee bean, dried fruit, and cloves, and a nutty, sweet finish. Mocha and mineral notes show, with more pepper late. About 70 minutes in the robusto.',
    proof:
      'Cigar Aficionado rated the Concepcion toro 93 and ranked it number 13 on its Top 25 of 2019. Cigar Coop scored the Candente robusto 91.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '38e0e4a5-3c0e-5849-91db-01bc1219c310',
    name: 'Plasencia Cosecha 149',
    brand: 'Plasencia',
    online: 16,
    why: 'An all-Honduran, single-harvest smoke with a good story. Medium to medium-full.',
    story:
      "Made by the Plasencia family at Tabacos de Oriente in Honduras. Every leaf comes from the family's 149th harvest, picked in 2014 and aged about seven years. It followed the Cosecha 146.",
    leaf: 'All Honduran: a wrapper from Olancho over a Jamastran binder, with filler from Jamastran, Talanga, and Olancho.',
    taste:
      'Hearty black pepper and cedar to start, then earth, coffee, and baking spice with a slightly ashy finish. It leaves the palate a little dry.',
    proof:
      "Cigar Dojo named it its number 4 Cigar of the Year for 2021. Blind Man's Puff scored the Azacualpa toro 92.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'a3bc604d-ee98-50a6-be39-2e9bfc379294',
    name: 'Plasencia Cosecha 151',
    brand: 'Plasencia',
    online: 15,
    why: 'A single-harvest Honduran with strong scores. Rich like fruitcake, medium-full rather than heavy.',
    story:
      "Made by the Plasencia family at Tabacos de Oriente in Honduras. Every leaf comes from one crop, the 2016 to 2017 harvest, the family's 151st since 1865. It is the third cigar in their Cosecha series.",
    leaf: "All Honduran wrapper, binder, and filler, mostly Criollo '98 in the La Musica size.",
    taste:
      'Like a slice of fruitcake: baking spices, candied fruit, walnut, and molasses, with a rum-barrel finish and an oaky aftertaste.',
    proof:
      'Cigar Aficionado gave La Musica 92 points and ranked it No. 17 of 2024. Cigar Dojo scored the San Diego 91.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '2222afd5-1305-5496-b60b-2590d11e4caf',
    name: 'Plasencia Reserva Original',
    brand: 'Plasencia',
    online: 11,
    why: 'Gentle for a medium, well made, and all organic. Toasty and nutty with a little honey.',
    story:
      'Made by the Plasencia family in Nicaragua. It is the only cigar made entirely with tobacco certified organic by the OCIA. It went national in 2017 when the family launched its own brand in the U.S.',
    leaf: 'A Nicaraguan Habano wrapper over Nicaraguan binder and filler, all certified organic.',
    taste:
      'Toasty and nutty, with orange peel, honey, almond paste, and baking spices. It finishes like tea and a cookie. The Robusto runs about 70 minutes.',
    proof:
      "Cigar Aficionado gave the Corona 92 points and ranked it No. 25 of 2022. Blind Man's Puff scored the Robusto 91 in a blind review.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '24b0d9cb-2815-5f5a-9252-0cc036e5672f',
    name: 'Punch Clásico',
    brand: 'Punch',
    online: 7,
    why: 'A familiar name at a low price. Peppery and earthy, the core Honduran Punch since 1969.',
    story:
      'The core Honduran Punch from General Cigar, now sold under the Clasico name. It is rolled at the STG Danli factory in Honduras, and the line dates to 1969.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Connecticut Broadleaf binder, with filler from Honduras, Nicaragua, and the Dominican Republic.',
    taste:
      'Heavy, peppery spice over an earthy base. The Rothschild is full of peppery, nutty flavors and ends on a delicate finish.',
    proof: 'Cigar Aficionado scored the Rothschild 86 points in June 2003.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '45615163-1c3e-58ca-8457-6810ad460c9f',
    name: 'Punch Diablo',
    brand: 'Punch',
    online: 12,
    why: 'The strongest Punch, made by AJ Fernandez. Dark, dense, and too much for a beginner.',
    story:
      "General Cigar's strongest Punch, made by AJ Fernandez in Esteli, Nicaragua. It was the first General-owned Punch made outside Honduras.",
    leaf: 'An Ecuadorian Sumatra Oscuro wrapper over a Connecticut Broadleaf binder, with Habano ligero filler from Nicaragua and Honduras.',
    taste:
      'Like dense chocolate fudge studded with espresso beans and walnuts. Mocha, wood, white pepper, cedar, and earth run underneath.',
    proof:
      "Cigar Aficionado gave the Scamp 93 points and ranked it No. 16 of 2019. Blind Man's Puff also scored the Scamp 93.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '54dc1e47-1a45-5588-b18c-79c8e1560fb4',
    name: 'Punch Gran Puro',
    brand: 'Punch',
    online: 11,
    why: 'A two-time Cigar Aficionado Top 25 pick at a fair price. Lively Honduran flavor, medium to medium-full.',
    story:
      'An all-Honduran Punch from General Cigar, made at STG Danli since 2003. General grows the tobacco in the San Agustin area of Honduras, near the Guatemala border.',
    leaf: 'A sun-grown, Havana-seed Honduran wrapper over Honduran binder and filler.',
    taste:
      'Leather, baking spice, black pepper, earth, and cedar. A good example of how vibrant Honduran cigars can be.',
    proof:
      'Cigar Aficionado gave the Santa Rita 93 points and ranked it No. 10 of 2016, after ranking it No. 20 of 2012.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '5f468b3f-9133-5600-9b18-81711f2d0d3d',
    name: 'Punch Gran Puro Nicaragua',
    brand: 'Punch',
    online: 9,
    why: 'An easy, earthy maduro at a good price. Medium to medium-full, with a creamy finish.',
    story:
      'A spinoff of Punch Gran Puro from General Cigar, released in 2017. It is rolled in Honduras but named for its Nicaraguan binder and filler.',
    leaf: 'A dark Connecticut Broadleaf maduro wrapper over Nicaraguan binder and filler.',
    taste:
      'A slow starter that turns fruity and nutty, with tangy cloves and a creamy finish. Earth, cocoa, and wood sit underneath.',
    proof:
      'Cigar Aficionado listed the 5 1/2 x 54 at 90 points and called it a bargain. It scored the 7 1/2 x 54 at 89 in August 2018.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '9fb6b320-cc4a-5163-891f-2ce592a07e61',
    name: 'Punch Knuckle Buster Maduro',
    brand: 'Punch',
    online: 5,
    why: 'A cheap everyday maduro from Punch. Nuts, molasses, and cocoa, medium to medium-full.',
    story:
      "The second blend in Punch's budget-priced Knuckle Buster family from General Cigar, released in 2022. It is made at the HATSA factory in Honduras as a no-nonsense cigar at a low price.",
    leaf: 'A Connecticut Broadleaf wrapper over an Indonesian binder and Nicaraguan filler.',
    taste:
      'Nuts, molasses, black cherry, and cocoa. Damp earth and wood sit underneath, with a firm draw.',
    proof: 'Cigar Aficionado scored the Robusto 86 points in August 2023.',
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '0215a6a2-c7fd-53bc-a911-7586f2145159',
    name: 'Punch Knuckle Buster Shade',
    brand: 'Punch',
    online: 5,
    why: 'About $5 and it scored 90. The lightest Knuckle Buster, toasty and a little sweet, right around medium.',
    story:
      "The third and lightest Knuckle Buster blend from Punch, a General Cigar brand, released in March 2024. It is made in Honduras with tobacco from six countries and keeps the line's low price.",
    leaf: 'An Ecuadorian Connecticut Shade wrapper over a Mexican binder. The filler is Colombian, Dominican, Nicaraguan, and U.S. Broadleaf.',
    taste:
      'Toasty, with brown sugar and jam, a floral note, and a rye-bread finish. Nutty and earthy underneath, with an easy draw.',
    proof:
      "Cigar Insider, Cigar Aficionado's newsletter, scored the Robusto 90 points in May 2024.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '3eae70ef-820f-5f50-9b12-47116dae8823',
    name: 'Punch Signature',
    brand: 'Punch',
    online: 12,
    why: 'A bold, peppery Punch for a regular smoker. Best on a full stomach.',
    story:
      'A fuller Punch from General Cigar, made at STG Danli in Honduras since 2015 as a tribute to the original non-Cuban Punch blend. The Ecuadorian Corojo wrapper was grown just for this line.',
    leaf: 'An Ecuadorian Corojo wrapper over a Connecticut Habano binder, with Dominican and Nicaraguan filler.',
    taste:
      'It opens with a hit of pepper, then settles into leather, nuts, cedar, and earth. The cayenne heat stays with you the whole way.',
    proof:
      "Blind Man's Puff scored the Robusto 91 in August 2015. Cigar Insider, Cigar Aficionado's newsletter, gave the Rothschild 90 in March 2015.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '8e029db4-e2bb-5f79-84dc-1c3a4d15f6d8',
    name: 'Rocky Patel Dark Star',
    brand: 'Rocky Patel',
    online: 11,
    why: 'An oddball for a curious regular, built around rare Paraguayan-seed tobacco. Bready, nutty, and earthy.',
    story:
      'Made for Rocky Patel at the El Paraiso factory in Honduras and released in 2023. It is known for the Paraguayan-seed tobacco in the filler, a first for the brand.',
    leaf: 'A Honduran Corojo wrapper over a Honduran binder, with Honduran filler that includes Paraguayan-seed leaf.',
    taste:
      'Sourdough bread, cedar, and nuts first, then black pepper and earth. It ends salty and mineral.',
    proof: "The Cigar Authority's blind panel scored the Robusto 88.8 in September 2024.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '97fcd9c1-613e-58c8-ace8-00f8084043b3',
    name: 'Rocky Patel DBS',
    brand: 'Rocky Patel',
    online: 16,
    why: 'A pricey, dark cigar for a regular who wants to try rare broadleaf. Peppery, around medium in strength.',
    story:
      "Made at Rocky Patel's TAVICUSA factory in Esteli, Nicaragua, and released in 2022. DBS stands for Double Broadleaf Selection, after the two broadleaf tobaccos inside. The wrapper is not broadleaf.",
    leaf: 'A Mexican San Andres wrapper over a binder of Nicaraguan leaf and Pennsylvania Broadleaf, with Honduran and Nicaraguan Broadleaf filler.',
    taste:
      'Peppery, with licorice, wood, and a touch of coconut. The Toro leans to earth, mineral, mocha, and white pepper.',
    proof:
      "Cigar Coop scored the Toro 89 in October 2023. Cigar Insider, Cigar Aficionado's newsletter, scored the Robusto 87 in June 2023.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'f17250ec-0a30-5070-b67e-98fb1d9e5400',
    name: 'Rocky Patel Decade',
    brand: 'Rocky Patel',
    online: 13,
    why: "Rocky Patel's best-known classic. Creamy, balanced, and easy to like, at medium-full.",
    story:
      "A box-pressed cigar made for Rocky Patel at Nestor Plasencia's El Paraiso factory in Honduras. It came out in 2007 to mark his tenth year in the business.",
    leaf: 'A dark Ecuadorian Sumatra wrapper over Nicaraguan binder and filler.',
    taste:
      'Balanced and elegant, with a creamy texture, black cherry, and a nutty finish. The Robusto adds cocoa powder and an herbal note, and it burns steady.',
    proof:
      "Cigar Aficionado gave the Torpedo 92 points, ranked it No. 15 of 2008, and called it Rocky Patel's masterpiece. It scored the Robusto 91 in December 2012.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '15624c75-c551-5daf-9081-089cbf229c66',
    name: 'Rocky Patel Disciple',
    brand: 'Rocky Patel',
    online: 12,
    why: 'A dark San Andres cigar with mocha from start to finish. Rich in flavor, medium in strength.',
    story:
      "Made at Rocky Patel's TAVICUSA factory in Esteli, Nicaragua, and released in 2021. It flew under the radar at that year's trade show, but it should not be ignored.",
    leaf: 'A dark Mexican San Andres wrapper over Nicaraguan binder and filler.',
    taste:
      'Mocha up front the whole way, with dried fruit, earth, cedar, and pepper behind it. The first two thirds are the best part.',
    proof:
      'Cigar Coop scored the Toro 90 and ranked it No. 19 on its 2022 Cigar of the Year list. Cigar Aficionado scored the Bala 90 in December 2022.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '9432b004-2f13-56e5-87bb-b2491b7e81c3',
    name: 'Rocky Patel Emerald',
    brand: 'Rocky Patel',
    online: 12,
    why: "Cigar Aficionado's No. 6 cigar of 2025, and a blend that is very easy to love. Not mild, not strong.",
    story:
      "A box-pressed cigar in a bright green sleeve, made at Rocky Patel's TAVICUSA factory in Nicaragua. It began shipping in December 2024 as his first box-pressed blend on the lighter side of medium.",
    leaf: 'An Ecuadorian Habano wrapper over two binders, one Nicaraguan and one Mexican, with Nicaraguan and Honduran filler.',
    taste:
      'Ground coffee, leather, and hickory with a touch of black pepper. The Toro opens with a blast of pepper, then turns sweeter, ending in gingerbread, chocolate, and cinnamon.',
    proof:
      "Cigar Aficionado gave the Robusto 95 points and ranked it No. 6 of 2025. The Cigar Authority's blind panel scored the Toro 91.38.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'da540b71-3521-5910-8cd9-c0937c70be8c',
    name: 'Rocky Patel Fifty-Five',
    brand: 'Rocky Patel',
    online: 13,
    why: 'An unusual double-tapered shape with strong scores. Coffee, wood, and earth at medium-full, so not a starter.',
    story:
      "Made at Rocky Patel's TaviCusa factory in Esteli, Nicaragua, to mark his 55th birthday in 2016. Every size is a 55 ring gauge with both ends tapered.",
    leaf: 'A Nicaraguan wrapper over a Costa Rican binder and Nicaraguan filler.',
    taste:
      'Rich woods, roasted coffee, and earth, with a pleasant char and a hint of baking spice on the finish. Cocoa and espresso show up early, with a little fruity sweetness later.',
    proof:
      'Cigar Aficionado scored the Robusto 93 points in August 2024. Cigar Journal ranked the Robusto No. 7 on its Top 25 of 2017.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'bdf51748-8634-5730-bd20-15c12183d6bd',
    name: 'Rocky Patel Gold Label',
    brand: 'Rocky Patel',
    online: 12,
    why: 'Nutty and a little sweet, with an even burn. Medium to medium-full, and it comes in a short size.',
    story:
      "A box-pressed cigar wrapped in gold foil, made at Rocky Patel's TaviCusa factory in Nicaragua. It was his one new regular production release for 2024, and it comes in a 3 1/2 inch Half Corona for a short smoke.",
    leaf: 'An Ecuadorian Habano wrapper over Connecticut Shade and Connecticut Broadleaf binders, with aged Nicaraguan filler from Esteli and Jalapa.',
    taste:
      'Nutty and rich, with peanut, earth, leather, oak, and brown sugar, and a nougat finish. The Toro adds cocoa and raisin.',
    proof:
      'Cigar Aficionado gave the Robusto 94 points in December 2025. Its Cigar Insider newsletter scored it 92 in October 2024.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '256b616e-4351-59dc-bba4-0f80b4128b0b',
    name: 'Rocky Patel Grand Reserve',
    brand: 'Rocky Patel',
    online: 13,
    why: 'Smooth and well made, with two big awards behind it. A safe pick for someone who knows the name.',
    story:
      'Rocky Patel made this blend in 2018 for markets outside the United States, and it debuted in Austria. It reached U.S. stores in 2020.',
    leaf: 'Rocky Patel does not disclose the blend. The cigars rest two years in the aging room after rolling.',
    taste:
      'Savory and leathery, with crushed peanut, then salted caramel and licorice. The Toro is super creamy, with dried fruit, chocolate, tea, and nuts.',
    proof:
      'Cigar Journal named the Toro its No. 1 cigar of 2018. Cigar Aficionado gave the Robusto 93 points and ranked it No. 9 of 2021.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'aed3ad88-1af8-5910-85d5-1670271b04e1',
    name: 'Rocky Patel Quarter Century',
    brand: 'Rocky Patel',
    online: 13,
    why: 'Looks dark, smokes medium. Nutty, a little sweet, and it draws and burns well. A safe step up.',
    story:
      "Made at Rocky Patel's TAVICUSA factory in Esteli, Nicaragua, and released in 2020 for his 25 years in cigars. The tobacco was aged ten years before rolling, and the finished cigars rested two more.",
    leaf: 'A dark Mexican San Andres wrapper over a Honduran binder and Nicaraguan filler.',
    taste:
      'Nutty and bold, with dark chocolate, coconut, and an almond finish. Milk chocolate, earth, cedar, and white pepper come through, and the body builds in the second half.',
    proof:
      'Cigar Aficionado gave the Robusto 91 points in 2021. Cigar Coop ranked the Robusto No. 5 on its 2021 Cigar of the Year list.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '4e61b902-1761-5791-b52f-0d73cd3270dc',
    name: 'Rocky Patel Thirtieth Anniversary',
    brand: 'Rocky Patel',
    online: 17,
    why: "Rocky Patel's thirtieth anniversary cigar, with top scores. Chocolate and coconut, and milder than it looks.",
    story:
      "Made at Rocky Patel's TAVICUSA factory in Esteli, Nicaragua, and released in 2025 for the company's thirty years in business. It is box pressed and uses two Nicaraguan binders aged over seven years.",
    leaf: 'A Mexican San Andres wrapper over two Nicaraguan binder leaves, with Honduran and Nicaraguan filler aged over five years.',
    taste:
      'Floral at first, then chocolate and coconut, sweet licorice, and fruit, with a tangy finish. Dark cocoa and espresso come in at the end, and it burns even.',
    proof:
      "Cigar Aficionado gave the Robusto 93 points in 2026. The Cigar Authority's blind review scored the Toro 90.7 in March 2026.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '5fad471c-376d-5fa5-8ed2-4f4234419f2d',
    name: 'Rocky Patel Vintage 1992 Sumatra',
    brand: 'Rocky Patel',
    online: 11,
    why: 'A well-known name at a fair price. The spicier sibling of the Vintage 1990, with a ten-year-aged wrapper.',
    story:
      'A box-pressed Rocky Patel made in Danli, Honduras. It is the spicier sibling of the Vintage 1990, built around an Ecuadorian Sumatra wrapper aged ten years.',
    leaf: 'An Ecuadorian Sumatra wrapper aged ten years over a Nicaraguan binder, with Dominican and Nicaraguan filler.',
    taste:
      'Toasted cedar, earth, and black pepper, with a creamy sweetness early on. It starts medium and ends slightly above, and the last third turns earthy.',
    proof: 'Cigar Aficionado gave the Toro 89 points in 2004 and the Sixty 86 in 2023.',
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '6af218d3-78e2-55cb-a329-842190532698',
    name: 'Rocky Patel White Label',
    brand: 'Rocky Patel',
    online: 20,
    why: 'A premium Connecticut Shade, gentle with an easy draw. Mild to mild-medium, and priced on the high side.',
    story:
      "A premium Connecticut Shade cigar from Rocky Patel's TAVICUSA factory in Esteli, Nicaragua, released in 2021. The tobaccos were aged ten years, and the wrapper is grown in the Connecticut River Valley, not Ecuador.",
    leaf: 'A Connecticut Shade wrapper grown in the United States over a Nicaraguan binder, with Honduran and Nicaraguan filler.',
    taste:
      'Light and gentle. Straw and hay with hints of cappuccino, herbs, and almonds, plus light wood, lemon peel, and a little black pepper. The draw and burn are easy and even.',
    proof:
      'Cigar Aficionado gave the Churchill 89 points in 2023 and again in June 2026. Its Cigar Insider gave the Robusto 87 in 2022.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '47190d40-ac1b-5031-ab7d-ec037b9f96c1',
    name: 'Rojas Bluebonnets',
    brand: 'Rojas',
    online: 8,
    why: 'A balanced, medium boutique stick at a low price. Sweet and peppery, with thick, creamy smoke.',
    story:
      'A Corojo-wrapped line from boutique maker Noel Rojas, made in Esteli, Nicaragua, and named after the Texas bluebonnet flower. Rojas keeps the line to ring gauges of 50 and under.',
    leaf: 'An Ecuadorian Corojo wrapper over Nicaraguan binder and filler.',
    taste:
      'Sweet and peppery at the start, with berry, cream, and a touch of coffee. Dark chocolate, savory spice, and nuts come in later, and the smoke is thick and creamy.',
    proof: 'Stogie Press rated the Toro 92 in June 2020.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'efef425b-cf4d-5052-bc5a-caa5698efd89',
    name: 'Rojas Street Tacos Al Pastor',
    brand: 'Rojas',
    online: 9,
    why: 'A boutique blend with a fun story and savory, layered flavor. Big on taste, about medium in strength.',
    story:
      "The fourth blend in Noel Rojas's Street Tacos series, released in 2025 and named after the spit-roasted pork taco filling. It is made at the Rojas factory in Esteli, Nicaragua.",
    leaf: 'An Ecuadorian Habano wrapper over a Mexican San Andres binder, with Dominican and Nicaraguan filler.',
    taste:
      'Opens briny and salty with earth, leather, and oak. The middle turns creamy and sweet with vanilla, salted chocolate, and coffee, then pepper returns with dark chocolate.',
    proof:
      "The Cigar Authority's blind panel scored the Gordo 91.4 in July 2025 and called the construction flawless.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'b35d518c-f5d7-583f-98c5-831e969ceeea',
    name: 'Rojas Street Tacos Carnitas',
    brand: 'Rojas',
    online: 9,
    why: 'Smooth, mellow, and creamy, so it is easy on a newer smoker. The Connecticut of the Street Tacos line.',
    story:
      'The second Street Tacos blend from boutique maker Noel Rojas, released in July 2022 and made in Esteli, Nicaragua. It is the Connecticut-wrapped member of the series.',
    leaf: 'An Ecuadorian Connecticut wrapper over Nicaraguan binder and filler.',
    taste:
      'Smooth and mellow, with sweet tobacco, creamy smoke, a woody undertone, and a little white pepper. The flavor stays steady from start to finish.',
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '57a8036b-6460-522b-9fb0-ad28b1ffacfe',
    name: 'Rojas Unfinished Business',
    brand: 'Rojas',
    online: 8,
    why: 'A boutique name with a factory story. Medium, with cocoa, almond, and spice.',
    story:
      'A 2022 line from Noel Rojas and one of the first cigars rolled at his own factory in Esteli, Nicaragua. It has a semi-finished foot and keeps to ring gauges of 50 and under.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder, with Nicaraguan and Mexican filler.',
    taste:
      'A burst of dark cocoa and almond, then wood, malt, spice, and dark chocolate. Cedar, citrus, roasted coffee, leather, and nutmeg show up along the way.',
    proof:
      "Stogie Press rated the Corona Gorda 93 in June 2023. Blind Man's Puff scored it 91 in September 2022.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '85330f38-be41-54c2-82f8-97b41a0e3fa5',
    name: 'Romeo Y Julieta Reserva Real Nicaragua Profundo',
    brand: 'Romeo Y Julieta',
    online: 10,
    why: 'A name guests know, strong scores, and a fair price. Bold coffee and spice at medium-full.',
    story:
      "A darker take on the Romeo y Julieta Reserva Real Nicaragua, developed with AJ Fernandez and Rafael Nodal and rolled at Fernandez's factory in Esteli. It reached stores in 2026 and is all Nicaraguan tobacco.",
    leaf: 'A Nicaraguan oscuro wrapper, made dark by extra fermentation, over Nicaraguan binder and filler.',
    taste:
      'Bold, with strong coffee, dark toast, wood, and spice, and a leathery finish. Dark chocolate, espresso, and earth come through, with a sweet, molasses-like close.',
    proof: 'Cigar Aficionado gave the Churchill 93 points and the Robusto 92 points in 2026.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'edc72dfe-c6ce-5ad8-b99e-5244aaf2a8fe',
    name: 'Room 101 Johnny Tobacconaut Maduro',
    brand: 'Room 101',
    online: 9,
    why: 'A new, darker, stronger Room101 with a mascot and a story. Earth, espresso, and dark cocoa.',
    story:
      'Room101 founder Matt Booth created the Johnny Tobacconaut mascot about 11 years ago. This maduro version shipped in June 2026, made by AJ Fernandez in Nicaragua as a regular-production line in boxes of 20.',
    leaf: 'A Nicaraguan maduro wrapper over Nicaraguan binder and filler.',
    taste:
      'Earth, espresso, and dark cocoa, with some pepper. It is the darker, stronger follow-up, meant to be full bodied.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '288e229a-85c6-5792-8af6-a42edd5148a0',
    name: 'Sancho Panza Extra Chido',
    brand: 'Sancho Panza',
    online: 7,
    why: 'A cheap, quick, easy smoke with a nice cedar start. About 50 minutes in the Robusto.',
    story:
      "A 2024 addition to General Cigar's Sancho Panza, blended by Matt Booth and Justin Andrews. Unlike the Honduran-made lines, it is rolled in the Dominican Republic, with Dominican piloto filler aged in palm-leaf bales called tercios.",
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder, with Nicaraguan and Dominican piloto filler.',
    taste:
      'Starts with smoky cedar, pecan, and a sweet floral finish, with a minty note through the nose. It ends clean and simple. The Robusto takes about 50 minutes.',
    proof: 'Cigar Dojo scored the Robusto 86 percent in May 2025.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '61d76208-1314-58f2-b904-65c2701c99d9',
    name: 'Sancho Panza Extra Fuerte',
    brand: 'Sancho Panza',
    online: 8,
    why: 'Sweet and spicy, well made, and cheap. Medium in strength, and a gentle way into darker cigars.',
    story:
      'The strongest of the three Sancho Panza lines General Cigar reblended in 2022 with Matt Booth of Room101. It is made in Danli, Honduras.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Connecticut broadleaf binder from the United States, with Dominican and Nicaraguan filler.',
    taste:
      'Holiday spice, gingerbread, molasses, and brown sugar with a sweet tea finish. Salted dark chocolate, oak, and black pepper, then espresso and leather. The Robusto runs 73 minutes.',
    proof:
      "Blind Man's Puff scored the Robusto 93 in January 2023. Cigar Aficionado gave the Robusto 91 points in 2022.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: '59276378-66d5-50fd-819d-51d87e3ce2c6',
    name: 'Sancho Panza Original',
    brand: 'Sancho Panza',
    online: 7,
    why: 'Steady, nutty, and low priced, with an even draw and burn. Mild to mild-medium, the mildest Sancho Panza.',
    story:
      'The mildest of the three Sancho Panza lines General Cigar reblended in 2022 with Matt Booth of Room101. It is made in Danli, Honduras, and is now round instead of box pressed.',
    leaf: 'A Connecticut-seed wrapper grown in Honduras over a Mexican San Andres binder, with Brazilian, Dominican, and Nicaraguan filler.',
    taste:
      'Dry roasted peanut all the way through, with a little apricot sweetness and light pepper and cedar. Walnut and baking spice too, and it changes very little.',
    proof:
      "Cigar Aficionado gave the Robusto 89 points in 2025. Blind Man's Puff scored it 89 in October 2022.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'dc74b70a-9e7e-5e43-873f-b2848f94b988',
    name: 'Stanley Pappas Kostaki',
    brand: 'Stanley Pappas',
    online: 11,
    why: 'The house cigar. Mild to medium and loaded with flavor, with a smooth finish.',
    story: 'A house cigar from Stanley Pappas Cigars, the Denver-area cigar shop and lounge.',
    leaf: 'An Ecuadorian Connecticut wrapper over a Nicaraguan binder, with Honduran and Nicaraguan filler.',
    taste:
      'Mild to medium and loaded with flavor. Hints of cedar and spice from the wrapper, and a smooth finish.',
    proof: '',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'e3ae7d4e-535b-5aff-9c89-9f985387743f',
    name: 'Stanley Pappas Steely',
    brand: 'Stanley Pappas',
    online: 10,
    why: 'The shorter house cigar. Mild to medium and loaded with flavor, with a smooth finish.',
    story: 'A house cigar from Stanley Pappas Cigars, the Denver-area cigar shop and lounge.',
    leaf: 'An Ecuadorian Connecticut wrapper over a Nicaraguan binder, with Honduran and Nicaraguan filler.',
    taste:
      'Mild to medium and loaded with flavor. Hints of cedar and spice from the wrapper, and a smooth finish.',
    proof: '',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'af325bfb-3342-5225-b9b7-76fb6854e3b3',
    name: 'Trinidad Tommy Bahama Island Collection',
    brand: 'Trinidad',
    online: 15,
    why: 'A name casual smokers know, with good scores. Coffee and almond, medium to medium-full.',
    story:
      "A team-up between Altadis U.S.A.'s Trinidad brand and the Tommy Bahama lifestyle label, released in 2025. It is made in Nicaragua by AJ Fernandez, who blended it with Rafael Nodal using tobacco only from his own farms.",
    leaf: "All Nicaraguan wrapper, binder, and filler, grown on AJ Fernandez's farms.",
    taste:
      'Roasted coffee, sweet almond, and hazelnut with hints of red pepper, cocoa, and oak, ending in leather and anise. The Marlin is spicy and cedary, with a sweet almond-cookie note.',
    proof:
      'Cigar Aficionado gave the Marlin (6 x 60) 92 points and the Breeze (6 x 54) 91 points in 2026.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '0d358216-bf28-55aa-be31-4100ffaa3ac0',
    name: "Warped The Devil's Hands",
    brand: 'Warped',
    online: 12,
    why: 'A boutique one-size corona with high scores. Full of flavor for a thin cigar, medium in strength.',
    story:
      'From Warped Cigars, the brand of founder and blender Kyle Gellis, made at the Aganorsa Leaf factory in Esteli, Nicaragua, with only Aganorsa tobacco. It came out in 2022 in a single slim 6 x 44 size.',
    leaf: "All Nicaraguan: a shade-grown Jalapa Corojo '99 wrapper, a Criollo '98 binder, and Criollo '98 and Corojo '99 filler.",
    taste:
      'Full of flavor for a thin cigar. Almond cake and cappuccino with earth, hickory, honey, and a pepper kick. Very nutty, with a hint of caramel on the finish.',
    proof:
      'Cigar Aficionado gave the 6 x 44 Corona Especial 94 points in February 2026. Its Cigar Insider scored it 92 in April 2023.',
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

const DAY = 86_400_000
/** The first Sunday the picks change: 2026-11-22. Every day before it is week 0. */
const FIRST_CHANGE = Date.UTC(2026, 10, 22)

/** Which week of picks is showing. It goes up by one at the start of each Sunday, his time. */
export function pickWeek(now: Date = new Date()): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.floor((today - FIRST_CHANGE) / (7 * DAY)) + 1)
}

/** A steady number from 0 to 1 for a stick in a week, so every device deals the same four. */
function shuffle(id: string, week: number): number {
  let hash = 2166136261
  for (const char of `${id}:${week}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  }
  return (hash >>> 0) / 4294967296
}

/** Every way to take four sticks from a pool with four brands and at least three prices. */
function fours(pool: Pick[], from = 0, held: Pick[] = []): Pick[][] {
  if (held.length === 4) {
    return new Set(held.map((pick) => pick.online)).size >= 3 ? [held] : []
  }
  const found: Pick[][] = []
  for (let index = from; index < pool.length; index += 1) {
    const next = pool[index]
    if (!next || held.some((pick) => pick.brand === next.brand)) continue
    found.push(...fours(pool, index + 1, [...held, next]))
  }
  return found
}

/** One four that keeps the rules, or undefined. Looks at the first twelve before the rest. */
function anyFour(pool: Pick[]): Pick[] | undefined {
  return fours(pool.slice(0, 12))[0] ?? (pool.length > 12 ? fours(pool)[0] : undefined)
}

/** True while the stick is on his Lounge list on this device. */
function onLounge(pick: Pick, cigars: Map<string, Cigar>): boolean {
  const cigar = cigars.get(pick.cigarId)
  return Boolean(cigar && !cigar.deletedAt && cigar.lounge)
}

/** Each set's four for every week worked out so far. Week 0 is the first four listed. */
const dealt = new Map<string, Pick[][]>()

/**
 * The four sticks one set shows in a given week. Week 0 is the first four in `PICKS` for
 * that guest and strength. Each Sunday after, it never shows the same four as two weeks
 * back, then takes the four that repeat the fewest sticks from last week, then the four
 * with the fewest shared prices, then the sticks that have waited longest, so every stick
 * gets a turn before any comes round again. The rules hold every week: four brands, at
 * least three prices, cheapest first. It is worked out from the week number alone, so it needs no
 * saved state and every device agrees.
 */
export function weekSet(
  guest: GuestKey,
  strength: PickStrength,
  week: number,
  cigars?: Map<string, Cigar>,
): Pick[] {
  const all = PICKS.filter((pick) => pick.guest === guest && pick.strength === strength)
  // Only sticks still on his Lounge list are dealt. A device with too few of them to make
  // a four (a new install, say) deals from the whole pool instead.
  const stocked = cigars ? all.filter((pick) => onLounge(pick, cigars)) : all
  const pool = anyFour(stocked) ? stocked : all
  const key = `${guest} ${strength} ${pool.map((pick) => pick.cigarId).join()}`
  const opening = pool.slice(0, 4)
  const weeks = dealt.get(key) ?? [anyFour(opening) ? opening : (anyFour(pool) ?? [])]
  dealt.set(key, weeks)
  if (weeks.length > week) return weeks[week] ?? []
  const last = new Map<string, number>()
  weeks.forEach((four, index) => {
    for (const pick of four) last.set(pick.cigarId, index)
  })
  while (weeks.length <= week) {
    const now = weeks.length
    // What it costs to show a stick this week. One that has never been up goes first and
    // a repeat from last week goes last. After every stick has had a turn, the longer the
    // wait the cheaper, with a shuffle wide enough that the order is new each time round.
    const costs = new Map(
      pool.map((pick) => {
        const seen = last.get(pick.cigarId)
        if (seen === undefined) return [pick.cigarId, -1000 + shuffle(pick.cigarId, now)]
        if (seen === now - 1) return [pick.cigarId, 1000 + shuffle(pick.cigarId, now)]
        return [pick.cigarId, seen - now + 6 * shuffle(pick.cigarId, now)]
      }),
    )
    const cost = (pick: Pick) => costs.get(pick.cigarId) ?? 0
    // A big pool is cut to the twelve sticks most due, two a brand at most, so the search
    // stays quick on a phone.
    const due: Pick[] = []
    for (const pick of [...pool].sort((a, b) => cost(a) - cost(b))) {
      if (pool.length > 12 && due.filter((held) => held.brand === pick.brand).length >= 2) continue
      due.push(pick)
      if (pool.length > 12 && due.length === 12) break
    }
    // A small pool would otherwise flip between the same two fours for good.
    const stale = new Set((weeks[now - 2] ?? []).map((pick) => pick.cigarId))
    let best = weeks[now - 1] ?? []
    let least = Number.POSITIVE_INFINITY
    for (const four of fours(due)) {
      let total = (4 - new Set(four.map((pick) => pick.online)).size) * 100
      if (four.every((pick) => stale.has(pick.cigarId))) total += 2000
      for (const pick of four) total += cost(pick)
      if (total < least) {
        least = total
        best = four
      }
    }
    const four = [...best].sort((a, b) => a.online - b.online || a.name.localeCompare(b.name))
    for (const pick of four) last.set(pick.cigarId, now)
    weeks.push(four)
  }
  return weeks[week] ?? []
}

/** One guest's picks for a week, Mild to Full, each joined to its cigar record. */
export function picksFor(
  guest: GuestKey,
  cigars: Map<string, Cigar>,
  week: number = pickWeek(),
): PickGroup[] {
  return STRENGTH_GROUPS.filter((group) => group.key !== 'unknown').map((group) => ({
    strength: group.key as PickStrength,
    label: group.label,
    levels: group.levels,
    rows: weekSet(guest, group.key as PickStrength, week, cigars).map((pick) => {
      const cigar = cigars.get(pick.cigarId)
      return { ...pick, cigar: cigar && !cigar.deletedAt ? cigar : null }
    }),
  }))
}

/** Every stick on the floor in a week: nine sets of four. */
export function weekPicks(week: number = pickWeek(), cigars?: Map<string, Cigar>): Pick[] {
  return GUESTS.flatMap((guest) =>
    (['mild', 'medium', 'full'] as const).flatMap((strength) =>
      weekSet(guest.key, strength, week, cigars),
    ),
  )
}

/** How many of a week's picks have a price he set himself at the shelf. */
export function pricedCount(cigars: Map<string, Cigar>, week: number = pickWeek()): number {
  return weekPicks(week, cigars).filter((pick) => {
    const cigar = cigars.get(pick.cigarId)
    return cigar && !cigar.deletedAt && cigar.priceCheckedAt !== null
  }).length
}
