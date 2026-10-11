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
    ],
  },
  {
    key: 'earth',
    label: 'Earth & Mineral',
    words: ['earth', 'sweet earth', 'mineral', 'graphite', 'mushroom', 'salt'],
  },
  { key: 'leather', label: 'Leather & Animal', words: ['leather', 'suede', 'barnyard', 'musk'] },
  { key: 'cream', label: 'Cream & Dairy', words: ['cream', 'butter', 'milk'] },
  {
    key: 'pepper',
    label: 'Pepper',
    words: ['black pepper', 'white pepper', 'red pepper', 'pepper'],
  },
  {
    key: 'spice',
    label: 'Baking Spice',
    words: ['cinnamon', 'nutmeg', 'clove', 'allspice', 'anise', 'baking spice', 'spice'],
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
    ],
  },
  {
    key: 'nut',
    label: 'Nut',
    words: ['almond', 'peanut', 'cashew', 'walnut', 'hazelnut', 'pecan', 'nuts'],
  },
  {
    key: 'toast',
    label: 'Toast & Bread',
    words: ['toast', 'bread', 'graham cracker', 'biscuit', 'cereal'],
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
    ],
  },
  {
    key: 'floral',
    label: 'Floral & Tea',
    words: ['floral', 'black tea', 'green tea', 'chamomile'],
  },
  { key: 'herbal', label: 'Herbal & Vegetal', words: ['hay', 'grass', 'herbs', 'mint'] },
]

export const OFF_NOTES: { word: string; tip: string }[] = [
  { word: 'ammonia', tip: 'Young or under-rested. Give the rest of the box more time.' },
  { word: 'sulfur', tip: 'Often from the light. Let it settle or purge once.' },
  { word: 'bitter', tip: 'Usually too hot. Slow down and let it cool.' },
  { word: 'tar', tip: 'Buildup at the head. Re-cut or purge.' },
  { word: 'cardboard', tip: 'Stale or dried out. Check how it was stored.' },
  { word: 'sour', tip: 'Too wet or under-fermented. Dry-box the next one.' },
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
