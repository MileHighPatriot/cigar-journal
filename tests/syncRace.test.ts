import 'fake-indexeddb/auto'
import { describe, expect, it, vi } from 'vitest'
import { newCigar, newSmoke } from '../src/data/factories'
import { IdbRepository } from '../src/data/repository'
import {
  absorbRecords,
  getState,
  initStore,
  patchSmoke,
  reloadFromDisk,
  whenSaved,
} from '../src/data/store'
import { syncOnce } from '../src/sync/engine'
import type { OutgoingRow, Remote, RemoteRow } from '../src/sync/remote'

let n = 0
const device = () => IdbRepository.open(`race-test-${++n}`)

const cigar = newCigar({
  id: 'seed-1',
  brand: 'Padron',
  line: '1964 Anniversary',
  source: 'seed',
  createdAt: '2026-10-10T00:00:00.000Z',
  updatedAt: '2026-10-10T00:00:00.000Z',
})

const at = (seconds: number) => new Date(Date.UTC(2026, 9, 10, 12, 0, seconds)).toISOString()

function serverWith(rows: RemoteRow[], beforeAnswer?: () => Promise<void>): Remote {
  return {
    async pull() {
      await beforeAnswer?.()
      return rows
    },
    async push(_rows: OutgoingRow[]) {},
    async uploadPhoto() {},
    async downloadPhoto() {
      return null
    },
    async removePhotos() {},
  }
}

describe('writing only what is newer', () => {
  it('adds new records, takes newer ones, and leaves a newer local copy alone', async () => {
    const repo = await device()
    const mine = { ...newSmoke(cigar.id, { summary: 'Mine' }), updatedAt: at(30) }
    const stale = { ...newSmoke(cigar.id, { summary: 'Old here' }), updatedAt: at(10) }
    await repo.putMany({ smokes: [mine, stale] })

    const fresh = { ...newSmoke(cigar.id, { summary: 'New' }), updatedAt: at(5) }
    const written = await repo.putManyIfNewer({
      smokes: [
        { ...mine, summary: 'Older from the server', updatedAt: at(20) },
        { ...stale, summary: 'Newer from the server', updatedAt: at(40) },
        fresh,
      ],
    })

    expect(written.smokes?.map((s) => s.summary).sort()).toEqual(['New', 'Newer from the server'])
    const after = new Map((await repo.getAll('smokes')).map((s) => [s.id, s.summary]))
    expect(after.get(mine.id)).toBe('Mine')
    expect(after.get(stale.id)).toBe('Newer from the server')
    expect(after.get(fresh.id)).toBe('New')
  })

  it('keeps the local copy on a tie', async () => {
    const repo = await device()
    const mine = { ...newSmoke(cigar.id, { summary: 'Mine' }), updatedAt: at(30) }
    await repo.putMany({ smokes: [mine] })
    const written = await repo.putManyIfNewer({ smokes: [{ ...mine, summary: 'Theirs' }] })
    expect(written.smokes).toBeUndefined()
    expect((await repo.getAll('smokes'))[0]?.summary).toBe('Mine')
  })
})

describe('an edit made while sync is running', () => {
  it('is not replaced by an older copy the pull was already carrying', async () => {
    const repo = await device()
    const smoke = { ...newSmoke(cigar.id, { summary: 'First' }), updatedAt: at(1) }
    await repo.putMany({ smokes: [smoke] })

    const fromServer: RemoteRow = {
      store: 'smokes',
      id: smoke.id,
      updatedAt: at(20),
      deleted: false,
      data: { ...smoke, summary: 'From the laptop', updatedAt: at(20) },
      serverAt: at(21),
    }
    // The edit lands on this device after the server answered and before the write.
    const server = serverWith([fromServer], async () => {
      await repo.putMany({ smokes: [{ ...smoke, summary: 'Typed just now', updatedAt: at(50) }] })
    })

    const pulled: string[] = []
    const result = await syncOnce(repo, server, undefined, (written) => {
      for (const s of written.smokes ?? []) pulled.push(s.summary)
    })

    expect(result.pulled).toBe(0)
    expect(pulled).toEqual([])
    expect((await repo.getAll('smokes'))[0]?.summary).toBe('Typed just now')
  })

  it('hands the screen exactly the records the pull wrote', async () => {
    const repo = await device()
    const smoke = { ...newSmoke(cigar.id, { summary: 'From the laptop' }), updatedAt: at(20) }
    const server = serverWith([
      {
        store: 'smokes',
        id: smoke.id,
        updatedAt: smoke.updatedAt,
        deleted: false,
        data: smoke,
        serverAt: at(21),
      },
    ])
    const seen: string[] = []
    await syncOnce(repo, server, undefined, (written) => {
      for (const s of written.smokes ?? []) seen.push(s.id)
    })
    expect(seen).toEqual([smoke.id])
  })
})

describe('the journal in memory', () => {
  it('opens, re-reads, and takes in synced records without writing anything', async () => {
    const repo = await device()
    const smoke = newSmoke(cigar.id, { status: 'complete', summary: 'First' })
    await repo.putMany({ cigars: [cigar], smokes: [smoke] })
    // The cigar list is already at this version, so nothing is seeded in the test.
    await repo.setMeta('seedVersion', Number.MAX_SAFE_INTEGER)

    const putMany = vi.spyOn(repo, 'putMany')
    const put = vi.spyOn(repo, 'put')
    await initStore({ repository: repo })
    expect(getState().loadError).toBeNull()
    expect(getState().ready).toBe(true)
    await reloadFromDisk()

    // A newer copy from sync shows up. An older one is ignored.
    const newer = { ...smoke, summary: 'Newer', updatedAt: at(3000000) }
    absorbRecords({ smokes: [newer] })
    expect(getState().smokes.get(smoke.id)?.summary).toBe('Newer')
    absorbRecords({ smokes: [{ ...smoke, summary: 'Older', updatedAt: at(1) }] })
    expect(getState().smokes.get(smoke.id)?.summary).toBe('Newer')

    expect(putMany).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
    // The seeded cigar still counts as untouched.
    const stored = (await repo.getAll('cigars'))[0]
    expect(stored?.updatedAt).toBe(stored?.createdAt)
  })

  it('keeps an edit saved while a re-read is still reading', async () => {
    const repo = await device()
    const smoke = newSmoke(cigar.id, { status: 'complete', summary: 'First' })
    await repo.putMany({ cigars: [cigar], smokes: [smoke] })
    await repo.setMeta('seedVersion', Number.MAX_SAFE_INTEGER)
    await initStore({ repository: repo })

    // The read of smokes returns what was on disk before the edit, and returns it late.
    const realGetAll = repo.getAll.bind(repo)
    let release: () => void = () => {}
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    vi.spyOn(repo, 'getAll').mockImplementation(async (store) => {
      const rows = await realGetAll(store)
      if (store === 'smokes') await held
      return rows
    })

    const reading = reloadFromDisk()
    await new Promise((resolve) => setTimeout(resolve, 5))
    void patchSmoke(smoke.id, { summary: 'Typed during the read' })
    release()
    await reading
    await whenSaved()

    expect(getState().smokes.get(smoke.id)?.summary).toBe('Typed during the read')
    expect((await realGetAll('smokes'))[0]?.summary).toBe('Typed during the read')

    // The next edit builds on that copy, not on a stale one.
    await patchSmoke(smoke.id, { status: 'complete' })
    expect((await realGetAll('smokes'))[0]?.summary).toBe('Typed during the read')
  })
})

describe('searching the cigar list', () => {
  it('reads the records and changes none of them', async () => {
    const { filterCigars } = await import('../src/domain/cigars')
    const { closestCigars, searchCigars } = await import('../src/domain/search')
    const list = [cigar, newCigar({ brand: 'Oliva', line: 'Serie V', source: 'seed' })]
    const before = JSON.stringify(list)
    const filter = { query: 'padron 1964', strength: null, wrapper: null, only: 'all' as const }
    expect(filterCigars(list, filter, new Map()).map((c) => c.id)).toEqual([cigar.id])
    expect(searchCigars(list, 'oliva')).toHaveLength(1)
    expect(closestCigars(list, 'padrone anniversary')[0]?.id).toBe(cigar.id)
    // Asked twice: the kept search text gives the same answer.
    expect(searchCigars(list, 'OLIVA serie')).toHaveLength(1)
    expect(JSON.stringify(list)).toBe(before)
  })
})
