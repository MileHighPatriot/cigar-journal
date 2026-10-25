import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { BarList, ColumnChart, DotPlot } from '../components/charts'
import { ScoreRing } from '../components/ScoreRing'
import { useStore } from '../data/store'
import { cigarTitle, formatDate, formatMinutes, formatMoney, plural } from '../domain/format'
import { humidorTotals, smokedCountByLot } from '../domain/humidor'
import { verdictFor } from '../domain/scoring'
import { smokeSize } from '../domain/sizes'
import {
  average,
  averageBy,
  completedRows,
  type GroupKey,
  scoreBins,
  scoredRows,
  spendByMonth,
  topTags,
  totalMinutes,
} from '../domain/stats'
import { tagFamily } from '../domain/tags'

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: 'wrapper', label: 'Wrapper' },
  { key: 'country', label: 'Country' },
  { key: 'strength', label: 'Strength' },
  { key: 'brand', label: 'Brand' },
]

export function Stats() {
  const state = useStore()
  const [group, setGroup] = useState<GroupKey>('wrapper')

  const data = useMemo(() => {
    const rows = completedRows(state.smokes.values(), state.cigars)
    const scored = scoredRows(rows)
    const scores = scored.map((row) => row.score)
    const smokes = rows.map((row) => row.smoke)
    const lots = [...state.lots.values()]
    const spend = spendByMonth(state.smokes.values(), lots)
    return {
      count: rows.length,
      scored,
      average: average(scores),
      bins: scoreBins(scores),
      top: [...scored].sort((a, b) => b.score - a.score).slice(0, 5),
      tags: topTags(smokes),
      minutes: totalMinutes(smokes),
      spend,
      spent: spend.reduce((sum, month) => sum + month.total, 0),
      humidor: humidorTotals(lots, smokedCountByLot(state.smokes.values())),
    }
  }, [state.smokes, state.cigars, state.lots])

  const groups = useMemo(() => averageBy(data.scored, group), [data.scored, group])
  const shownAverage = data.average === null ? null : Math.round(data.average)
  const low =
    groups.length > 0 ? Math.min(70, Math.floor(groups[groups.length - 1]?.average ?? 70)) : 70

  return (
    <div className="page stats">
      <header className="hero">
        <div className="hero-top">
          <h1>Stats</h1>
        </div>
        <div className="kpis">
          <div className="kpi kpi-ring">
            <ScoreRing shown={shownAverage} size={84} stroke={4}>
              <span className="numeral numeral-md num">{shownAverage ?? ''}</span>
            </ScoreRing>
            <span className="kpi-text">
              <span className="kpi-label">Average score</span>
              <span className="kpi-note">
                {shownAverage === null ? 'No scores yet' : verdictFor(shownAverage)}
              </span>
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Smokes</span>
            <span className="kpi-value">{data.count}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Time smoking</span>
            <span className="kpi-value">{formatMinutes(data.minutes) || '0 min'}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Spent, last 12 months</span>
            <span className="kpi-value">{formatMoney(Math.round(data.spent))}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Humidor value</span>
            <span className="kpi-value">{formatMoney(Math.round(data.humidor.value))}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Ready to smoke</span>
            <span className="kpi-value">{data.humidor.ready}</span>
          </div>
        </div>
      </header>

      {data.count === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing to chart yet</p>
          <p className="muted">Log a few smokes and this page fills in on its own.</p>
          <Link href="/log" className="btn btn-primary btn-log">
            Log a smoke
          </Link>
        </div>
      ) : (
        <div className="stats-grid">
          <section className="card stat-card">
            <h2>Score spread</h2>
            <p className="muted stat-sub">How many smokes landed in each score range.</p>
            <ColumnChart
              label="Number of smokes in each score range"
              formatTick={(value) => String(value)}
              items={data.bins.map((bin) => ({
                key: bin.label,
                label: bin.label,
                value: bin.count,
                tip: `${bin.range}: ${plural(bin.count, 'smoke')}`,
              }))}
            />
          </section>

          <section className="card stat-card">
            <h2>Top rated</h2>
            {data.top.length === 0 ? (
              <p className="muted">No scored smokes yet.</p>
            ) : (
              <ol className="top-list">
                {data.top.map((row) => (
                  <li key={row.smoke.id}>
                    <Link href={`/smokes/${row.smoke.id}`} className="top-row">
                      <span className="mini-main">
                        <span className="pick-brand">{row.cigar?.brand}</span>
                        <span className="pick-title">
                          {row.cigar ? cigarTitle(row.cigar) : 'Unknown cigar'}
                        </span>
                        <span className="pick-sub num">
                          {[formatDate(row.smoke.smokedAt), smokeSize(row.smoke, row.cigar)]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <span className="numeral numeral-sm num">{row.score}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card stat-card">
            <h2>Average score by</h2>
            <div className="segmented segmented-4" role="group" aria-label="Group scores by">
              {GROUPS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={group === option.key}
                  onClick={() => setGroup(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {groups.length === 0 ? (
              <p className="muted">
                Nothing to compare yet. A group shows up once it has 2 scored smokes.
              </p>
            ) : (
              <DotPlot
                label={`Average score by ${group}`}
                min={low}
                max={100}
                items={groups.map((entry) => ({
                  label: entry.label,
                  value: entry.average,
                  note: plural(entry.count, 'smoke'),
                }))}
              />
            )}
          </section>

          <section className="card stat-card">
            <h2>Flavors you find most</h2>
            {data.tags.length === 0 ? (
              <p className="muted">No flavor tags yet.</p>
            ) : (
              <BarList
                label="Most common flavor tags"
                items={data.tags.map((entry) => ({
                  key: entry.tag,
                  value: entry.count,
                  label: (
                    <span className="flavor">
                      <span
                        className="flavor-dot"
                        data-family={tagFamily(entry.tag)}
                        aria-hidden="true"
                      />
                      {entry.tag}
                    </span>
                  ),
                }))}
              />
            )}
          </section>

          <section className="card stat-card stat-card-wide">
            <h2>Spend by month</h2>
            <p className="muted stat-sub">
              Humidor purchases plus what you paid for singles, over the last 12 months.
            </p>
            <ColumnChart
              label="Money spent each month"
              dense
              formatTick={(value) => formatMoney(value)}
              items={data.spend.map((month) => ({
                key: month.month,
                label: month.label,
                value: month.total,
                tip: `${month.label}: ${formatMoney(Math.round(month.total))}`,
              }))}
            />
          </section>
        </div>
      )}
    </div>
  )
}
