import { useMemo } from 'react'
import { useStore } from '../data/store'
import type { Smoke } from '../data/types'
import { standing } from '../domain/standing'

/** Where this smoke sits in the journal: its rank, and how it did against brand and wrapper. */
export function Standing({ smoke }: { smoke: Smoke }) {
  const state = useStore()
  const lines = useMemo(
    () => standing(smoke, state.smokes.values(), state.cigars),
    [smoke, state.smokes, state.cigars],
  )
  if (lines.length === 0) return null
  const [first, ...rest] = lines
  return (
    <ul className="standing" aria-label="Where it stands in your journal">
      <li className="standing-rank num">{first}</li>
      {rest.map((line) => (
        <li key={line} className="num">
          {line}
        </li>
      ))}
    </ul>
  )
}
