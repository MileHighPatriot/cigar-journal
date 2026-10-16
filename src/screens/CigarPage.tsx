import {
  Archive,
  Armchair,
  Bookmark,
  Check,
  ChevronLeft,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { CigarForm } from '../components/CigarForm'
import { FlavorTags } from '../components/FlavorTags'
import { LevelMeter } from '../components/LevelMeter'
import { LotForm } from '../components/LotForm'
import { LoungeForm } from '../components/LoungeForm'
import { WrapperDot, WrapperSwatch } from '../components/Monogram'
import { ScoreRing } from '../components/ScoreRing'
import { Sparkline } from '../components/Sparkline'
import { showToast } from '../components/toast'
import { WishForm } from '../components/WishForm'
import { restoreRecord, saveRecord, softDelete, startLog, useStore } from '../data/store'
import { priceLabel, wrapperOptions, wrapperText } from '../domain/cigars'
import {
  cigarSubtitle,
  cigarTitle,
  formatDate,
  formatInches,
  formatMinutes,
  formatMoney,
  hostOf,
} from '../domain/format'
import { remaining, smokedCountByLot } from '../domain/humidor'
import { levelLabel, shownScore, verdictFor } from '../domain/scoring'
import { smokeSize } from '../domain/sizes'
import { effectiveTags, normalizeTag } from '../domain/tags'

interface Props {
  id: string
  /** Where the back arrow goes. The cigar list unless opened from the lounge. */
  backHref?: string
}

export function CigarPage({ id, backHref = '/cigars' }: Props) {
  const state = useStore()
  const [, navigate] = useLocation()
  const [editing, setEditing] = useState(false)
  const [stocking, setStocking] = useState(false)
  const [wishing, setWishing] = useState(false)
  const [lounging, setLounging] = useState(false)
  const cigar = state.cigars.get(id)

  const smokes = useMemo(
    () =>
      [...state.smokes.values()]
        .filter((s) => s.cigarId === id && !s.deletedAt && s.status === 'complete')
        .sort((a, b) => (a.smokedAt < b.smokedAt ? 1 : -1)),
    [state.smokes, id],
  )
  const wrappers = useMemo(() => wrapperOptions(state.cigars.values()), [state.cigars])
  const onHand = useMemo(() => {
    const smoked = smokedCountByLot(state.smokes.values())
    return [...state.lots.values()]
      .filter((lot) => lot.cigarId === id && !lot.deletedAt)
      .map((lot) => ({ lot, left: remaining(lot, smoked) }))
      .filter((entry) => entry.left > 0)
  }, [state.lots, state.smokes, id])

  const wished = [...state.wishlist.values()].some(
    (item) => item.cigarId === id && !item.deletedAt && item.status === 'open',
  )

  if (!cigar || cigar.deletedAt) {
    return (
      <div className="detail">
        <p className="muted">This cigar is not in your list.</p>
        <Link href="/cigars" className="btn btn-quiet">
          Back to cigars
        </Link>
      </div>
    )
  }

  const scores = smokes.filter((s) => s.score !== null).map((s) => shownScore(s.score ?? 0))
  const average =
    scores.length > 0 ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length) : null
  const trend = [...scores].reverse()
  const myTags = [...new Set(smokes.flatMap((s) => effectiveTags(s)))].slice(0, 12)
  const sheetTags = [...new Set(cigar.sheetFlavors.map(normalizeTag))]
  const sizes = new Map<string, number>()
  for (const smoke of smokes) {
    const size = smokeSize(smoke, cigar)
    if (size) sizes.set(size, (sizes.get(size) ?? 0) + 1)
  }

  type Row = [label: string, value: string | null]
  const rows = (list: Row[]) => list.filter((row): row is [string, string] => Boolean(row[1]))
  const blend = rows([
    ['Wrapper', wrapperText(cigar) || null],
    ['Binder', cigar.binder],
    ['Filler', cigar.filler],
  ])
  const made = rows([
    ['Made in', cigar.country],
    ['Factory', cigar.factory],
    ['Introduced', cigar.released ? String(cigar.released) : null],
    [
      'Production',
      cigar.production === 'regular'
        ? 'Regular production'
        : cigar.production === 'limited'
          ? 'Limited'
          : cigar.production === 'discontinued'
            ? 'Discontinued'
            : null,
    ],
    ['Price tier', priceLabel(cigar.priceTier) || null],
    ['Your size', cigarSubtitle(cigar) || null],
    ['Shape', cigar.shape],
  ])
  // One link per site is enough: two pages from the same site read as a repeat.
  const sources = cigar.sources.filter(
    (source, index, all) => all.findIndex((other) => hostOf(other) === hostOf(source)) === index,
  )
  const hasProfile = cigar.strength !== null || cigar.body !== null
  const nothingKnown =
    blend.length === 0 &&
    made.length === 0 &&
    !hasProfile &&
    !cigar.about &&
    cigar.sizes.length === 0

  async function log() {
    navigate(await startLog(id))
  }

  function remove() {
    void softDelete('cigars', id)
    navigate('/cigars')
    showToast({
      message: 'Cigar removed',
      actionLabel: 'Undo',
      onAction: () => void restoreRecord('cigars', id),
    })
  }

  return (
    <article className="detail">
      <div className="detail-bar">
        <Link
          href={backHref}
          className="icon-btn detail-back"
          aria-label={backHref === '/lounge' ? 'Back to the lounge' : 'Back to cigars'}
        >
          <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      <header className="detail-head">
        <div>
          <p className="band-brand">{cigar.brand || 'No brand yet'}</p>
          <h1>{cigarTitle(cigar)}</h1>
          <p className="detail-facts">
            <WrapperDot wrapper={cigar.wrapperType} />
            {cigar.strength && <span>{levelLabel(cigar.strength)}</span>}
            {cigar.country && <span>{cigar.country}</span>}
          </p>
        </div>
        {average !== null && (
          <div className="detail-score">
            <ScoreRing shown={average} size={112} stroke={5}>
              <span className="numeral numeral-lg num">{average}</span>
            </ScoreRing>
            <span className="verdict">
              Average of {scores.length} {scores.length === 1 ? 'smoke' : 'smokes'}
            </span>
          </div>
        )}
      </header>

      {cigar.checked ? (
        <p className="checked-line">
          <ShieldCheck size={20} strokeWidth={1.5} aria-hidden="true" />
          Details checked against published sources
        </p>
      ) : (
        !cigar.confirmed && (
          <div className="banner">
            <p>
              <strong>Unconfirmed.</strong> These details have not been checked against a source or
              the cigar in your hand.
            </p>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => void saveRecord('cigars', { ...cigar, confirmed: true })}
            >
              <Check size={20} strokeWidth={1.5} aria-hidden="true" />
              Looks right
            </button>
          </div>
        )
      )}

      <div className="detail-actions detail-actions-top">
        <button type="button" className="btn btn-primary" onClick={() => void log()}>
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
          Log this cigar
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setEditing(true)}>
          <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
          Edit
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setStocking(true)}>
          <Archive size={20} strokeWidth={1.5} aria-hidden="true" />
          Add to humidor
        </button>
        {wished ? (
          <Link href="/wishlist" className="btn btn-quiet">
            <Bookmark size={20} strokeWidth={1.5} aria-hidden="true" />
            On your wishlist
          </Link>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setWishing(true)}>
            <Bookmark size={20} strokeWidth={1.5} aria-hidden="true" />
            Add to wishlist
          </button>
        )}
        <button
          type="button"
          className="btn btn-quiet"
          aria-pressed={cigar.lounge !== null}
          onClick={() => setLounging(true)}
        >
          <Armchair size={20} strokeWidth={1.5} aria-hidden="true" />
          {cigar.lounge ? 'In the lounge' : 'Add to lounge'}
        </button>
      </div>

      {cigar.lounge && (
        <p className="on-hand">
          <Link href={`/lounge/${cigar.id}`} className="ready-line text-link">
            On the lounge list
          </Link>
          {cigar.lounge.price !== null && (
            <span className="num">{formatMoney(cigar.lounge.price)} at the lounge</span>
          )}
          {cigar.lounge.shelf && <span>{cigar.lounge.shelf}</span>}
          {cigar.lounge.note && <span className="muted">{cigar.lounge.note}</span>}
        </p>
      )}

      {onHand.length > 0 && (
        <p className="on-hand">
          <span className="ready-line">In your humidor</span>
          {onHand.map(({ lot, left }) => (
            <Link key={lot.id} href={`/humidor/${lot.id}`} className="text-link num">
              {left} left
            </Link>
          ))}
        </p>
      )}

      {nothingKnown && (
        <section className="detail-section">
          <h2>Details</h2>
          <p className="muted">Nothing filled in yet. Tap Edit to add what you know.</p>
        </section>
      )}

      {cigar.about && (
        <section className="detail-section">
          <h2>About</h2>
          <p>{cigar.about}</p>
        </section>
      )}

      <div className="info-grid">
        {hasProfile && (
          <section className="detail-section">
            <h2>Profile</h2>
            <LevelMeter label="Strength" value={cigar.strength} />
            {/* Few makers give body apart from strength, so it only shows when one does. */}
            {cigar.body !== null && <LevelMeter label="Body" value={cigar.body} />}
          </section>
        )}

        {blend.length > 0 && (
          <section className="detail-section">
            <h2>Blend</h2>
            <dl className="spec">
              {blend.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {label === 'Wrapper' && <WrapperSwatch wrapper={cigar.wrapperType} />}
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {made.length > 0 && (
          <section className="detail-section">
            <h2>Where it is made</h2>
            <dl className="spec">
              {made.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {cigar.sizes.length > 0 && (
          <section className="detail-section">
            <h2>Sizes it comes in</h2>
            <table className="sizes">
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Length</th>
                  <th scope="col">Ring</th>
                </tr>
              </thead>
              <tbody>
                {cigar.sizes.map((size) => (
                  <tr key={`${size.name}-${size.lengthIn}-${size.ringGauge}`}>
                    <th scope="row">{size.name}</th>
                    <td className="num">
                      {size.lengthIn ? `${formatInches(size.lengthIn)} in` : ''}
                    </td>
                    <td className="num">{size.ringGauge ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {cigar.flavors.length > 0 && (
        <section className="detail-section">
          <h2>Tasting notes, as published</h2>
          <FlavorTags tags={cigar.flavors.map(normalizeTag)} className="flavors-boxed" />
        </section>
      )}

      {cigar.researchNote && (
        <section className="detail-section">
          <h2>Good to know</h2>
          <p className="wish-why">{cigar.researchNote}</p>
        </section>
      )}

      {cigar.notes && (
        <section className="detail-section">
          <h2>Your notes</h2>
          <p className="detail-note">{cigar.notes}</p>
        </section>
      )}

      <section className="detail-section">
        <h2>Your smokes</h2>
        {smokes.length === 0 ? (
          <p className="muted">You have not logged this one yet.</p>
        ) : (
          <>
            {trend.length > 1 && (
              <div className="trend">
                <Sparkline
                  values={trend}
                  label={`Your scores for this cigar, oldest to newest: ${trend.join(', ')}`}
                />
                <span className="hero-label">Score trend, oldest to newest</span>
              </div>
            )}
            {sizes.size > 0 && (
              <p className="muted">
                Sizes smoked:{' '}
                {[...sizes].map(([size, n]) => (n > 1 ? `${size} (${n})` : size)).join(', ')}
              </p>
            )}
            <ul className="mini-list">
              {smokes.map((smoke) => {
                const shown = smoke.score === null ? null : shownScore(smoke.score)
                const meta = [
                  formatDate(smoke.smokedAt),
                  smokeSize(smoke, cigar),
                  formatMinutes(smoke.durationMin),
                ].filter(Boolean)
                return (
                  <li key={smoke.id}>
                    <Link href={`/smokes/${smoke.id}`} className="mini-row">
                      <span className="mini-main">
                        <span className="num">{meta.join(' · ')}</span>
                        <FlavorTags tags={effectiveTags(smoke).slice(0, 3)} />
                      </span>
                      {shown === null ? (
                        <span className="muted">No score</span>
                      ) : (
                        <span className="mini-score">
                          <span className="numeral numeral-sm num">{shown}</span>
                          <span className="verdict" data-verdict={verdictFor(shown)}>
                            {verdictFor(shown)}
                          </span>
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      {myTags.length > 0 && (
        <section className="detail-section">
          <h2>Flavors you found</h2>
          <FlavorTags tags={myTags} className="flavors-boxed" />
        </section>
      )}

      {(sheetTags.length > 0 ||
        cigar.sheetPairings.length > 0 ||
        cigar.otherWrapperVersions ||
        cigar.similarCigars) && (
        <section className="detail-section">
          <h2>From the lounge sheet</h2>
          {sheetTags.length > 0 && <FlavorTags tags={sheetTags} className="flavors-boxed" />}
          <dl className="facts">
            {cigar.sheetPairings.length > 0 && (
              <div>
                <dt>Pairings</dt>
                <dd>{cigar.sheetPairings.join(', ')}</dd>
              </div>
            )}
            {cigar.otherWrapperVersions && (
              <div>
                <dt>Other wrapper versions</dt>
                <dd>{cigar.otherWrapperVersions}</dd>
              </div>
            )}
            {cigar.similarCigars && (
              <div>
                <dt>If they like this, suggest</dt>
                <dd>{cigar.similarCigars}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {cigar.sources.length > 0 && (
        <section className="detail-section">
          <h2>Sources</h2>
          <ul className="sources">
            {sources.map((source) => (
              <li key={source}>
                <a href={source} target="_blank" rel="noreferrer" className="text-link">
                  {hostOf(source)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {smokes.length === 0 && (
        <div className="detail-actions">
          <button type="button" className="btn btn-quiet" onClick={remove}>
            <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
            Remove from list
          </button>
        </div>
      )}

      <LotForm
        open={stocking}
        lot={null}
        cigarId={id}
        onClose={() => setStocking(false)}
        onSaved={() => showToast({ message: 'Added to your humidor' })}
      />

      <LoungeForm
        open={lounging}
        cigarId={id}
        onClose={() => setLounging(false)}
        onSaved={() =>
          showToast({ message: cigar.lounge ? 'Lounge note saved' : 'Added to the lounge list' })
        }
      />

      <WishForm
        open={wishing}
        item={null}
        cigarId={id}
        onClose={() => setWishing(false)}
        onSaved={() => showToast({ message: 'Added to your wishlist' })}
      />

      <CigarForm
        open={editing}
        cigar={cigar}
        wrappers={wrappers}
        onClose={() => setEditing(false)}
        onSaved={() => showToast({ message: 'Cigar saved' })}
      />
    </article>
  )
}
