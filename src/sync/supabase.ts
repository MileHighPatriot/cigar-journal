import type { SupabaseClient } from '@supabase/supabase-js'
import type { Repository } from '../data/repository'
import type { OutgoingRow, Remote, RemoteRow } from './remote'

const url: string | undefined = import.meta.env.VITE_SUPABASE_URL
const key: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False in a build made without the sync address, where the sync card stays hidden. */
export const syncConfigured = Boolean(url && key)

const BUCKET = 'journal-photos'
const PAGE = 1000

let client: Promise<SupabaseClient> | null = null

/**
 * The sign-in is kept in this app's own database, not in localStorage: other sites share
 * this web address and could read anything left there.
 */
function sessionStorage(repo: Repository) {
  const read = async (): Promise<Record<string, string>> => {
    const raw = await repo.getMeta('syncSession')
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  }
  return {
    getItem: async (name: string) => (await read())[name] ?? null,
    setItem: async (name: string, value: string) => {
      await repo.setMeta('syncSession', JSON.stringify({ ...(await read()), [name]: value }))
    },
    removeItem: async (name: string) => {
      const all = await read()
      delete all[name]
      await repo.setMeta('syncSession', JSON.stringify(all))
    },
  }
}

/** Loaded only when sync is set up, so the library is not in the way otherwise. */
export function getClient(repo: Repository): Promise<SupabaseClient> {
  if (!url || !key) return Promise.reject(new Error('Sync is not set up in this version.'))
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, key, {
      auth: {
        storage: sessionStorage(repo),
        storageKey: 'cigar-journal-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }),
  )
  return client
}

export class SupabaseRemote implements Remote {
  constructor(
    private supabase: SupabaseClient,
    private userId: string,
  ) {}

  async pull(since: string | null): Promise<RemoteRow[]> {
    const rows: RemoteRow[] = []
    for (let from = 0; ; from += PAGE) {
      let query = this.supabase
        .from('records')
        .select('store,id,updated_at,deleted,data,server_at')
        .order('server_at')
        .order('id')
        .range(from, from + PAGE - 1)
      if (since) query = query.gt('server_at', since)
      const { data, error } = await query
      if (error) throw error
      for (const row of data ?? []) {
        rows.push({
          store: row.store,
          id: row.id,
          updatedAt: row.updated_at,
          deleted: row.deleted,
          data: row.data,
          serverAt: row.server_at,
        })
      }
      if (!data || data.length < PAGE) return rows
    }
  }

  async push(rows: OutgoingRow[]): Promise<void> {
    if (rows.length === 0) return
    const { error } = await this.supabase.rpc('push_records', {
      rows: rows.map((row) => ({
        store: row.store,
        id: row.id,
        updated_at: row.updatedAt,
        deleted: row.deleted,
        data: row.data,
      })),
    })
    if (error) throw error
  }

  private path(kind: 'full' | 'thumb', id: string) {
    return `${this.userId}/${kind}/${id}.jpg`
  }

  async uploadPhoto(id: string, full: ArrayBuffer, thumb: ArrayBuffer): Promise<void> {
    const bucket = this.supabase.storage.from(BUCKET)
    for (const [kind, bytes] of [
      ['full', full],
      ['thumb', thumb],
    ] as const) {
      const { error } = await bucket.upload(this.path(kind, id), bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      })
      if (error) throw error
    }
  }

  async downloadPhoto(id: string) {
    const bucket = this.supabase.storage.from(BUCKET)
    const [full, thumb] = await Promise.all([
      bucket.download(this.path('full', id)),
      bucket.download(this.path('thumb', id)),
    ])
    // Not there yet: the other device has not finished uploading it.
    if (full.error || thumb.error || !full.data || !thumb.data) return null
    return { full: await full.data.arrayBuffer(), thumb: await thumb.data.arrayBuffer() }
  }

  async removePhotos(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const paths = ids.flatMap((id) => [this.path('full', id), this.path('thumb', id)])
    const { error } = await this.supabase.storage.from(BUCKET).remove(paths)
    if (error) throw error
  }
}
