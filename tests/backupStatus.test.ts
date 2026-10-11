import { describe, expect, it } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import { backupReminderText, backupStatus } from '../src/domain/backupStatus'

const now = new Date('2026-10-20T12:00:00.000Z')
const seeded = newCigar({
  source: 'seed',
  createdAt: '2026-10-10T00:00:00.000Z',
  updatedAt: '2026-10-10T00:00:00.000Z',
})
const smoke = (updatedAt: string) => ({ ...newSmoke('c'), updatedAt })
const empty = { cigars: [seeded], smokes: [], lots: [], wishlist: [], customTags: [], photos: [] }

describe('backup reminder', () => {
  it('stays quiet when nothing has been entered, even with no backup', () => {
    expect(backupStatus(empty, null, now).due).toBe(false)
  })

  it('is due when there are entries and there has never been a backup', () => {
    const status = backupStatus(
      { ...empty, smokes: [smoke('2026-10-19T00:00:00.000Z')] },
      null,
      now,
    )
    expect(status).toMatchObject({ daysSince: null, smokes: 1, due: true })
    expect(backupReminderText(status)).toBe('No backup yet. 1 entry live only on this device.')
  })

  it('is due after more than 7 days when something changed since', () => {
    const smokes = [
      smoke('2026-10-05T00:00:00.000Z'),
      smoke('2026-10-12T00:00:00.000Z'),
      smoke('2026-10-15T00:00:00.000Z'),
      smoke('2026-10-18T00:00:00.000Z'),
      smoke('2026-10-19T00:00:00.000Z'),
    ]
    const status = backupStatus({ ...empty, smokes }, '2026-10-11T00:00:00.000Z', now)
    expect(status).toMatchObject({ daysSince: 9, smokes: 4, due: true })
    expect(backupReminderText(status)).toBe(
      'Last backup 9 days ago. 4 entries new or changed since.',
    )
  })

  it('is not due within 7 days, or when nothing changed since the last one', () => {
    const recent = [smoke('2026-10-19T00:00:00.000Z')]
    expect(backupStatus({ ...empty, smokes: recent }, '2026-10-15T00:00:00.000Z', now).due).toBe(
      false,
    )
    const old = [smoke('2026-10-01T00:00:00.000Z')]
    expect(backupStatus({ ...empty, smokes: old }, '2026-10-05T00:00:00.000Z', now).due).toBe(false)
  })

  it('counts an edited seeded cigar as a change', () => {
    const edited = { ...seeded, updatedAt: '2026-10-18T00:00:00.000Z' }
    const status = backupStatus(
      { ...empty, cigars: [seeded, edited] },
      '2026-10-05T00:00:00.000Z',
      now,
    )
    expect(status).toMatchObject({ smokes: 0, other: 1, due: true })
    expect(backupReminderText(status)).toBe('Last backup 15 days ago. You have changes since then.')
  })
})
