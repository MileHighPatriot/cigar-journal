import { ChevronRight, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'wouter'
import { InstallHint } from '../components/InstallHint'
import { Monogram, WrapperDot } from '../components/Monogram'
import { SmokeCard } from '../components/SmokeCard'
import { useStore } from '../data/store'
import { cigarTitle, plural } from '../domain/format'
import { daysAged, humidorTotals, remaining, restInfo, smokedCountByLot } from '../domain/humidor'
import { shownScore } from '../domain/scoring'
import { buildRows } from '../domain/search'
import { cardPhotos } from './Journal'

const dateLine = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** The front page: the mark, one big way in to a new log, and what is going on right now. */
export function Home() {
  const state = useStore()
  const now = new Date()

  const rows = useMemo(
    () => buildRows(state.smokes.values(), state.cigars),
    [state.smokes, state.cigars],
  )
  const draft = rows.find((row) => row.smoke.status === 'draft')
  const complete = useMemo(() => rows.filter((row) => row.smoke.status === 'complete'), [rows])
  const last = complete[0]
  const photoBySmoke = useMemo(() => cardPhotos(state.photos), [state.photos])

  const scores = complete
    .filter((row) => row.smoke.score !== null)
    .map((row) => shownScore(row.smoke.score ?? 0))
  const average =
    scores.length > 0 ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length) : null

  const { ready, onHand } = useMemo(() => {
    const smoked = smokedCountByLot(state.smokes.values())
    const lots = [...state.lots.values()]
      .filter((lot) => !lot.deletedAt)
      .map((lot) => ({
        lot,
        cigar: state.cigars.get(lot.cigarId),
        left: remaining(lot, smoked),
        aged: daysAged(lot),
      }))
      .filter((row) => row.left > 0 && !restInfo(row.lot).resting)
      // Longest-aged first: those are the ones to reach for.
      .sort((a, b) => b.aged - a.aged)
    return { ready: lots, onHand: humidorTotals(state.lots.values(), smoked).onHand }
  }, [state.lots, state.smokes, state.cigars])

  const wishes = [...state.wishlist.values()].filter(
    (wish) => !wish.deletedAt && wish.status === 'open',
  ).length

  const tiles = [
    { href: '/journal', label: 'Smokes logged', value: String(complete.length) },
    { href: '/stats', label: 'Average score', value: average === null ? 'None' : String(average) },
    { href: '/humidor', label: 'In the humidor', value: String(onHand) },
    { href: '/wishlist', label: 'Want to try', value: String(wishes) },
  ]

  return (
    <div className="page home">
      <header className="home-top">
        <div className="home-words">
          <p className="home-kicker">{greeting(now.getHours())}</p>
          <h1>Cigar Journal</h1>
          <p className="muted">{dateLine.format(now)}</p>
        </div>
        <div className="home-actions">
          <Link href="/log" className="btn btn-primary btn-log">
            <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
            Log a smoke
          </Link>
          {draft && (
            <Link
              href={`/log/${draft.smoke.id}/${draft.smoke.draftStep ?? 'scores'}`}
              className="btn btn-quiet"
            >
              Resume {draft.cigar ? cigarTitle(draft.cigar) : 'your smoke'}
            </Link>
          )}
        </div>
      </header>

      <InstallHint />

      <section className="home-section" aria-labelledby="home-last">
        <div className="home-section-head">
          <h2 id="home-last">Last smoke</h2>
          {last && (
            <Link href="/journal" className="home-more">
              Open the journal
              <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </div>
        {last ? (
          <SmokeCard row={last} photo={photoBySmoke.get(last.smoke.id)} featured />
        ) : (
          <div className="empty home-empty">
            <p className="empty-title">Your journal starts here</p>
            <p className="muted">Log your first smoke and it shows up on this page.</p>
          </div>
        )}
      </section>

      <ul className="home-tiles">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} className="home-tile">
              <span className="numeral numeral-md num">{tile.value}</span>
              <span className="home-tile-label">{tile.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="home-columns">
        <section className="home-section" aria-labelledby="home-ready">
          <div className="home-section-head">
            <h2 id="home-ready">Ready to smoke</h2>
            {ready.length > 0 && (
              <Link href="/humidor" className="home-more">
                Open the humidor
                <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            )}
          </div>
          {ready.length > 0 ? (
            <ul className="pick-list">
              {ready.slice(0, 4).map(({ lot, cigar, left, aged }) => (
                <li key={lot.id}>
                  <Link href={`/humidor/${lot.id}`} className="pick-row">
                    <Monogram brand={cigar?.brand || cigar?.line || '?'} />
                    <span className="pick-main">
                      <span className="pick-brand">{cigar?.brand || 'Unknown brand'}</span>
                      <span className="pick-title">
                        {cigar ? cigarTitle(cigar) : 'Unknown cigar'}
                      </span>
                      <span className="pick-sub">
                        <WrapperDot wrapper={cigar?.wrapperType ?? null} />
                        <span className="num">Aged {plural(aged, 'day')}</span>
                      </span>
                    </span>
                    <span className="pick-note muted num">{left} left</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty home-empty">
              <p className="empty-title">Nothing rested yet</p>
              <p className="muted">Cigars in your humidor show up here once they are ready.</p>
              <Link href="/humidor" className="btn btn-quiet">
                Open the humidor
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
