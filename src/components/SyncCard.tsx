import { RefreshCw } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { formatDateLong, formatTime } from '../domain/format'
import { createAccount, signIn, signOut, syncNow, useSync } from '../sync/auto'

/** Automatic sync between devices: sign in once on each, and they keep each other current. */
export function SyncCard() {
  const sync = useSync()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (sync.status === 'off') return null

  async function run(action: (email: string, password: string) => Promise<void>) {
    setBusy(true)
    try {
      await action(email.trim(), password)
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void run(signIn)
  }

  if (sync.status === 'out') {
    return (
      <section className="card settings-card">
        <h2>Sync</h2>
        <p className="muted">
          Sign in on your phone and your laptop with the same email and password, and they keep each
          other up to date on their own. The first time, tap Create account.
        </p>
        <form className="stack" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Sign in
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={busy || !email.trim() || password.length < 6}
            onClick={() => void run(createAccount)}
          >
            Create account
          </button>
        </form>
        {sync.message && (
          <p className="error-text" role="alert">
            {sync.message}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="card settings-card">
      <h2>Sync</h2>
      <p className="backup-state">
        <span
          className={sync.status === 'error' ? 'state-dot is-due' : 'state-dot'}
          aria-hidden="true"
        />
        {sync.status === 'syncing' ? 'Syncing now' : 'Sync is on'}
      </p>
      <dl className="facts facts-wide">
        <div>
          <dt>Signed in as</dt>
          <dd>{sync.email ?? 'Unknown'}</dd>
        </div>
        <div>
          <dt>Last synced</dt>
          <dd className="num">
            {sync.lastAt
              ? `${formatDateLong(sync.lastAt)} at ${formatTime(sync.lastAt)}`
              : 'Not yet'}
          </dd>
        </div>
      </dl>
      {sync.message && (
        <p className="error-text" role="alert">
          {sync.message}
        </p>
      )}
      <button
        type="button"
        className="btn btn-quiet"
        disabled={sync.status === 'syncing'}
        onClick={() => void syncNow()}
      >
        <RefreshCw size={20} strokeWidth={1.5} aria-hidden="true" />
        Sync now
      </button>
      <p className="muted settings-note">
        It also syncs by itself: when you open the app, a few seconds after you save, and every few
        minutes while it is open.
      </p>
      <button type="button" className="btn btn-quiet" onClick={() => void signOut()}>
        Sign out on this device
      </button>
      <p className="muted settings-note">Signing out keeps everything that is already here.</p>
    </section>
  )
}
