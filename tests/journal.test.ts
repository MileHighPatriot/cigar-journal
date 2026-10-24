import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke, withSmokeDefaults } from '../src/data/factories'
import type { Smoke } from '../src/data/types'
import {
  cardFlavors,
  carryTags,
  earlierSmoke,
  hitAndMiss,
  noteDelta,
  OFF_THIRD_NOTES,
  tastedNotes,
} from '../src/domain/journal'
import { OFF_NOTES } from '../src/domain/tags'

const cigar = newCigar({
  brand: 'AJ Fernandez',
  line: 'New World Dorado',
  flavors: ['pepper', 'cedar', 'cinnamon', 'earth', 'nuts', 'leather'],
})

function smoked(id: string, at: string, tags: string[], extra: Partial<Smoke> = {}): Smoke {
  const smoke = newSmoke(cigar.id, { id, status: 'complete', smokedAt: at, ...extra })
  smoke.thirds.first.tags = tags
  return smoke
}

describe('carrying notes into the next third', () => {
  it('copies the previous third once, and only the taste notes', () => {
    const smoke = newSmoke(cigar.id)
    smoke.thirds.first.tags = ['cedar', 'pepper']
    smoke.thirds.first.offTags = ['harsh']
    expect(carryTags('first', smoke)).toBeNull()
    expect(carryTags('second', smoke)).toEqual({ tags: ['cedar', 'pepper'], tagsSeeded: true })
    smoke.thirds.second.tags = ['cedar', 'pepper']
    smoke.thirds.second.tagsSeeded = true
    smoke.thirds.first.tags = ['cedar', 'leather']
    expect(carryTags('second', smoke)).toBeNull()
  })

  it('leaves a third clear after the notes are taken off', () => {
    const smoke = newSmoke(cigar.id)
    smoke.thirds.first.tags = ['cedar']
    smoke.thirds.second.tagsSeeded = true
    expect(carryTags('second', smoke)).toBeNull()
  })

  it('waits when the earlier third has no notes yet', () => {
    const smoke = newSmoke(cigar.id)
    expect(carryTags('second', smoke)).toBeNull()
    smoke.thirds.second.tags = ['oak']
    expect(carryTags('second', smoke)).toEqual({ tagsSeeded: true })
  })

  it('fills the new fields on a smoke saved before they existed', () => {
    const fresh = newSmoke(cigar.id)
    const old = JSON.parse(JSON.stringify(fresh)) as Smoke
    old.thirds.first = {
      tags: ['cedar'],
      strength: null,
      body: null,
      retrohale: '',
      retrohaleTags: [],
      note: '',
      issues: [],
    } as unknown as Smoke['thirds']['first']
    const filled = withSmokeDefaults(old)
    expect(filled.thirds.first).toMatchObject({
      tags: ['cedar'],
      tagsSeeded: false,
      offTags: [],
      draw: null,
      burn: null,
      ashFirmness: null,
    })
  })
})

describe('what this smoke tasted', () => {
  it('splits the published list into tasted, missed, and added', () => {
    const smoke = newSmoke(cigar.id)
    smoke.thirds.first.tags = ['pepper', 'cedar']
    smoke.thirds.final.tags = ['pepper', 'cocoa']
    expect(hitAndMiss(smoke, cigar)).toEqual({
      hit: ['pepper', 'cedar'],
      missed: ['cinnamon', 'earth', 'nuts', 'leather'],
      added: ['cocoa'],
    })
  })

  it('uses the old overall list when no third has notes', () => {
    const smoke = newSmoke(cigar.id, { quickTags: ['cedar', 'oak'] })
    expect(tastedNotes(smoke)).toEqual(['cedar', 'oak'])
    expect(hitAndMiss(smoke, cigar).added).toEqual(['oak'])
  })

  it('keeps the off-note words inside the flavor list', () => {
    const words = OFF_NOTES.map((note) => note.word)
    for (const word of OFF_THIRD_NOTES) expect(words).toContain(word)
  })
})

describe('new this time', () => {
  it('compares this smoke with the latest earlier one of the same cigar', () => {
    const older = smoked('older', '2026-10-01T00:00:00.000Z', ['cedar', 'pepper'])
    const newer = smoked('newer', '2026-10-20T00:00:00.000Z', ['pepper', 'leather'])
    const otherCigar = smoked('other', '2026-10-19T00:00:00.000Z', ['cocoa'], {
      cigarId: 'else',
    })
    const draft = smoked('draft', '2026-10-19T00:00:00.000Z', ['nuts'], { status: 'draft' })
    expect(earlierSmoke(newer, [older, newer, otherCigar, draft])?.id).toBe('older')
    expect(noteDelta(newer, older)).toEqual({
      arrived: ['leather'],
      dropped: ['cedar'],
    })
  })
})

describe('the journal card', () => {
  it('names each third that has notes', () => {
    const smoke = newSmoke(cigar.id)
    smoke.thirds.first.tags = ['cedar', 'cocoa']
    smoke.thirds.final.tags = ['pepper']
    expect(cardFlavors(smoke)).toEqual({
      mode: 'thirds',
      text: 'First cedar, cocoa · Final pepper',
    })
  })

  it('falls back to three flavor tags when no third was tagged', () => {
    const smoke = newSmoke(cigar.id, { quickTags: ['cedar', 'cocoa', 'leather', 'oak'] })
    expect(cardFlavors(smoke)).toEqual({ mode: 'tags', tags: ['cedar', 'cocoa', 'leather'] })
  })
})
