// Dev only. This screen is not part of the production build.
import { useState } from 'react'
import { useStore } from '../data/store'
import { addFakeSmokes, removeFakeData } from './fakeData'

export default function DevScreen() {
  const state = useStore()
  const [status, setStatus] = useState('')
  const fake = [...state.smokes.keys()].filter((id) => id.startsWith('fake-')).length

  async function run(label: string, task: () => Promise<unknown>) {
    setStatus(`${label}...`)
    const started = performance.now()
    try {
      await task()
      setStatus(`${label}: done in ${Math.round(performance.now() - started)} ms`)
    } catch (error) {
      setStatus(`${label}: failed. ${String(error)}`)
    }
  }

  return (
    <div className="page stack">
      <header className="page-head">
        <h1>Dev tools</h1>
        <p className="muted num">
          {state.smokes.size} smokes in memory, {fake} fake
        </p>
      </header>
      <button
        type="button"
        className="btn btn-quiet"
        onClick={() => run('Add 14 sample smokes', () => addFakeSmokes(14, 10))}
      >
        Add 14 sample smokes with photos
      </button>
      <button
        type="button"
        className="btn btn-quiet"
        onClick={() => run('Add 500 fake smokes', () => addFakeSmokes(500, 40))}
      >
        Add 500 fake smokes
      </button>
      <button
        type="button"
        className="btn btn-destructive"
        onClick={() => run('Remove fake data', removeFakeData)}
      >
        Remove fake data
      </button>
      <p role="status">{status}</p>
    </div>
  )
}
