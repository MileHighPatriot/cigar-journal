import { Plus, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../data/store'
import { wrapperOptions } from '../domain/cigars'
import { cigarTitle } from '../domain/format'
import { searchCigars } from '../domain/search'
import { CigarForm } from './CigarForm'
import { Monogram, WrapperDot } from './Monogram'

interface Props {
  cigarId: string
  onChange: (cigarId: string) => void
  /** When true the cigar is fixed (editing an existing record). */
  locked?: boolean
}

/** Pick a cigar inside a form: search the list, or add one that is missing. */
export function CigarChooser({ cigarId, onChange, locked }: Props) {
  const state = useStore()
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const cigar = state.cigars.get(cigarId)
  const results = useMemo(
    () => (cigar ? [] : searchCigars(state.cigars.values(), query).slice(0, 30)),
    [state.cigars, query, cigar],
  )
  const wrappers = useMemo(() => wrapperOptions(state.cigars.values()), [state.cigars])

  if (cigar) {
    return (
      <div className="chosen card">
        <Monogram brand={cigar.brand || cigar.line} />
        <span className="pick-main">
          <span className="pick-brand">{cigar.brand}</span>
          <span className="pick-title">{cigarTitle(cigar)}</span>
          <span className="pick-sub">
            <WrapperDot wrapper={cigar.wrapperType} />
          </span>
        </span>
        {!locked && (
          <button type="button" className="btn btn-quiet" onClick={() => onChange('')}>
            Change
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="search">
        <Search size={20} strokeWidth={1.5} aria-hidden="true" />
        <label className="sr-only" htmlFor={searchId}>
          Which cigar
        </label>
        <input
          id={searchId}
          type="search"
          className="input"
          placeholder="Which cigar? Search the list"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
      {results.length === 0 ? (
        <p className="muted">No match in the list.</p>
      ) : (
        <ul className="pick-list">
          {results.map((option) => (
            <li key={option.id}>
              <button type="button" className="pick-row" onClick={() => onChange(option.id)}>
                <Monogram brand={option.brand || option.line} />
                <span className="pick-main">
                  <span className="pick-brand">{option.brand}</span>
                  <span className="pick-title">{cigarTitle(option)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-quiet" onClick={() => setAdding(true)}>
        <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        Add a cigar that is not listed
      </button>
      {/* The chooser sits inside another form, and a form cannot hold a form, so this one
          is mounted at the top of the page. */}
      {createPortal(
        <CigarForm
          open={adding}
          cigar={null}
          wrappers={wrappers}
          onClose={() => setAdding(false)}
          onSaved={(saved) => onChange(saved.id)}
        />,
        document.body,
      )}
    </>
  )
}
