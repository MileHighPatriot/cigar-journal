import { describe, expect, it } from 'vitest'
import { smokesToCsv } from '../src/backup/csv'
import { AROMA_TAGS, STARTER_TAGS, suggestedTags } from '../src/components/FlavorField'
import { newCigar, newSmoke, withSmokeDefaults } from '../src/data/factories'
import type { Smoke } from '../src/data/types'
import { buildRows, searchRows } from '../src/domain/search'
import { OFF_NOTES, TAG_FAMILIES, tagFamily } from '../src/domain/tags'

describe('the flavor list', () => {
  const words = TAG_FAMILIES.flatMap((family) => family.words)

  it('lists each flavor once, in one family', () => {
    const all = [...words, ...OFF_NOTES.map((note) => note.word)]
    expect(all.filter((word, index) => all.indexOf(word) !== index)).toEqual([])
  })

  it('is lowercase and has room to choose from', () => {
    expect(words.every((word) => word === word.toLowerCase().trim())).toBe(true)
    expect(words.length).toBeGreaterThan(250)
  })

  it('keeps every flavor from the first list in its family', () => {
    expect(tagFamily('cedar')).toBe('wood')
    expect(tagFamily('sweet tobacco')).toBe('sweet')
    expect(tagFamily('salt')).toBe('earth')
    expect(tagFamily('ammonia')).toBe('off')
    expect(tagFamily('pipe tobacco')).toBe('tobacco')
  })

  it('offers only known flavors as one-tap chips', () => {
    for (const tag of [...STARTER_TAGS, ...AROMA_TAGS]) expect(words).toContain(tag)
    expect(suggestedTags([])).toHaveLength(16)
  })
})

describe('flavors and notes at every stage', () => {
  const cigar = newCigar({ brand: 'Padron', line: '1964 Anniversary' })
  const cigars = new Map([[cigar.id, cigar]])

  it('gives a smoke saved by an older version the new fields as empty', () => {
    const fresh = newSmoke(cigar.id, { summary: 'kept' })
    // What the first release stored: no aroma or retrohale flavors, no step notes.
    const old = JSON.parse(JSON.stringify(fresh)) as Record<string, unknown>
    for (const key of ['constructionNote', 'pairingNote', 'scoreNote', 'vitola']) delete old[key]
    old.prelight = { wrapperNotes: 'oily', footAroma: 'hay', coldDraw: '', cutType: null }
    old.thirds = {
      first: { tags: ['cedar'], strength: 3, body: null, retrohale: '', note: 'n', issues: [] },
      second: fresh.thirds.second,
      final: fresh.thirds.final,
    }
    const filled = withSmokeDefaults(old as unknown as Smoke)
    expect(filled.summary).toBe('kept')
    expect(filled.prelight).toMatchObject({
      wrapperNotes: 'oily',
      footAroma: 'hay',
      aromaTags: [],
      coldDrawTags: [],
      note: '',
      lightMethod: null,
    })
    expect(filled.thirds.first).toMatchObject({ tags: ['cedar'], note: 'n', retrohaleTags: [] })
    expect(filled).toMatchObject({ constructionNote: '', pairingNote: '', scoreNote: '' })
    expect(withSmokeDefaults(fresh)).toEqual(fresh)
  })

  const smoke = newSmoke(cigar.id, {
    status: 'complete',
    constructionNote: 'razor burn line',
    pairingNote: 'the rye fought it',
    scoreNote: 'fell apart late',
  })
  smoke.prelight = { ...smoke.prelight, aromaTags: ['barnyard'], note: 'tight pack' }
  smoke.thirds.second = { ...smoke.thirds.second, retrohaleTags: ['white pepper'] }

  it('finds a smoke by any of them', () => {
    const rows = buildRows([smoke], cigars)
    for (const query of ['barnyard', 'tight pack', 'white pepper', 'razor', 'rye fought', 'late']) {
      expect(searchRows(rows, query)).toHaveLength(1)
    }
    expect(searchRows(rows, 'nowhere')).toHaveLength(0)
  })

  it('exports them after the earlier CSV columns', () => {
    const [header = '', row = ''] = smokesToCsv([smoke], cigars).split('\r\n')
    const columns = header.replace('﻿', '').split(',')
    expect(columns.slice(columns.indexOf('id'))).toEqual([
      'id',
      'foot_aroma',
      'cold_draw',
      'prelight_note',
      'retrohale_first',
      'retrohale_second',
      'retrohale_final',
      'construction_note',
      'pairing_note',
      'score_note',
    ])
    expect(
      row.endsWith(
        'barnyard,,tight pack,,white pepper,,razor burn line,the rye fought it,fell apart late',
      ),
    ).toBe(true)
  })
})
