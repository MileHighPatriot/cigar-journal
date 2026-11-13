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
 * The floor picks: four sticks for each kind of guest at each strength, all from his own
 * Lounge list as it stood in his 2026-10-27 backup. Rechosen 2026-11-13 against review
 * sites (Cigar Aficionado, Blind Man's Puff, Cigar Coop, Cigar Dojo, Holt's, Famous Smoke
 * and others), so each one is backed for that guest, and no set of four has two sticks
 * from one company. A stick sits under the strength the catalog has on file for it (Mild
 * is levels 1 and 2, Medium is 3, Full is 4 and 5), and no stick is listed twice. Each set
 * runs from the cheapest to the priciest by single-stick prices online (`online`). The
 * lounge's own prices are his to set at the shelf. Every fact in `story`, `leaf`,
 * `taste`, and `proof` comes from a page opened on 2026-11-13.
 */
export const PICKS: Pick[] = [
  // New
  {
    guest: 'new',
    strength: 'mild',
    cigarId: 'a7d051c2-eba4-5a09-998d-1735d135567d',
    name: 'Hoyo de Monterrey Shade',
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
