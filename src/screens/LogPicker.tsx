import { Plus, Search, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { FlowLayout } from '../components/FlowLayout'
import { Monogram, WrapperDot } from '../components/Monogram'
import { Sheet } from '../components/Sheet'
import { newCigar, newSmoke } from '../data/factories'
import { getRepo, logPath, saveBatch, useStore } from '../data/store'
import type { Cigar } from '../data/types'
import { cigarSubtitle, cigarTitle } from '../domain/format'
import { remaining, smokedCountByLot } from '../domain/humidor'
import { levelLabel } from '../domain/scoring'
import { searchCigars } from '../domain/search'

type Mode = 'quick' | 'full'

function CigarRow({ cigar, note, onPick }: { cigar: Cigar; note?: string; onPick: () => void }) {
  return (
    <li>
      <button type="button" className="pick-row" onClick={onPick}>
        <Monogram brand={cigar.brand || cigar.line} />
        <span className="pick-main">
          <span className="pick-brand">{cigar.brand}</span>
          <span className="pick-title">{cigarTitle(cigar)}</span>
          <span className="pick-sub">
            {cigarSubtitle(cigar) && <span>{cigarSubtitle(cigar)}</span>}
            <WrapperDot wrapper={cigar.wrapperType} />
          </span>
        </span>
        <span className="pick-note muted num">{note ?? levelLabel(cigar.strength)}</span>
      </button>
    </li>
  )
}

export function LogPicker() {
  const state = useStore()
  const [, navigate] = useLocation()
  const [mode, setMode] = useState<Mode>('quick')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ brand: '', line: '', vitola: '' })

  useEffect(() => {
    getRepo()
      .getMeta('lastLogMode')
      .then((last) => last && setMode(last))
      .catch(() => {})
  }, [])

  function chooseMode(next: Mode) {
    setMode(next)
    void getRepo().setMeta('lastLogMode', next)
  }

  /** A smoke exists from the moment a cigar is picked, so nothing typed after is lost. */
  function start(cigar: Cigar, lotId: string | null, isNew = false) {
    const draftStep = mode === 'full' ? 'full/prelight' : 'scores'
    const smoke = newSmoke(cigar.id, { lotId, mode, draftStep })
    void saveBatch(isNew ? { cigars: [cigar], smokes: [smoke] } : { smokes: [smoke] })
    navigate(logPath(smoke), { replace: true })
  }

  const humidorRows = useMemo(() => {
    const smoked = smokedCountByLot(state.smokes.values())
    return [...state.lots.values()]
      .filter((lot) => !lot.deletedAt && remaining(lot, smoked) > 0)
      .flatMap((lot) => {
        const cigar = state.cigars.get(lot.cigarId)
        return cigar && !cigar.deletedAt ? [{ lot, cigar, left: remaining(lot, smoked) }] : []
      })
  }, [state.lots, state.smokes, state.cigars])

  const recent = useMemo(() => {
    const seen = new Set<string>()
    const out: Cigar[] = []
    const latest = [...state.smokes.values()]
      .filter((smoke) => !smoke.deletedAt)
      .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1))
    for (const smoke of latest) {
      const cigar = state.cigars.get(smoke.cigarId)
      if (!cigar || cigar.deletedAt || seen.has(cigar.id)) continue
      seen.add(cigar.id)
      out.push(cigar)
      if (out.length === 6) break
    }
    return out
  }, [state.smokes, state.cigars])

  const searching = query.trim().length > 0
  const results = useMemo(
    () => searchCigars(state.cigars.values(), query).slice(0, 60),
    [state.cigars, query],
  )
  const lowerQuery = query.trim().toLowerCase()
  const humidorShown = searching
    ? humidorRows.filter(({ cigar }) =>
        `${cigar.brand} ${cigar.line} ${cigar.vitola ?? ''}`.toLowerCase().includes(lowerQuery),
      )
    : humidorRows

  function openAdd() {
    setForm({ brand: query.trim(), line: '', vitola: '' })
    setAdding(true)
  }

  function submitAdd(event: FormEvent) {
    event.preventDefault()
    const brand = form.brand.trim()
    const line = form.line.trim()
    if (!brand && !line) return
    start(newCigar({ brand, line, vitola: form.vitola.trim() || null }), null, true)
  }

  return (
    <FlowLayout
      lead={
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => navigate('/')}>
          <X size={24} strokeWidth={1.5} aria-hidden="true" />
        </button>
      }
      title={<h1 className="flow-h1">Log a smoke</h1>}
      actions={
        <button type="button" className="btn btn-quiet btn-block" onClick={openAdd}>
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
          Add new cigar
        </button>
      }
    >
      <div className="pick-tools">
        <div className="segmented" role="group" aria-label="How much detail">
          <button type="button" aria-pressed={mode === 'quick'} onClick={() => chooseMode('quick')}>
            Quick
          </button>
          <button type="button" aria-pressed={mode === 'full'} onClick={() => chooseMode('full')}>
            Full
          </button>
        </div>

        <div className="search">
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
          <label className="sr-only" htmlFor="cigar-search">
            Search your cigars
          </label>
          <input
            id="cigar-search"
            type="search"
            className="input"
            placeholder="Search your cigars"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
        </div>
      </div>

      {humidorShown.length > 0 && (
        <section>
          <h2 className="list-heading">In your humidor</h2>
          <ul className="pick-list">
            {humidorShown.map(({ lot, cigar, left }) => (
              <CigarRow
                key={lot.id}
                cigar={cigar}
                note={`${left} left`}
                onPick={() => start(cigar, lot.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {!searching && recent.length > 0 && (
        <section>
          <h2 className="list-heading">Recent</h2>
          <ul className="pick-list">
            {recent.map((cigar) => (
              <CigarRow key={cigar.id} cigar={cigar} onPick={() => start(cigar, null)} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="list-heading">{searching ? 'Matches' : 'All cigars'}</h2>
        {results.length === 0 ? (
          <p className="muted">No match. Add it as a new cigar below.</p>
        ) : (
          <ul className="pick-list">
            {results.map((cigar) => (
              <CigarRow key={cigar.id} cigar={cigar} onPick={() => start(cigar, null)} />
            ))}
          </ul>
        )}
      </section>

      <Sheet open={adding} title="Add new cigar" onClose={() => setAdding(false)}>
        <form className="stack" onSubmit={submitAdd}>
          <p className="muted">A brand or a line is enough. You can fill in the rest later.</p>
          <label className="field">
            <span>Brand</span>
            <input
              className="input"
              value={form.brand}
              onChange={(event) => setForm({ ...form, brand: event.target.value })}
              autoCapitalize="words"
            />
          </label>
          <label className="field">
            <span>Line</span>
            <input
              className="input"
              value={form.line}
              onChange={(event) => setForm({ ...form, line: event.target.value })}
              autoCapitalize="words"
            />
          </label>
          <label className="field">
            <span>Size name (optional)</span>
            <input
              className="input"
              placeholder="Robusto, Toro, Churchill"
              value={form.vitola}
              onChange={(event) => setForm({ ...form, vitola: event.target.value })}
              autoCapitalize="words"
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!form.brand.trim() && !form.line.trim()}
          >
            Add and continue
          </button>
        </form>
      </Sheet>
    </FlowLayout>
  )
}
