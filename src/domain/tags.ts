import type { CustomTag, Smoke } from '../data/types'

export interface TagFamily {
  key: string
  label: string
  words: string[]
}

export const TAG_FAMILIES: TagFamily[] = [
  {
    key: 'wood',
    label: 'Wood',
    words: [
      'cedar',
      'oak',
      'hickory',
      'toasted wood',
      'sweet wood',
      'charred wood',
      'sandalwood',
      'wood',
      'mesquite',
      'pine',
      'maple',
      'mahogany',
      'aged wood',
      'dry wood',
      'damp wood',
      'cigar box',
      'pencil shavings',
      'sawdust',
    ],
  },
  {
    key: 'earth',
    label: 'Earth & Mineral',
    words: [
      'earth',
      'sweet earth',
      'mineral',
      'graphite',
      'mushroom',
      'salt',
      'damp earth',
      'dry earth',
      'forest floor',
      'potting soil',
      'clay',
      'peat',
      'moss',
      'truffle',
      'chalk',
      'flint',
      'wet stone',
      'iron',
    ],
  },
  {
    key: 'leather',
    label: 'Leather & Animal',
    words: [
      'leather',
      'suede',
      'barnyard',
      'musk',
      'old leather',
      'new leather',
      'saddle leather',
      'tack room',
      'gamey',
    ],
  },
  {
    key: 'tobacco',
    label: 'Tobacco',
    words: [
      'tobacco',
      'fresh tobacco',
      'aged tobacco',
      'dark tobacco',
      'pipe tobacco',
      'fermented tobacco',
      'tobacco leaf',
    ],
  },
  {
    key: 'cream',
    label: 'Cream & Dairy',
    words: [
      'cream',
      'butter',
      'milk',
      'sweet cream',
      'whipped cream',
      'custard',
      'half and half',
      'buttermilk',
    ],
  },
  {
    key: 'pepper',
    label: 'Pepper',
    words: [
      'black pepper',
      'white pepper',
      'red pepper',
      'pepper',
      'cracked pepper',
      'cayenne',
      'chili',
      'jalapeño',
      'paprika',
      'green peppercorn',
      'pink peppercorn',
    ],
  },
  {
    key: 'spice',
    label: 'Baking Spice',
    words: [
      'cinnamon',
      'nutmeg',
      'clove',
      'allspice',
      'anise',
      'baking spice',
      'spice',
      'cardamom',
      'ginger',
      'gingerbread',
      'licorice',
      'star anise',
      'fennel',
      'cumin',
      'coriander',
      'curry',
      'mulling spice',
    ],
  },
  {
    key: 'sweet',
    label: 'Sweet',
    words: [
      'honey',
      'caramel',
      'molasses',
      'vanilla',
      'toffee',
      'butterscotch',
      'brown sugar',
      'sweet tobacco',
      'sweet',
      'maple syrup',
      'burnt sugar',
      'cane sugar',
      'honeycomb',
      'salted caramel',
      'dulce de leche',
      'nougat',
      'marzipan',
      'marshmallow',
      'fudge',
      'crème brûlée',
      'sugar cookie',
      'cola',
      'root beer',
    ],
  },
  {
    key: 'cocoa',
    label: 'Cocoa & Coffee',
    words: [
      'cocoa',
      'dark cocoa',
      'chocolate',
      'dark chocolate',
      'milk chocolate',
      'bitter chocolate',
      'coffee',
      'roasted coffee',
      'espresso',
      'mocha',
      'cocoa powder',
      "baker's chocolate",
      'white chocolate',
      'hot cocoa',
      'cacao nibs',
      'cappuccino',
      'latte',
      'café con leche',
      'cold brew',
      'coffee grounds',
      'burnt coffee',
    ],
  },
  {
    key: 'nut',
    label: 'Nut',
    words: [
      'almond',
      'peanut',
      'cashew',
      'walnut',
      'hazelnut',
      'pecan',
      'nuts',
      'toasted almond',
      'roasted nuts',
      'salted nuts',
      'pistachio',
      'macadamia',
      'chestnut',
      'pine nut',
      'peanut butter',
      'walnut shell',
    ],
  },
  {
    key: 'toast',
    label: 'Toast & Bread',
    words: [
      'toast',
      'bread',
      'graham cracker',
      'biscuit',
      'cereal',
      'burnt toast',
      'sourdough',
      'brioche',
      'rye bread',
      'pie crust',
      'pastry',
      'shortbread',
      'cracker',
      'pretzel',
      'oatmeal',
      'toasted grain',
      'malt',
      'popcorn',
      'tortilla',
      'yeast',
    ],
  },
  {
    key: 'fruit',
    label: 'Fruit',
    words: [
      'cherry',
      'black cherry',
      'dark cherry',
      'dried cherry',
      'fig',
      'raisin',
      'dried fruit',
      'ripe fruit',
      'citrus',
      'orange peel',
      'dark fruit',
      'red fruit',
      'stone fruit',
      'tropical fruit',
      'plum',
      'prune',
      'date',
      'apricot',
      'peach',
      'apple',
      'pear',
      'berry',
      'blackberry',
      'raspberry',
      'strawberry',
      'blueberry',
      'currant',
      'cranberry',
      'grape',
      'orange',
      'lemon',
      'lemon zest',
      'lime',
      'grapefruit',
      'banana',
      'coconut',
      'pineapple',
      'mango',
      'pomegranate',
    ],
  },
  {
    key: 'floral',
    label: 'Floral & Tea',
    words: [
      'floral',
      'black tea',
      'green tea',
      'chamomile',
      'earl grey',
      'lavender',
      'rose',
      'jasmine',
      'honeysuckle',
      'orange blossom',
      'violet',
      'hibiscus',
      'perfume',
      'potpourri',
    ],
  },
  {
    key: 'herbal',
    label: 'Herbal & Vegetal',
    words: [
      'hay',
      'grass',
      'herbs',
      'mint',
      'straw',
      'fresh cut grass',
      'vegetal',
      'bell pepper',
      'olive',
      'eucalyptus',
      'menthol',
      'pine needle',
      'juniper',
      'sage',
      'thyme',
      'rosemary',
      'basil',
      'dill',
      'bay leaf',
      'oregano',
    ],
  },
  {
    key: 'smoke',
    label: 'Smoke & Char',
    words: [
      'smoke',
      'campfire',
      'char',
      'charcoal',
      'burnt',
      'ash',
      'incense',
      'fire-cured',
      'barbecue',
    ],
  },
  {
    key: 'spirits',
    label: 'Spirits & Wine',
    words: [
      'bourbon',
      'whiskey',
      'rye whiskey',
      'scotch',
      'rum',
      'cognac',
      'brandy',
      'tequila',
      'red wine',
      'port',
      'sherry',
      'stout',
      'beer',
      'amaretto',
      'coffee liqueur',
      'oak barrel',
    ],
  },
  {
    key: 'savory',
    label: 'Savory',
    words: [
      'savory',
      'meaty',
      'umami',
      'bacon',
      'beef jerky',
      'smoked meat',
      'grilled steak',
      'broth',
      'soy sauce',
      'brine',
    ],
  },
]

export const OFF_NOTES: { word: string; tip: string }[] = [
  { word: 'ammonia', tip: 'Young or under-rested. Give the rest of the box more time.' },
  { word: 'sulfur', tip: 'Often from the light. Let it settle or purge once.' },
  { word: 'bitter', tip: 'Usually too hot. Slow down and let it cool.' },
  { word: 'tar', tip: 'Buildup at the head. Re-cut or purge.' },
  { word: 'cardboard', tip: 'Stale or dried out. Check how it was stored.' },
  { word: 'sour', tip: 'Too wet or under-fermented. Dry-box the next one.' },
  { word: 'harsh', tip: 'Often smoked too fast. Slow down and let it cool.' },
  { word: 'acrid', tip: 'Overheated. Purge once and take slower puffs.' },
  { word: 'metallic', tip: 'Can come from a hot burn or the light. Let it rest a minute.' },
  { word: 'chemical', tip: 'Often lighter fuel. Toast the foot longer before the first puff.' },
  { word: 'musty', tip: 'Usually storage. Check the humidor for stale air or mold.' },
  {
    word: 'soapy',
    tip: 'Sometimes young tobacco, sometimes your palate. Sip water and try again.',
  },
  { word: 'grassy and green', tip: 'Young tobacco. More rest in the humidor often helps.' },
  { word: 'papery', tip: 'Often dried out. Check how it was stored.' },
]

/** Lounge sheet spellings that map onto a tag label. */
const SHEET_VARIANTS: Record<string, string> = {
  creamy: 'cream',
  nutty: 'nuts',
  woody: 'wood',
  toasty: 'toast',
  buttery: 'butter',
  spicy: 'spice',
  'light spice': 'spice',
  'rich spice': 'spice',
  'gentle spice': 'spice',
  'light pepper': 'pepper',
  'light cedar': 'cedar',
}

export function normalizeTag(word: string): string {
  const clean = word.trim().toLowerCase()
  return SHEET_VARIANTS[clean] ?? clean
}

/** Quick-log tags plus every third's tags, without repeats. */
export function effectiveTags(smoke: Smoke): string[] {
  const all = [
    ...smoke.quickTags,
    ...smoke.thirds.first.tags,
    ...smoke.thirds.second.tags,
    ...smoke.thirds.final.tags,
  ]
  return [...new Set(all)]
}

/** Most recently used tags first, from the last 30 tagged smokes. */
export function recentTags(smokes: Iterable<Smoke>, limit = 12): string[] {
  const tagged = [...smokes]
    .filter((smoke) => !smoke.deletedAt && effectiveTags(smoke).length > 0)
    .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1))
    .slice(0, 30)
  const counts = new Map<string, number>()
  for (const [index, smoke] of tagged.entries()) {
    // Newer smokes weigh more, so the list follows what is being smoked lately.
    const weight = 30 - index
    for (const tag of effectiveTags(smoke)) counts.set(tag, (counts.get(tag) ?? 0) + weight)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

export function familiesWithCustom(customTags: Iterable<CustomTag>): TagFamily[] {
  const extra = new Map<string, string[]>()
  for (const tag of customTags) {
    if (tag.deletedAt) continue
    const list = extra.get(tag.family) ?? []
    if (!list.includes(tag.label)) list.push(tag.label)
    extra.set(tag.family, list)
  }
  return TAG_FAMILIES.map((family) => ({
    ...family,
    words: [...new Set([...family.words, ...(extra.get(family.key) ?? [])])],
  }))
}

const FAMILY_BY_WORD = new Map<string, string>()
for (const family of TAG_FAMILIES) {
  for (const word of family.words) FAMILY_BY_WORD.set(word, family.key)
}
for (const note of OFF_NOTES) FAMILY_BY_WORD.set(note.word, 'off')

/** The family key for a built-in tag, or "custom" for one Kohlton added. */
export function tagFamily(tag: string): string {
  return FAMILY_BY_WORD.get(tag) ?? 'custom'
}
