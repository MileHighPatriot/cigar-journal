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
 * The floor picks: the sticks each set of four is dealt from, all from his own Lounge list
 * as it stood in his 2026-10-27 backup. Every one was checked on 2026-11-13 against review
 * sites (Cigar Aficionado, Blind Man's Puff, Cigar Coop, Cigar Dojo, Holt's, Famous Smoke
 * and others) for the guest it is listed under. A stick sits under the strength the catalog
 * has on file for it (Mild is levels 1 and 2, Medium is 3, Full is 4 and 5), under one
 * guest only, and is listed once. The first four listed for a guest and strength are the
 * opening set; `weekSet` deals a new four each Sunday from 2026-11-22. `online` is a
 * single-stick price found online, there to run a set from cheapest to priciest. The
 * lounge's own prices are his to set at the shelf. Every fact in `story`, `leaf`, `taste`,
 * and `proof` comes from a page opened on 2026-11-13.
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
    why: 'Mild, short, and inexpensive, with a soft box press. One blind panel found the bigger Toro closer to medium.',
    story:
      "Made by J.C. Newman at its PENSA factory in Nicaragua. Newman says the brand goes back to 1905, when four Cuban brothers began rolling cigars from tobacco grown on their family farm, and the name means 'Pearl of the Sea'. Blind Man's Puff reports it was re-blended and relaunched in late 2020, and it comes with a soft, Tampa-style box press.",
    leaf: 'An Ecuadorian Shade wrapper over aged Nicaraguan binder and long filler from four mountain regions: Pueblo Nuevo, La Reina, Condega, and Jalapa.',
    taste:
      "Cigar Aficionado found bread, straw, and lemon in the Short Robusto, growing richer with a caramel sweetness that carries into the finish. Blind Man's Puff's panel tasted toasted bread, peanuts, and cream in the Toro, with black pepper and leather near the end. That 6 inch Toro took the panel 108 minutes.",
    proof:
      "Cigar Aficionado gave the Shade Short Robusto 90 points in August 2023 and the Shade Robusto 88 in its January/February 2026 issue. Blind Man's Puff's blind panel scored the Shade Toro 88.",
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '910d2e6b-8f95-5ade-a5ef-e51d708e3993',
    name: 'Asylum Insidious',
    brand: 'Asylum',
    online: 9,
    why: 'A sweetened cap on a mild Connecticut wrapper, built for beginners. The Cigar Authority called it a good beginner cigar.',
    story:
      'An Asylum Cigars line made in Honduras at a factory owned by Christian Eiroa. It was introduced at the 2014 IPCPR trade show in Las Vegas, and Neptune pitches it to novice smokers or anyone who wants a milder cigar. What sets it apart is the sweetened cap.',
    leaf: 'An Ecuadorian Connecticut wrapper with a sweetened cap over Honduran binder and Honduran filler.',
    taste:
      "The Cigar Authority found the sweet cap fades quickly into earth and a little nuttiness, then raisin and a slight maple note, with a short finish and an even burn. It rates the cigar mild, though one Blind Man's Puff reviewer found the Corona medium-full at the start before it settled to medium. That 6 inch Corona took 1 hour 50 minutes.",
    proof:
      "The Cigar Authority scored the Robusto 88 in August 2014. Blind Man's Puff gave the Corona 84 in a quick, single-reviewer review that was not blind.",
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '53fc3344-e99b-5ef2-a41c-0643257de86b',
    name: 'Macanudo Ecuadorian Shade',
    brand: 'Macanudo',
    online: 6,
    why: "Cigar Czars' reviewer called it among the mildest he had smoked in a long time and a good choice for new smokers.",
    story:
      "A General Cigar brand, but unlike most Macanudos this one is handmade in Esteli, Nicaragua. It joined the core lineup in April 2026 alongside a Sumatra version, in three box-pressed sizes. The two share the same binder and filler, so only the wrapper differs, and General Cigar's Cigar World site calls this the smoother of the pair.",
    leaf: 'An Ecuadorian Shade wrapper over a U.S. Broadleaf binder, with Dominican Piloto Cubano and Nicaraguan fillers.',
    taste:
      "Cigar Czars found a sweet, creamy start with hints of mild spice. The sweetness faded within five minutes, and the creamy, lightly spiced profile held to the end of a Robusto that took about 45 minutes. Neptune's listing says medium, but the only full review found calls it very mild.",
    proof:
      'No magazine score was found, since it only launched in April 2026. Cigar Czars rated the Robusto 3.5 out of 5, and retailer Neptune made the Robusto a staff pick in May 2026.',
  },
  {
    guest: 'new',
    strength: 'mild',
    cigarId: '47863ce3-1791-5cac-9b9e-5d5f8016156e',
    name: 'Partagas Cortado',
    brand: 'Partagas',
    online: 8,
    why: "A mild to medium Connecticut shade that Klaro's reviewer called good for newer smokers. Reviews favor the Toro.",
    story:
      "A General Cigar brand made at the STG Esteli factory in Nicaragua. Released in 2021, it is the brand's first cigar with a shade wrapper and its first made in Nicaragua, according to Neptune. Klaro says it steps away from the brand's 'dark, oily and bold' norm while staying packed with flavor.",
    leaf: 'An Ecuadorian Connecticut Shade wrapper, an Indonesian binder, and fillers from Honduras, Mexico, and Nicaragua. That is tobacco from five countries in all.',
    taste:
      "Cigar Aficionado found a sweet graham cracker lead with star anise and wood in the Toro. Klaro's Corona started with honey and vanilla, turned creamy with an espresso note building, and finished dry and toasty with a little bitterness near the end. Size matters here: Cigar Aficionado's Robusto review found bitter cardboard and tart wood.",
    proof:
      "Cigar Aficionado gave the Toro 90 points and put it on its list of ten milder cigars that scored 90 or higher, but gave the Robusto only 84 in February 2022. Retailer Klaro's reviewer rated the Corona 4.6 out of 5 in June 2023.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: '0e839dbe-5e95-5715-9a24-54651caa7ebd',
    name: 'Romeo Y Julieta 1875',
    brand: 'Romeo Y Julieta',
    online: 9,
    why: 'A name the occasional smoker already knows, and easy on the wallet. Reviewers call it mild to medium, not mild.',
    story:
      "The classic non-Cuban Romeo y Julieta, from Altadis U.S.A., rolled at Tabacalera de Garcia in the Dominican Republic. The 1875 in the name is the year the brand was founded. Don't confuse it with the newer 1875 Connecticut Nicaragua, which is a different blend.",
    leaf: "An Indonesian shade-grown wrapper over Dominican binder and Dominican long filler. Blind Man's Puff describes the binder as Dominican Piloto and the filler as Dominican Piloto and Olor.",
    taste:
      "Cigar Aficionado found cedar and nuts over a sweet undertone of vanilla, cinnamon, and baked apple, with a woodsy finish. Blind Man's Puff's panel got nuts, cedar, and white pepper early, then baking spices, with a bit of bite at the end. The 5 inch Bully took the panel 65 minutes.",
    proof:
      "Cigar Aficionado scored the Bully 89 in June 2023, and Blind Man's Puff's blind panel gave the Bully 89 in January 2015. Holt's ranks the 1875 ninth on its Top 10 Best Mild Cigars.",
  },
  {
    guest: 'sometimes',
    strength: 'mild',
    cigarId: 'd9f40162-0fe5-5c5b-99a7-af1d569fb38d',
    name: 'CAO Cameroon',
    brand: 'CAO',
    online: 10,
    why: 'A sweet Cameroon wrapper for a change from Connecticut. Reviewers call it medium, not mild, so it is a step up.',
    story:
      "CAO was launched in 1993 by Cano Ozgener, whose family company was known for Turkish handmade pipes, and General Cigar took over the brand in 2010. This line debuted in 1999 as L'Anniversaire, marking CAO's 30th anniversary. Famous Smoke says Nick Perdomo made the first ones at his Esteli factory, and they are now made at STG Esteli in Nicaragua in box-pressed sizes.",
    leaf: 'An African Cameroon wrapper over Nicaraguan binder and Nicaraguan filler.',
    taste:
      "Blind Man's Puff's panel found wood, salt, and peppered cream first, then sweet cocoa, roasted coffee, and toasted oak, ending with dry toast, graham cracker, and baking spice. The panel praised the draw and construction but called the flavor mellow and predictable, and Cigar Aficionado noted some bitterness in the Robusto. The Robusto took the panel about 68 minutes.",
    proof:
      "Blind Man's Puff's blind panel of five scored the Robusto 93 in February 2024, while Cigar Aficionado gave the Robusto 85 in October 2014. Famous Smoke says Cigar Aficionado scored the L'Anniversaire Robusto 92 and named it to its Top 25 in 2004, but that was not confirmed on the magazine's site.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '17771a60-d7e5-5605-a6b7-ad7a2478f554',
    name: 'La Flor Dominicana Suave',
    brand: 'La Flor Dominicana',
    online: 8,
    why: 'The mildest La Flor, with a story a regular will like. Reviewers call it medium, not mild, so skip it for beginners.',
    story:
      "La Flor Dominicana was founded by Litto and Ines Gomez in 1994. It grows tobacco on its own farm in La Canela and rolls in Tamboril, both in the Dominican Republic. Suave descends from the company's very first cigar, and it was rebuilt after 30 years and shown at the 2025 PCA show, with Litto Gomez asking what it would have been 'if we could go back to day one knowing everything we know now'.",
    leaf: 'The Suave Natural has an Ecuadorian Corojo wrapper, a Mexican San Andres binder, and Dominican filler. There is also a Grand Maduro version.',
    taste:
      'Cigar Aficionado found the Maceo woody at first, then salt, earth, and nuts, with a hint of butterscotch on the finish. It noted a fairly even burn but an inconsistent draw. Neptune describes the line as medium-bodied and sweet overall, with notes of spice and cedar.',
    proof:
      'Cigar Aficionado gave the Suave Maceo 90 points in its April 2026 issue. The Grand Maduro No. 6, a different version, scored 92 in its January/February 2026 ratings table.',
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '8910520c-2fbe-5754-b7d7-0fb5a4cc7929',
    name: 'Punch Golden Era',
    brand: 'Punch',
    online: 11,
    why: 'A Honduran Corojo puro rolled by the Eiroas, with real craft and a story for a regular. Reviewers call it medium, not mild.',
    story:
      "A General Cigar brand, rolled for Punch at the Eiroa family's Aladino factory in Danli, Honduras. It joined the regular Punch line in May 2023 to celebrate Corojo tobacco from the 'golden age' of cigars. Famous Smoke says Julio R. Eiroa first grew this Corojo in 1997, and it is described as the closest thing to the Cuban leaf from before the revolution.",
    leaf: "All Honduran tobacco: a Cuban-seed Corojo wrapper and binder, with Habano and Corojo filler. Blind Man's Puff says the Corojo is grown on a 650-acre farm run by the Eiroa family.",
    taste:
      "Blind Man's Puff's panel found caramel, nuts, honey, and leather first, then light brown sugar and cinnamon bread, ending creamy with a butterscotch-like finish. Cigar Aficionado's Robusto was woody and toasty with black pepper, cardamom, and a hint of lemon peel. The Robusto took the panel about 50 minutes.",
    proof:
      "Blind Man's Puff's blind panel of four scored the Robusto 94. Cigar Aficionado gave the Robusto 89 in February 2024 and the Churchill 90 in its May/June 2026 issue.",
  },
  {
    guest: 'experienced',
    strength: 'mild',
    cigarId: '9472e011-8281-5186-b1c8-b34c28efb496',
    name: 'Matilde Serena',
    brand: 'Matilde',
    online: 9,
    why: 'A boutique cigar from a famous blender that a regular may not know. Closer to mild-medium than mild, and best smoked slowly.',
    story:
      "Matilde was founded in 2013 by Jose Seijas, a roughly 40-year industry veteran who had been vice president and general manager of Altadis's Dominican factory. Serena is made at Tabacalera Palma in Tamboril, Dominican Republic, and distributed by Quesada Cigars. It came out in August 2016 as Matilde's first Connecticut-wrapped cigar, made to fill out the mild end of the line.",
    leaf: 'An Ecuadorian Connecticut shade wrapper over a Dominican binder, with Dominican and Nicaraguan filler.',
    taste:
      "Blind Man's Puff's panel found a mild start with light pepper, salty-sweet caramel, and roasted nuts, then leather and a cream soda note, with a sweet caramel finish. Cigar Dojo's reviewer got fig, honey, cashew, and oak when smoking it slowly. The Corona took the panel 63 minutes and Cigar Dojo about 1 hour 30 minutes.",
    proof:
      "Blind Man's Puff's blind panel scored the Corona 90 in February 2017. Cigar Dojo gave the Corona 90 in June 2019 and called it a 'box worthy' bargain.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'c3637ead-45b7-565a-80c9-4367977aa8f2',
    name: 'H. Upmann 1844 Classic',
    brand: 'H. Upmann',
    online: 8,
    why: 'Creamy and forgiving at about $8. Cigar Aficionado lists the Robusto as mild to medium, so it sits on the light side of medium.',
    story:
      'Made in Honduras at Flor de Copan for Altadis U.S.A. and blended by its Grupo de Maestros. This is the non-Cuban H. Upmann sold in the US. It came out in 2021 and, Neptune says, is the first cigar in the 1844 line with a Connecticut Shade wrapper.',
    leaf: 'An Ecuadorian Connecticut Shade wrapper over Honduran binder and Honduran filler.',
    taste:
      'Creamy and nutty. Cigar Aficionado found lemon, honey, pecan, and a touch of cedar, with an even burn and draw. Famous Smoke got almond butter and a peppery spice up front, vanilla cream in the middle, then leather and a more earthy end.',
    proof:
      "Cigar Aficionado gave the Robusto 90 points in 2021. Blind Man's Puff's blind panel scored the Toro 93 in 2022.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'd29632ac-29f2-58f0-a3c9-b1eec77b3f09',
    name: 'Romeo Y Julieta 1875 Nicaragua',
    brand: 'Romeo Y Julieta',
    online: 9,
    why: 'A gentle way to try a Nicaraguan cigar without much pepper. Reviewers call it mild to medium, lighter than its label.',
    story:
      'Made in Esteli, Nicaragua by the Plasencia family for Altadis U.S.A., which sells Romeo y Julieta in the American market. It came out in 2018 as a Nicaraguan take on the Dominican-made 1875. The orange band sets it apart from the classic.',
    leaf: "All Nicaraguan: a Habano wrapper over Nicaraguan binder and filler. Gotham Cigars' write-up calls the wrapper Corojo and says it has a double binder.",
    taste:
      "Smooth, with sweet cedar, honey, and citrus. Blind Man's Puff's panel found hay, white pepper, and cream early, then graham cracker and honey as the pepper faded, with more citrus and baking spice at the end. Their panel averaged 76 minutes on the larger Toro.",
    proof:
      "Blind Man's Puff's blind panel scored the Toro 91, and Cigar Aficionado gave the Toro 89, both in 2019.",
  },
  {
    guest: 'new',
    strength: 'medium',
    cigarId: 'afce7eda-9c13-59fe-bac0-e69dbd94b51b',
    name: 'AJ Fernandez New World Connecticut',
    brand: 'AJ Fernandez',
    online: 9,
    why: 'Creamy and gentle the whole way. Reviewers call it mild to mild-medium, not medium, which is good news for a new smoker.',
    story:
      "Made in Nicaragua at AJ Fernandez's own factory. Reviewers describe the New World line as a team effort between A.J. Fernandez and his father, Ismael. This is the second New World blend, released in 2015, and it is rolled round, not box-pressed like the original.",
    leaf: 'A Connecticut Shade wrapper grown in the United States over a Mexican San Andres binder, with Nicaraguan and Brazilian fillers.',
    taste:
      'Cream, nuts, cedar, and toast with a little pepper, and it stays creamy throughout. On the Toro, The Cigar Authority found creamy butterscotch first, then dark toast, coffee, and cedar, with pecans and some spice at the end. It starts mild and picks up a little in the second half.',
    proof:
      'Cigar Coop scored the Corona Gorda 92 in 2015, and The Cigar Authority gave the Toro 90 in 2017. Halfwheel reportedly gave the Toro a lower 84.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'eb8800c5-c50c-5561-b742-c8c4f1aa01a7',
    name: 'Cohiba Red Dot',
    brand: 'Cohiba',
    online: 31,
    why: 'A splurge at about $31 for someone who knows the Cohiba name. A true medium, with pepper that builds toward the end.',
    story:
      'Made by General Cigar in the Dominican Republic. This is the original non-Cuban Cohiba, nicknamed Red Dot for the red dot inside the O on the band. It shares only a name with the Cuban Cohiba.',
    leaf: 'A Cameroon wrapper over an Indonesian Jember binder and Dominican Piloto Cubano filler.',
    taste:
      "Holt's notes cocoa, white pepper, cedar, and earth. The Cigar Authority's panel found leather, oak, nuts, and honey first, then stronger pepper and wood with some chocolate in the middle. The pepper builds to a spicier finish with cedar, raisin, and coffee.",
    proof:
      "The Cigar Authority's blind panel scored the Robusto 90.44 in August 2024. Holt's customers rate it 4.23 out of 5 across 15 reviews.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '0ffa886b-b98c-5c21-9e42-429a87cce96c',
    name: 'Punch Knuckle Buster Habano',
    brand: 'Punch',
    online: 5,
    why: 'A no-fuss Punch for about $5. Most sources call it medium, though Cigar Aficionado lists the Toro as full.',
    story:
      'A General Cigar brand, handmade in Danli, Honduras. It came out in 2020 as a value-priced, everyday cigar, pitched as a "hardworking blend for hardworking people." Punch calls this the original Knuckle Buster, and there are Maduro and Shade versions too.',
    leaf: 'Nicaraguan Habano wrapper and binder over Nicaraguan and Honduran Habano filler.',
    taste:
      'Punch describes caramel, pepper, and almond. On the Toro, Cigar Aficionado found faint almond giving way to earth, dark chocolate, and charred wood with a tangy citrus finish. Stogie Press got cream and coffee, needed to touch up an uneven burn, and took about 90 minutes on the larger Toro.',
    proof:
      'Cigar Aficionado gave the Toro 89 in June 2021 and the Gordo 87 in December 2020. Stogie Press scored the Toro 86.',
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '797fd189-e162-5fb2-a113-9f57cfe3bdc6',
    name: 'My Father La Gran Oferta',
    brand: 'My Father',
    online: 8,
    why: 'A well-known name at about $8 with plenty going on. Medium to medium-full with pepper, so it is not the gentlest pick.',
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua, with tobacco from their own farms. The name means "the great offering." It came out in 2018, and My Father says the artwork follows an old cigar brand sold under the same name around 1913.',
    leaf: 'An oily Ecuadorian Habano Rosado wrapper over Cuban-seed Nicaraguan binder and filler from the Garcia farms.',
    taste:
      "Spicy and earthy. Cigar Aficionado found black pepper, almonds, and chocolate in the Robusto, building to a salted-caramel finish. On the Lancero, Blind Man's Puff's panel got early spice that calms quickly, then chocolate, coffee, and cream, with red pepper and charred oak at the end.",
    proof:
      "Cigar Aficionado gave the Robusto 91 in October 2019. Blind Man's Puff's blind panel scored the Lancero 88.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: '88dcb6dd-c782-5703-a52c-e640f6d9316e',
    name: 'Kristoff Sumatra',
    brand: 'Kristoff',
    online: 11,
    why: 'For someone who already smokes and likes spice with cocoa and espresso. Reviewers call it medium-full, not medium.',
    story:
      "Kristoff is Glen Case's brand, and the cigars are made in the Dominican Republic. The Sumatra came out in 2009. Like other Kristoffs, it has a pigtail cap and a closed foot.",
    leaf: 'An Ecuadorian Sumatra wrapper over a Brazilian binder, with Cuban-seed filler from the Dominican Republic and Nicaragua.',
    taste:
      "Blind Man's Puff's Robusto opened with a blast of black pepper, then cocoa, espresso, leather, and earth. The middle brought sweet earth, cedar, and almond, and it ended on espresso, cocoa, and walnut after 71 minutes. Cigar Aficionado, though, found the Torpedo bitter.",
    proof:
      "Reviews are split. Blind Man's Puff's blind panel scored the Robusto 91 in 2021 (its page also shows 93 in one spot), while Cigar Aficionado gave the Torpedo 83 in 2022.",
  },
  {
    guest: 'sometimes',
    strength: 'medium',
    cigarId: 'b8bb7b14-b7c0-5db2-8258-2ea64c3e51a5',
    name: 'Perdomo Lot 23',
    brand: 'Perdomo',
    online: 9,
    why: 'An easy, cheap yes at about $9 with a good single-farm story. Cigar Aficionado rates it medium-full, a notch above its label.',
    story:
      "Made by the Perdomo family at Tabacalera Perdomo in Nicaragua. It is named for one family farm in Esteli, started in 2000, and all the tobacco in the blend is grown on that plot. Perdomo compares it to a winemaker's single-vineyard reserve.",
    leaf: "All Nicaraguan: a Sun Grown wrapper over Cuban-seed binder and filler. Holt's describes the wrapper as Nicaraguan Corojo.",
    taste:
      'Earthy and nutty, with almond and cedar. Cigar Aficionado says the earthiness and spice up front lead to a coffee note in the middle, then a sweeter finish of brown sugar and nuts.',
    proof:
      "Cigar Aficionado has given the Robusto 90 points three times: 2007, 2008, and 2019. Perdomo's page says Cigar Journal named it Best Value Brand of Nicaragua in 2012.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'c0339245-0ad1-5fdc-b7d3-bba1ce862c70',
    name: 'J.C. Newman Diamond Crown Julius Caeser',
    brand: 'J.C. Newman',
    online: 15,
    why: 'A Fuente-made luxury cigar with a great founder story. Cigar Coop found the Robusto medium from start to finish.',
    story:
      'A J.C. Newman brand made in the Dominican Republic by the Fuente family at Tabacalera A. Fuente. It came out in 2010 for the company\'s 115th anniversary and honors founder Julius C. Newman. An immigration officer wrote down "Caeser" as his middle name in 1888, misspelled, and it stuck.',
    leaf: 'An Ecuadorian Havana-seed wrapper over a Dominican binder. J.C. Newman says the filler is Caribbean and Central American, while Cigar Aficionado lists it as Dominican.',
    taste:
      'Neptune describes creamy cedar, leather, espresso, and earth with a touch of raisin sweetness. On the Robusto, Cigar Coop found coffee and wood trading places, with the wood turning to a sweet cedar spice. Cigar Aficionado was less kind to a Toro in 2019, calling it tart and woody.',
    proof:
      'Cigar Aficionado named the Robusto its No. 14 cigar of 2014 at 92 points and gave the Troublemaker 91 in 2025, but a Toro only 86 in 2019. Cigar Coop scored the Robusto 89.',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '368b894a-4b6b-5ae9-8540-1588405c0bb9',
    name: 'Fonseca by My Father',
    brand: 'Fonseca',
    online: 10,
    why: 'An old Cuban name remade by the Garcia family, with two top 25 nods in 2020. Reviewers range from medium to full on strength.',
    story:
      "Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Fonseca began as a Cuban brand in 1892, and the Garcias bought the trademark from the Quesada family in December 2019. Their version came out in August 2020, made entirely from the family's own Nicaraguan tobacco.",
    leaf: "All Nicaraguan: a shade-grown Corojo 99 Rosado wrapper over Nicaraguan binder and filler, all grown by the Garcia family. Neptune's listing calls the wrapper Corojo '98.",
    taste:
      "Cigar Aficionado found gingerbread, toast, and a hint of red pepper in the Petit Corona, and leather, fruit, coffee, hazelnut, and oak in the Cedros. Blind Man's Puff's panel got cedar, white pepper, and baking spice early, then vanilla and black coffee, with leather leading at the end. The big Cedros took them 103 minutes.",
    proof:
      "Cigar Aficionado ranked the Petit Corona No. 18 of 2020 at 93 points and gave the Cedros 90 in 2023. Blind Man's Puff scored the Cedros 90 and ranked it No. 17 on its own 2020 list.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '78463c04-b139-5e86-a806-ae532ab6da0f',
    name: 'Rocky Patel Sixty',
    brand: 'Rocky Patel',
    online: 17,
    why: 'Rich, aged, and award-winning at about $17. Cigar Aficionado lists it medium-full and Neptune full, so it runs above medium.',
    story:
      'Made by Rocky Patel at his own factory in Esteli, Nicaragua. It was released in 2021 to mark his 60th birthday. Cigar Aficionado says the box-pressed cigars were already aged two years before release.',
    leaf: 'A dark Mexican San Andres wrapper over Nicaraguan binder and filler.',
    taste:
      "Cigar Aficionado found the Robusto rich and toasty, with dried herbs, ground black pepper, and an easy, open draw. On the Toro, Blind Man's Puff's panel got dark chocolate and black pepper first, then sweet tobacco, cocoa, and leather, over 103 minutes. One panelist called it very spicy from beginning to end.",
    proof:
      "Cigar Aficionado named the 6 x 60 Sixty size its No. 2 cigar of 2022 at 96 points and gave the Robusto 91. Blind Man's Puff's blind panel scored the Toro 90.",
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: 'b6715b0f-2d52-5243-995e-12fa8e2887c5',
    name: 'Rojas Street Tacos Barbacoa',
    brand: 'Rojas',
    online: 9,
    why: "A small-batch boutique cigar with a food-truck theme, about $9. Neptune says medium, but Famous Smoke's reviewer calls it full.",
    story:
      'From Rojas Cigars, the brand of Noel Rojas, handmade in Esteli, Nicaragua at what Famous Smoke calls a small factory. It is the first blend in the Street Tacos series, released in March 2021 and inspired by tacos sold from food trucks and street carts.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Nicaraguan binder and Nicaraguan filler from the Somoto region.',
    taste:
      "Famous Smoke's reviewer found it opens with hot pepper, butter, wood, and leather, then turns woodier, with the pepper building slowly in the middle. Stogie Review got a sugary sweetness first that fades toward dark chocolate and leather, then wood, coffee, and spice at the end.",
    proof: '',
  },
  {
    guest: 'experienced',
    strength: 'medium',
    cigarId: '0b417961-d8dc-5df7-a854-b77123d87fc3',
    name: 'Matilde Renacer',
    brand: 'Matilde',
    online: 9,
    why: 'The comeback cigar of Jose Seijas, the man linked to Montecristo and H. Upmann at Altadis. The Corona size scores best.',
    story:
      "Matilde is the company Jose Seijas started with his sons after retiring from Altadis, where Cigar Dojo links him to Montecristo, Romeo y Julieta, and H. Upmann. The cigars are made in the Dominican Republic. Renacer means rebirth, and it was Matilde's first release, in early 2014.",
    leaf: 'An Ecuadorian Habano wrapper over a Dominican binder, with mostly Dominican filler and some Nicaraguan.',
    taste:
      "The maker describes rich earth, cocoa, and spice. Cigar Aficionado found hearty coffee bean and a refined cocoa finish in the Corona, but an earthy, woody Robusto that turns tart and tangy. Cigar Dojo's Corona started slightly bitter, then showed cedar, subtle chocolate, dark coffee, and toffee.",
    proof:
      'Cigar Aficionado gave the Corona 91 in 2014 and the Robusto 86 in 2022. Cigar Dojo scored the Corona 93 percent in 2015.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'd17f47df-cab9-52b6-8997-9b040afb81dc',
    name: 'Padron Series 2000',
    brand: 'Padron',
    online: 9,
    why: 'Reviewers call it medium to medium-full, not full. A rich, well-made step up for a newer smoker at about $9.',
    story:
      "Made by the Padron family at their Tabacos Cubanica factory in Esteli, Nicaragua. Jose Orlando Padron started the company in Miami in 1964 with about $600 saved from carpentry work. The 2000 is the robusto in the family's original core line, and it comes in natural or maduro.",
    leaf: 'All Nicaraguan: a sun-grown wrapper in natural or maduro over Nicaraguan binder and filler. Cigar Dojo and The Cigar Authority give the aging as 2.5 years.',
    taste:
      'Cigar Dojo says the maduro opens with pepper and spice, then settles into coffee, cedar, earth, and cocoa. The Cigar Authority found the natural sweeter, with raisin, caramel, wood, and nuts. The maduro is the fuller of the two.',
    proof:
      "Cigar Aficionado gave the 2000 Maduro 92 points in April 2023, and Cigar Dojo scored the Maduro 91. The Cigar Authority gave the Natural 92, and Holt's names the core Padron line in its beginner guide.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: 'c81e50ca-3776-5c6e-ad7c-4d4abf6a1c67',
    name: 'My Father Flor de Las Antillas',
    brand: 'My Father',
    online: 9,
    why: 'The gentlest of the Garcia cigars. Reviewers call it medium, not full: smooth, easy to smoke, and light on pepper.',
    story:
      'Made by the Garcia family in Esteli, Nicaragua. The name means flower of the Antilles, a nickname for Cuba, and the box art updates a label from the early 1900s. It came out in 2012 and was the first My Father line to be entirely box-pressed.',
    leaf: 'All Nicaraguan: an oily, reddish-brown sun grown wrapper over Nicaraguan binder and filler. Cigar Aficionado notes the double binder the Garcias are known for.',
    taste:
      "Halfwheel says it starts with leather, espresso, and wood, with a little black pepper that fades fast, then turns sweeter and stays smooth to the end. Cigar Aficionado tasted nutmeg and white pepper. Halfwheel's Toro took about 1 hour 25 minutes.",
    proof:
      "Cigar Aficionado named the Toro its No. 1 cigar of 2012 with 96 points, and Holt's ranks the line fifth on its top 10 medium-bodied list. Other critics were cooler on the Toro: Cigar Dojo gave it 88 and Halfwheel gave it 82.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '502b623a-3892-5125-bbb1-98c623ecca71',
    name: 'J.C. Newman Brick House Maduro',
    brand: 'J.C. Newman',
    online: 9,
    why: 'A dark, low-cost maduro that reviewers call medium-full, not full. Cigar Coop says it works for a novice.',
    story:
      'Made by J.C. Newman at its Nicaraguan factory, known as PENSA. The Brick House name honors the childhood home in Hungary of founder Julius Caeser Newman, and the company brought it back in 2009. The Maduro arrived in 2012 with the same binder and filler as the original under a darker wrapper.',
    leaf: 'A dark Brazilian Arapiraca maduro wrapper over Nicaraguan binder and filler.',
    taste:
      "Cigar Coop found cocoa and natural tobacco up front with red pepper and cedar, medium in the first half and fuller in the second. Cigar Aficionado tasted cedar, charred oak, and bittersweet chocolate in the Robusto. One Blind Man's Puff reviewer found the nicotine on the high side; their Toro took 85 minutes.",
    proof:
      "Cigar Aficionado gave the Toro 91 points and the Robusto 87 in 2017. Cigar Coop scored the Toro 89, and a Blind Man's Puff blind panel gave the Toro 86.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '015aa00c-0501-55c6-9f1a-bfa95b13dab4',
    name: 'CAO Brazilia',
    brand: 'CAO',
    online: 10,
    why: 'A long-running, well-liked dark cigar. Reviewers put it at medium-full, not full, but it opens peppery.',
    story:
      'A CAO cigar, now part of General Cigar, made in Honduras. It launched in 2001, when most makers hid their Brazilian leaf, and CAO did the opposite by putting Brazil in the name and the flag colors on the box. The sizes carry Brazil-themed names like Gol!, Samba, and Amazon.',
    leaf: 'A dark, oily Brazilian Arapiraca wrapper over Nicaraguan binder and filler.',
    taste:
      "Cigar Aficionado says the Gol! starts out strong and peppery, then mellows to a woody smoke with some wine notes. CAO's own notes are toasty, earthy, nutty, and floral. A reviewer at Klaro, a retailer, found some bitterness at the very end.",
    proof:
      'Cigar Aficionado gave the Gol! 88 points in August 2009 and the Corcovado 88 in February 2017, and Cigar Dojo scored the Gol 86. Famous Smoke, a retailer, ranks it tenth on its 2022 list of the best strong cigars.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'aa7b6b2c-172a-53a3-871a-17191942975e',
    name: 'CAO Flathead',
    brand: 'CAO',
    online: 10,
    why: 'Dark, rich, and sweet-leaning, with a big award behind it. Cigar Aficionado rates it full, so not a first cigar.',
    story:
      'A CAO cigar from General Cigar, made in Nicaragua at STG Esteli. It came out in 2013 as a hot-rod tribute: sharply box-pressed with a flat head like an engine block, and each size is named for an engine part. Each box looks like an engine and comes with a vintage-style pin-up print.',
    leaf: 'A Connecticut Broadleaf wrapper and a Connecticut Habano binder, which is Cuban-seed leaf grown in Connecticut. The filler is Nicaraguan ligero and Dominican Piloto Cubano ligero.',
    taste:
      "Cigar Aficionado says it takes off with ripe fruit, leather, and molasses that gain intensity as it smokes. Cigar Dojo's reviewer was cooler: a muffled start of spice, cedar, and cream that came together after the halfway point with espresso and sugarcane. Cigar Dojo lists over 2 hours for the big V660 Carb.",
    proof:
      'Cigar Aficionado ranked the V660 Carb No. 3 on its Top 25 of 2015 with 95 points. Cigar Dojo scored the same size 88.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: 'ac6c03b6-7778-56f4-9a17-73615f9ad7bf',
    name: 'Montecristo 1935 Anniversary Nicaragua',
    brand: 'Montecristo',
    online: 14,
    why: 'A famous name with big awards and rich coffee and chocolate notes. Strength calls run from medium to full by size.',
    story:
      "Made for Altadis U.S.A. by A.J. Fernandez at his San Lotano factory in Ocotal, Nicaragua. It was created with Rafael Nodal to mark Montecristo's 85th anniversary in 2020; the brand began in Cuba in 1935. Cigar Aficionado called it the finest non-Cuban Montecristo it has ever tasted.",
    leaf: "All Nicaraguan wrapper, binder, and filler, grown on A.J. Fernandez's farms. Altadis has not shared the exact leaf types.",
    taste:
      "Cigar Aficionado found the No. 2 spicy and earthy with leather and red pepper, then sweeter coconut and malted milk before a woody finish. Cigar Coop found the Churchill medium, led by coffee, while a Holt's staff reviewer said the No. 2 gets hot and would turn a beginner green. Cigar Coop calls the Demi an under-an-hour smoke.",
    proof:
      'Cigar Aficionado ranked it No. 2 cigar of the year twice: the No. 2 size in 2021 with 95 points and the Espeso in 2024 with 97. Cigar Coop gave the Churchill 91 and the Demi 89.',
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '285ebd15-4247-59ca-b3cb-926d7702ee97',
    name: 'AJ Fernandez Enclave Broadleaf',
    brand: 'AJ Fernandez',
    online: 9,
    why: 'A dark, affordable broadleaf from a big-name maker. Reviewers land at medium-full, and Robusto reviews are split.',
    story:
      "A.J. Fernandez's own brand, made at his factory in Nicaragua and blended with his father Ismael. It came out in 2017 as the dark follow-up to the original Enclave. Cigar Aficionado says it was the first time he put a broadleaf wrapper on one of his own cigars.",
    leaf: 'A Connecticut Broadleaf wrapper over Nicaraguan binder and filler. Cigar Aficionado says the filler is from Esteli and Jalapa; Cigar Dojo adds Pueblo Nuevo.',
    taste:
      "Cigar Aficionado tasted earth, mineral, and salt before sweet turns of milk chocolate, vanilla bean, and anise. Blind Man's Puff found the Robusto mild at first with coffee and chocolate, then leather and a honey-like sweetness, with a peppery final third. Cigar Dojo's Robusto took 1 hour 20 minutes.",
    proof:
      "Cigar Aficionado ranked the Churchill No. 19 on its Top 25 of 2019 with 92 points. For the Robusto, a single Blind Man's Puff reviewer gave it 93 and Cigar Dojo gave it 82.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '15c3edf8-6258-59ad-bd6e-7aee456cedca',
    name: 'Perdomo 20th Anniversary Maduro',
    brand: 'Perdomo',
    online: 12,
    why: 'Strong but smooth, with chocolate and espresso. Labeled medium-full, yet Cigar Coop would not hand it to a novice.',
    story:
      "Made by Tabacalera Perdomo in Nicaragua, with Holt's crediting founder Nick Perdomo for the blend. It was created for Perdomo's 20th anniversary and first shown in 2012. It is box-pressed, comes in big ring gauges, and its wrapper spends time in bourbon barrels.",
    leaf: "All Nicaraguan, Cuban-seed leaf. Perdomo and Holt's say the 8-year-old maduro wrapper is aged another 14 months in bourbon barrels; The Cigar Authority says 10 months.",
    taste:
      "Holt's found chocolate, leather, and cinnamon before lighting, Cuban coffee with cream in the middle, then leather, earth, and wood with a creamy espresso finish. Cigar Coop says spice takes over near the end without turning harsh. Cigar Aficionado was less kind to the Churchill, calling it gritty and muddy with an inconsistent burn.",
    proof:
      "The Cigar Authority's blind panel scored the Epicure 90.13 in March 2025, Cigar Coop gave the Robusto 88, and Cigar Aficionado gave the Churchill 85 in December 2016. A staff review at Holt's, a retailer, scored the Robusto 92.",
  },
  {
    guest: 'sometimes',
    strength: 'full',
    cigarId: '4a34b95a-d703-5def-935b-9b587664e9c9',
    name: 'La Aroma De Cuba Pasión',
    brand: 'La Aroma De Cuba',
    online: 13,
    why: 'A rich, well-made Garcia smoke at a fair price. Most sources say medium-full, and Cigar Coop found it only medium.',
    story:
      'An Ashton brand made by the Garcia family at My Father Cigars in Esteli, Nicaragua. It launched in 2021, and Cigar Coop calls it the first all-Nicaraguan cigar under the La Aroma de Cuba name. Ashton says the blend took two years to get right.',
    leaf: "All Nicaraguan, from the Garcia family's farms in Esteli, Jalapa, and Namanji. The wrapper is Cuban-seed leaf grown under shade in Namanji; Holt's lists it as Nicaragua Habano.",
    taste:
      "Cigar Aficionado calls the Box-Pressed Torpedo leathery and spicy, with minerals, a sweet hint of cinnamon, and a cedary finish. Cigar Coop's Marveloso led with wood and a nougat-like sweetness, with pepper building and cedar taking over at the end. Holt's lists smoked cashew, leather, cedar, and molasses.",
    proof:
      'Cigar Aficionado scored the Box-Pressed Torpedo 94 in February 2024 and ranked it No. 11 on its Top 25 of 2024. Scores vary by size: its Cigar Insider gave the Robusto 88 and Cigar Coop gave the Marveloso 87.',
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '079935f2-b43e-5465-a78d-1a9c361c09db',
    name: 'My Father Jaime Garcia Reserva Especial',
    brand: 'My Father',
    online: 8,
    why: 'Dark and sweet at a low price, for a newer guest set on a bold-looking cigar. Reviewers split from medium to powerful, so check in early.',
    story:
      "Made at My Father Cigars in Esteli, Nicaragua, and blended entirely by Jaime Garcia, son of Pepin Garcia and the company's master blender. It was the first line to carry his name, debuting in one size at a New York City event in December 2009. My Father added three more sizes in 2023.",
    leaf: 'A dark Connecticut Broadleaf wrapper over Nicaraguan binder and filler, per the maker, Cigar Aficionado, and Cigar Coop. The Cigar Authority lists a Honduran binder and Stogie Review an Ecuadorian one.',
    taste:
      "The Cigar Authority's Robusto opened with black pepper, earth, and dark tobacco, moved to dark fruit and espresso, and ended with dried prunes and nutmeg. Cigar Aficionado's 2010 note was cooler: mostly woody with traces of nuts and licorice. Stogie Review's Robusto took about an hour and a half.",
    proof:
      "The Cigar Authority gave the Robusto 89 in February 2017, and Cigar Aficionado's Cigar Insider gave it 87 in June 2010. Corona Cigar, a retailer, lists the Super Gordo among full-bodied cigars for beginners.",
  },
  {
    guest: 'new',
    strength: 'full',
    cigarId: '96a2e4c6-0c50-5595-a220-ec2277bbdcb4',
    name: 'Rocky Patel A.L.R. Second Edition',
    brand: 'Rocky Patel',
    online: 14,
    why: 'More dessert than power: chocolate, vanilla, and coconut. Reviewers call it medium to medium-full, not full. A pricey first cigar.',
    story:
      'Made by Rocky Patel at his own TAVICUSA factory in Nicaragua. A.L.R. stands for Aged, Limited and Rare: Cigar Aficionado says every cigar rests two years after rolling before it goes to market. It is a completely new blend, not a tweak of the 2018 First Edition.',
    leaf: "A Mexican San Andres wrapper over Nicaraguan binder and filler from Rocky Patel's farms in Esteli and Condega, per Cigar Aficionado. Neptune lists a Honduran binder and Honduran and Nicaraguan filler instead.",
    taste:
      'Cigar Aficionado found malted chocolate, vanilla bean, and shredded coconut in the Toro. It says the Robusto opens bold and cedary with hints of chocolate, vanilla, and black licorice, and ends a little charry.',
    proof:
      'Cigar Aficionado ranked the Toro No. 5 of 2019 with 94 points and No. 4 of 2023 with 96. Its Cigar Insider gave the Robusto 89 in November 2019.',
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
      "An Ashton brand made by the Fuente family in the Dominican Republic; Holt's says Carlito Fuente blends it. VSG stands for Virgin Sun Grown, and it debuted in 1999 as Ashton's full-bodied line. The sizes have magic-themed names like Wizard, Sorcerer, and Spellbound.",
    leaf: 'A sun-grown Sumatra-seed wrapper from a private estate in Ecuador over Dominican binder and filler. Ashton says the Dominican tobaccos are aged four to five years.',
    taste:
      "Ashton and Holt's list cedar, espresso bean, earth, black pepper, and leather with a strong finish. Cigar Aficionado found oak, cocoa, and nuts with hints of red wine and molasses in the Robusto. Most sources call it full, though Cigar Dojo found a long-rested Belicoso smooth and medium bodied at most.",
    proof:
      "Cigar Aficionado gave the Robusto 92 points in April 2018 and has put VSG sizes on its Top 25 seven times from 2004 to 2023, as high as No. 5 in 2007. Holt's ranks it second on its top 10 full-bodied list.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'c49dade6-bef9-5a04-96a5-d6ed32af3fa3',
    name: 'My Father Le Bijou 1922',
    brand: 'My Father',
    online: 8,
    why: 'A Cigar of the Year winner, praised for balancing power and finesse. Rich, dark, and hearty for a regular smoker.',
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. Pepin Garcia created it to honor his own father, Jose Garcia, who was born in 1922; Le Bijou is French for the jewel. Cigar Aficionado calls it darker and stronger than the original My Father.',
    leaf: "The maker and Cigar Aficionado's 2015 write-up say it is all Nicaraguan, with a dark Cuban-seed wrapper the Garcias call Habano Oscuro. Cigar Aficionado's 2019 rating page and Holt's list the wrapper as Ecuador.",
    taste:
      'Cigar Aficionado says the torpedo starts sweet and woody, then picks up black pepper, nuts, and salt, with an earthy, roasted coffee bean finish. The Cigar Authority got black pepper at the light, then cherry-like sweetness and dark chocolate, with coffee taking over at the end.',
    proof:
      "Cigar Aficionado named the Torpedo Box Pressed its No. 1 cigar of 2015 with 97 points, and the Churchill was No. 7 in 2022. Holt's ranks it fourth on its top 10 full-bodied list, and The Cigar Authority gave the torpedo 93.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'a7ae5523-a578-5f41-b82a-2c2aa355636d',
    name: 'My Father The Judge',
    brand: 'My Father',
    online: 14,
    why: "Cigar Aficionado's 2024 Cigar of the Year, bold yet balanced. A famous, full-bodied pick for a seasoned smoker.",
    story:
      'Made by the Garcia family at My Father Cigars in Esteli, Nicaragua. It came out in 2016 as a stronger extension of the core My Father line, named for a judge who is a friend of the family. All sizes are chunky and box-pressed, and the box art is revived from 1905.',
    leaf: 'A dark Sumatra-seed wrapper from Ecuador over two Nicaraguan binders, one Corojo and one Criollo. The Nicaraguan filler comes from at least three Garcia farms.',
    taste:
      "Cigar Aficionado calls it rich and complex, with earthy, toasty, and woody flavors, nutty notes, and sweeter undertones. A Holt's staff review of the Toro found spice, dark chocolate, and almonds early, then leather, cocoa, and coffee, ending on earthy wood and espresso. That Toro took about 75 minutes.",
    proof:
      'Cigar Aficionado named the Grand Robusto its No. 1 cigar of 2024 with 98 points. The same size scored 93 and ranked No. 7 in 2017.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '6b9516e1-7bdb-56aa-b13c-910261cc243a',
    name: 'Don Pepin Garcia Original',
    brand: 'Don Pepin Garcia',
    online: 10,
    why: "Pepin Garcia's signature pepper and spice for a regular smoker. Strength calls range from medium to full.",
    story:
      'From Jose "Pepin" Garcia and sold by My Father Cigars. Known as the Blue Label for its blue band, it is the foundation Pepin blend, and Holt\'s says later Garcia hits grew from it. The maker says it is handcrafted in the USA, and Holt\'s says it is made at the My Father factory in Miami.',
    leaf: "All Nicaraguan. The maker calls the wrapper Nicaraguan Habano Rosado, while Holt's and The Cigar Authority call it Corojo Oscuro.",
    taste:
      "The Cigar Authority's Generosos opened with Pepin's signature spice and cedar, turned sweeter with chocolate and caramel, then ended peppery, earthy, and leathery. Cigar Aficionado says it starts bold and earthy and mellows to coffee with a cinnamon and nutmeg sweetness. The Generosos took about 2 hours.",
    proof:
      "Cigar Aficionado's Cigar Insider gave the Generosos 90 in May 2014, and The Cigar Authority gave it 92 in January 2016. Famous Smoke and Corona Cigar, both retailers, put it on their strong and full-bodied lists.",
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: '0e934244-3796-54dd-a41e-56c674c6b1ca',
    name: 'Plasencia Alma Fuerte',
    brand: 'Plasencia',
    online: 23,
    why: 'A luxury Nicaraguan smoke with real awards and a long, rich burn. Full in body, but reviewers say medium-full strength.',
    story:
      'Made by Plasencia Cigars in Nicaragua. Cigar Aficionado says the family has grown tobacco for five generations and supplies leaf to much of the cigar industry, but the name meant little to smokers until father and son Nestor and Nestor Andres Plasencia launched Alma Fuerte in 2016. The name means strong soul.',
    leaf: "All Nicaraguan wrapper, binder, and filler, from Esteli, Condega, Jalapa, and Ometepe. Cigar Dojo calls the wrapper shade-grown leaf from Jalapa, and Holt's calls it Criollo.",
    taste:
      "Cigar Aficionado says the big Generacion V is slow to warm up, then gives layers of cocoa powder, leather, and toast; its Robustus I opened with bold leather and raisin and finished with black pepper. Cigar Dojo's Nestor IV toro was creamy and sweet with coffee and milk chocolate, and took 2 hours 40 minutes.",
    proof:
      'Cigar Aficionado ranked the Generacion V No. 9 of 2017 with 93 points, and Cigar Journal named the Robustus I its No. 1 cigar of 2020. Cigar Dojo gave the Nestor IV 93, and Cigar Aficionado gave the Robustus I 90 in August 2025.',
  },
  {
    guest: 'experienced',
    strength: 'full',
    cigarId: 'bd90d3ec-24e9-5978-8c1f-a2e4d1bf0f82',
    name: 'Foundation Aksum',
    brand: 'Foundation',
    online: 16,
    why: 'A boutique blend with a story, best for guests who know Foundation or AJ Fernandez. Medium to medium-full, not full.',
    story:
      'A Foundation Cigar Company blend by founder Nick Melillo, made in Nicaragua at Tabacalera AJ Fernandez in Claro and Maduro versions. It launched in 2023 as Metapa and was renamed Aksum in February 2024 with the same blend. Aksum was an ancient kingdom in what is now Ethiopia.',
    leaf: 'An Ecuadorian Sumatra wrapper over a Connecticut Broadleaf binder and Nicaraguan filler from Esteli and Jalapa. Cigar Dojo says the Claro and Maduro use the same wrapper type, sorted by color.',
    taste:
      "Cigar Aficionado calls the Claro sweet and spicy, with red pepper flake and cinnamon met by vanilla and coconut over coffee bean and earth. The Maduro reads a bit stronger and spicier, with cedar, pepper, leather, and chocolate. Robusto times vary a lot: Holt's finished the Maduro in about 55 minutes, while a Developing Palates reviewer took over two hours.",
    proof:
      "Cigar Aficionado ranked the Claro Robusto No. 12 of 2024 with 93 points, and as Metapa Claro it was Cigar Dojo's No. 3 Cigar of the Year for 2023. Opinion is split: Developing Palates' four reviewers scored both versions between about 4.4 and 6.8 out of 10.",
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
 * with the fewest shared prices, then the sticks that have waited longest. The rules hold every week: four brands, at least three
 * prices, cheapest first. It is worked out from the week number alone, so it needs no
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
  const pool = fours(stocked).length > 0 ? stocked : all
  const key = `${guest} ${strength} ${pool.map((pick) => pick.cigarId).join()}`
  const choices = fours(pool)
  const opening = pool.slice(0, 4)
  const weeks = dealt.get(key) ?? [fours(opening).length > 0 ? opening : (choices[0] ?? [])]
  dealt.set(key, weeks)
  if (weeks.length > week) return weeks[week] ?? []
  const last = new Map<string, number>()
  weeks.forEach((four, index) => {
    for (const pick of four) last.set(pick.cigarId, index)
  })
  while (weeks.length <= week) {
    const now = weeks.length
    const cost = (four: Pick[]) => {
      let total = (4 - new Set(four.map((pick) => pick.online)).size) * 100
      for (const pick of four) {
        const seen = last.get(pick.cigarId) ?? -8
        // A repeat from last week costs the most. Otherwise the longer the wait, the cheaper.
        total += seen === now - 1 ? 1000 : Math.max(0, 8 - (now - seen))
        total += shuffle(pick.cigarId, now)
      }
      return total
    }
    // A small pool would otherwise flip between the same two fours for good.
    const stale = new Set((weeks[now - 2] ?? []).map((pick) => pick.cigarId))
    let best = weeks[now - 1] ?? []
    let least = Number.POSITIVE_INFINITY
    for (const four of choices) {
      const same = four.every((pick) => stale.has(pick.cigarId))
      const price = cost(four) + (same ? 2000 : 0)
      if (price < least) {
        least = price
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
