import type { SyncFields } from './types'

export interface MergeResult<T> {
  /** Records to write locally: new ids, plus incoming records that are newer. */
  toWrite: T[]
  added: number
  updated: number
  unchanged: number
}

/**
 * Backup import and (later) sync share this rule: per record, the newer updatedAt wins.
 * A tie keeps the local copy. Soft deletes travel as ordinary fields on the record.
 */
export function mergeRecords<T extends SyncFields>(local: T[], incoming: T[]): MergeResult<T> {
  const byId = new Map(local.map((record) => [record.id, record]))
  const result: MergeResult<T> = { toWrite: [], added: 0, updated: 0, unchanged: 0 }
  for (const record of incoming) {
    const mine = byId.get(record.id)
    if (!mine) {
      result.toWrite.push(record)
      result.added += 1
    } else if (record.updatedAt > mine.updatedAt) {
      result.toWrite.push(record)
      result.updated += 1
    } else {
      result.unchanged += 1
    }
  }
  return result
}
