import { describe, expect, it } from 'vitest'
import { mergeRecords } from '../src/data/merge'
import type { SyncFields } from '../src/data/types'

interface Row extends SyncFields {
  note: string
}

const row = (
  id: string,
  updatedAt: string,
  note: string,
  deletedAt: string | null = null,
): Row => ({
  id,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt,
  deletedAt,
  note,
})

describe('backup merge', () => {
  it('adds records with new ids', () => {
    const result = mergeRecords(
      [row('a', '2026-10-02T00:00:00.000Z', 'mine')],
      [row('b', '2026-10-01T00:00:00.000Z', 'theirs')],
    )
    expect(result.toWrite.map((r) => r.id)).toEqual(['b'])
    expect(result).toMatchObject({ added: 1, updated: 0, unchanged: 0 })
  })

  it('takes the incoming record when it is newer', () => {
    const result = mergeRecords(
      [row('a', '2026-10-02T00:00:00.000Z', 'old')],
      [row('a', '2026-10-03T00:00:00.000Z', 'new')],
    )
    expect(result.toWrite[0]?.note).toBe('new')
    expect(result).toMatchObject({ added: 0, updated: 1, unchanged: 0 })
  })

  it('keeps the local record when it is newer', () => {
    const result = mergeRecords(
      [row('a', '2026-10-05T00:00:00.000Z', 'local')],
      [row('a', '2026-10-03T00:00:00.000Z', 'incoming')],
    )
    expect(result.toWrite).toEqual([])
    expect(result).toMatchObject({ added: 0, updated: 0, unchanged: 1 })
  })

  it('keeps the local record on a tie', () => {
    const result = mergeRecords(
      [row('a', '2026-10-03T00:00:00.000Z', 'local')],
      [row('a', '2026-10-03T00:00:00.000Z', 'incoming')],
    )
    expect(result.toWrite).toEqual([])
    expect(result.unchanged).toBe(1)
  })

  it('carries a soft delete over when the delete is newer', () => {
    const result = mergeRecords(
      [row('a', '2026-10-02T00:00:00.000Z', 'alive')],
      [row('a', '2026-10-04T00:00:00.000Z', 'alive', '2026-10-04T00:00:00.000Z')],
    )
    expect(result.toWrite[0]?.deletedAt).toBe('2026-10-04T00:00:00.000Z')
  })

  it('does not bring back a record that was deleted locally after the backup', () => {
    const result = mergeRecords(
      [row('a', '2026-10-06T00:00:00.000Z', 'gone', '2026-10-06T00:00:00.000Z')],
      [row('a', '2026-10-04T00:00:00.000Z', 'alive')],
    )
    expect(result.toWrite).toEqual([])
  })

  it('carries an undelete over when it is newer', () => {
    const result = mergeRecords(
      [row('a', '2026-10-02T00:00:00.000Z', 'gone', '2026-10-02T00:00:00.000Z')],
      [row('a', '2026-10-05T00:00:00.000Z', 'back')],
    )
    expect(result.toWrite[0]?.deletedAt).toBeNull()
  })
})
