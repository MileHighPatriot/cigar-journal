import { ChevronDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { LabelArt } from '../components/LabelArt'
import { Monogram } from '../components/Monogram'
import { useStore } from '../data/store'
import { cigarTitle, fold, hostOf } from '../domain/format'
import {
  type BrandEntry,
  type BrandFilter,
  type Made,
  type MakerEntry,
  makerIndex,
  placeOf,
  placesOf,
  searchBrands,
  searchMakers,
} from '../domain/makers'
import { JOBS, STORIES, type Story } from '../domain/makersData'

type View = 'stories' | 'factories' | 'brands'

const FILTERS: { key: BrandFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'split', label: 'Two or more makers' },
  { key: 'contract', label: 'Made by someone else' },
]

/** Lists this long open a screenful at a time. */
const PAGE = 60

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Who really makes each cigar: the factories, the brands rolled in them, and who owns what. */
export function Makers() {
  const state = useStore()
  const [view, setView] = useState<View>('stories')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<BrandFilter>('all')
  const [shown, setShown] = useState(PAGE)
  const index = useMemo(() => makerIndex(state.cigars.values()), [state.cigars])
  const makers = useMemo(() => searchMakers(index.makers, query), [index, query])
  const brands = useMemo(() => {
    const found = searchBrands(index.brands, query, filter)
    // A brand typed or tapped by name comes first, ahead of the brands its factory also rolls.
    const exact = fold(query).trim()
    return exact
      ? [...found].sort((a, b) => Number(fold(b.brand) === exact) - Number(fold(a.brand) === exact))
      : found
  }, [index, query, filter])
  const split = useMemo(() => index.brands.filter((brand) => brand.makerCount > 1).length, [index])

  const show = (next: View, text = '') => {
    setView(next)
    setQuery(text)
    setFilter('all')
    setShown(PAGE)
    window.scrollTo(0, 0)
  }
  const openBrand = (brand: string) => show('brands', brand)

  return (
    <div className="page">
      <header className="hero">
        <LabelArt compact scene="salon" />
        <div className="hero-top">
          <h1>Makers</h1>
        </div>
        <dl className="hero-facts">
          <div>
            <dt>Factories</dt>
            <dd className="num">{index.factoryCount}</dd>
          </div>
          <div>
            <dt>Brands</dt>
            <dd className="num">{index.brands.length}</dd>
          </div>
          <div>
            <dt>Split brands</dt>
            <dd className="num">{split}</dd>
          </div>
        </dl>
      </header>

      <div className="filters">
        <div className="segmented segmented-3" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'stories'} onClick={() => show('stories')}>
            The story
          </button>
          <button
            type="button"
            aria-pressed={view === 'factories'}
            onClick={() => show('factories')}
          >
            Factories
          </button>
          <button type="button" aria-pressed={view === 'brands'} onClick={() => show('brands')}>
            Brands
          </button>
        </div>
        {view !== 'stories' && (
          <div className="search">
            <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            <label className="sr-only" htmlFor="makers-search">
              Search makers and brands
            </label>
            <input
              id="makers-search"
              type="search"
              className="input"
              placeholder="Search brand, factory, owner, town"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setShown(PAGE)
              }}
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="search"
            />
          </div>
        )}
        {view === 'brands' && (
          <div className="chip-row" role="group" aria-label="Which brands">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="chip"
                aria-pressed={filter === item.key}
                onClick={() => {
                  setFilter(item.key)
                  setShown(PAGE)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'stories' && <Stories index={index.brands} onBrand={openBrand} />}

      {view === 'factories' && (
        <>
          <p className="muted picks-tip">
            Each maker, its factories, and every brand rolled there. Its own brands come first. Tap
            a brand to see where else it is made.
          </p>
          <ul className="lounge-list">
            {makers.slice(0, shown).map((entry) => (
              <MakerItem
                key={entry.maker.key}
                entry={entry}
                open={makers.length === 1}
                onBrand={openBrand}
              />
            ))}
          </ul>
          <More shown={shown} total={makers.length} onMore={() => setShown(shown + PAGE)} />
          {makers.length === 0 && <p className="muted picks-foot">No maker matches that.</p>}
        </>
      )}

      {view === 'brands' && (
        <>
          <p className="muted picks-tip">
            {count(brands.length, 'brand', 'brands')}. Each one shows who owns the name and who
            rolls it.
          </p>
          <ul className="lounge-list">
            {brands.slice(0, shown).map((entry) => (
              <BrandItem
                key={entry.brand}
                entry={entry}
                open={brands.length === 1 || fold(entry.brand) === fold(query).trim()}
              />
            ))}
          </ul>
          <More shown={shown} total={brands.length} onMore={() => setShown(shown + PAGE)} />
          {brands.length === 0 && <p className="muted picks-foot">No brand matches that.</p>}
        </>
      )}

      <p className="muted picks-foot">
        Factories come from the cigars on your list. Owners, renames, and the stories were checked
        against trade press and the makers' own pages on 2026-11-24. A blank means no source was
        found.
      </p>
    </div>
  )
}

function More({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  if (shown >= total) return null
  return (
    <button type="button" className="btn btn-quiet btn-block makers-next" onClick={onMore}>
      Show more ({total - shown} left)
    </button>
  )
}

function Sources({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null
  return (
    <ul className="sources">
      {urls.map((url) => (
        <li key={url}>
          <a href={url} target="_blank" rel="noreferrer" className="text-link">
            {hostOf(url)}
          </a>
        </li>
      ))}
    </ul>
  )
}

function Stories({ index, onBrand }: { index: BrandEntry[]; onBrand: (brand: string) => void }) {
  const listed = useMemo(() => new Set(index.map((entry) => entry.brand)), [index])
  const fromVideo = STORIES.filter((story) => story.from === 'video')
  const more = STORIES.filter((story) => story.from === 'more')
  return (
    <div className="stories">
      <section className="card story">
        <h2>Three different jobs</h2>
        <p>
          The name on the band is not always the company that rolled the cigar. Keep these three
          apart and most of the business makes sense.
        </p>
        <dl className="jobs">
          {JOBS.map((job) => (
            <div key={job.title}>
              <dt>{job.title}</dt>
              <dd>{job.text}</dd>
            </div>
          ))}
        </dl>
      </section>
      {fromVideo.map((story) => (
        <StoryCard key={story.key} story={story} listed={listed} onBrand={onBrand} />
      ))}
      {more.length > 0 && <h2 className="stories-head">More like these</h2>}
      {more.map((story) => (
        <StoryCard key={story.key} story={story} listed={listed} onBrand={onBrand} />
      ))}
    </div>
  )
}

function StoryCard({
  story,
  listed,
  onBrand,
}: {
  story: Story
  listed: Set<string>
  onBrand: (brand: string) => void
}) {
  const brands = story.brands.filter((brand) => listed.has(brand))
  return (
    <article className="card story">
      <h2>{story.title}</h2>
      {story.body.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {brands.length > 0 && (
        <div className="chip-row">
          {brands.map((brand) => (
            <button key={brand} type="button" className="chip" onClick={() => onBrand(brand)}>
              {brand}
            </button>
          ))}
        </div>
      )}
      <Sources urls={story.sources} />
    </article>
  )
}

function MakerItem({
  entry,
  open: startOpen,
  onBrand,
}: {
  entry: MakerEntry
  open: boolean
  onBrand: (brand: string) => void
}) {
  const [toggled, setToggled] = useState<boolean | null>(null)
  const open = toggled ?? startOpen
  const { maker } = entry
  const places = placesOf(maker)
  return (
    <li className="lounge-item">
      <button
        type="button"
        className="lounge-row makers-row"
        aria-expanded={open}
        onClick={() => setToggled(!open)}
      >
        <Monogram brand={maker.name} />
        <span className="pick-main">
          <span className="pick-title">{maker.name}</span>
          {places && <span className="pick-sub">{places}</span>}
          <span className="lounge-gap">
            {count(entry.brandCount, 'brand', 'brands')}
            {entry.guestCount > 0 && `, ${entry.guestCount} made for other companies`}
            {entry.factories.length > 1 && `, ${entry.factories.length} factories`}
          </span>
        </span>
        <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="lounge-more makers-more">
          {maker.owner && (
            <p className="lounge-more-line">
              <span className="makers-label">Who runs it</span> {maker.owner}
            </p>
          )}
          {entry.factories.map(({ factory, brands }) => {
            const own = brands.filter((brand) => brand.house === true)
            const guests = brands.filter((brand) => brand.house !== true)
            return (
              <section key={factory.key} className="makers-factory">
                <h3>{factory.name}</h3>
                {placeOf(factory) && <p className="muted">{placeOf(factory)}</p>}
                {factory.was && <p className="muted">{factory.was}</p>}
                {factory.note && <p>{factory.note}</p>}
                <BrandChips label="Its own" brands={own} onBrand={onBrand} />
                <BrandChips
                  label={entry.known ? 'Made for others' : 'Rolled here'}
                  brands={guests}
                  onBrand={onBrand}
                />
                <Sources urls={factory.sources} />
              </section>
            )
          })}
        </div>
      )}
    </li>
  )
}

function BrandChips({
  label,
  brands,
  onBrand,
}: {
  label: string
  brands: Made[]
  onBrand: (brand: string) => void
}) {
  if (brands.length === 0) return null
  return (
    <div className="makers-brands">
      <span className="makers-label">{label}</span>
      <div className="chip-row">
        {brands.map((item) => (
          <button
            key={item.brand}
            type="button"
            className="chip"
            onClick={() => onBrand(item.brand)}
          >
            {item.brand}
            {item.cigars.length > 0 && <span className="num makers-n">{item.cigars.length}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/** "AJ Fernandez, Plasencia family": each maker once, in the order of how much they roll. */
function rolledBy(entry: BrandEntry): string {
  return [...new Set(entry.made.map((item) => item.maker.name))].join(', ')
}

function BrandItem({ entry, open: startOpen }: { entry: BrandEntry; open: boolean }) {
  const [toggled, setToggled] = useState<boolean | null>(null)
  const open = toggled ?? startOpen
  const { owner } = entry
  return (
    <li className="lounge-item">
      <button
        type="button"
        className="lounge-row makers-row"
        aria-expanded={open}
        onClick={() => setToggled(!open)}
      >
        <Monogram brand={entry.brand} />
        <span className="pick-main">
          <span className="pick-title">{entry.brand}</span>
          {owner?.owner && <span className="pick-sub">Owned by {owner.owner}</span>}
          <span className="lounge-gap">Rolled by {rolledBy(entry)}</span>
        </span>
        <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="lounge-more makers-more">
          {owner?.people && (
            <p className="lounge-more-line">
              <span className="makers-label">Who</span> {owner.people}
            </p>
          )}
          {owner?.distributor && (
            <p className="lounge-more-line">
              <span className="makers-label">Sold in the US by</span> {owner.distributor}
            </p>
          )}
          {owner?.note && <p className="lounge-more-line">{owner.note}</p>}
          {entry.made.map((item) => (
            <section key={item.factory.key} className="makers-factory">
              <h3>{item.factory.name}</h3>
              <p className="muted">
                {[
                  item.maker.name !== item.factory.name ? item.maker.name : null,
                  placeOf(item.factory),
                  item.house === true ? 'their own factory' : null,
                  item.house === false ? 'made for them' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {item.cigars.length > 0 && (
                <ul className="makers-lines">
                  {item.cigars.map((cigar) => (
                    <li key={cigar.id}>
                      <Link href={`/cigars/${cigar.id}`} className="text-link">
                        {cigarTitle(cigar)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {item.extras.map((extra) => (
                <div key={`${extra.lines}${extra.since ?? ''}`} className="makers-extra">
                  <p>
                    <strong>{extra.lines}</strong>
                    {extra.since && !extra.until && ` · since ${extra.since}`}
                    {extra.since && extra.until && ` · ${extra.since} to ${extra.until}`}
                    {!extra.since && extra.until && ` · until ${extra.until}`}
                  </p>
                  {extra.note && <p className="muted">{extra.note}</p>}
                  <Sources urls={extra.sources} />
                </div>
              ))}
            </section>
          ))}
          {entry.moves.length > 0 && (
            <section className="makers-factory">
              <h3>Changed makers</h3>
              {entry.moves.map((move) => (
                <div key={`${move.from}${move.to}${move.year ?? ''}`} className="makers-extra">
                  <p>
                    {move.from} to {move.to}
                    {move.year ? ` · ${move.year}` : ''}
                  </p>
                  {move.note && <p className="muted">{move.note}</p>}
                  <Sources urls={move.sources} />
                </div>
              ))}
            </section>
          )}
          {owner && <Sources urls={owner.sources} />}
        </div>
      )}
    </li>
  )
}
