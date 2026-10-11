import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { HeroArt } from '../components/HeroArt'
import { LotForm } from '../components/LotForm'
import { Monogram, WrapperDot } from '../components/Monogram'
import { showToast } from '../components/toast'
import { WishForm } from '../components/WishForm'
import { restoreRecord, saveRecord, softDelete, useStore } from '../data/store'
import type { Cigar, WishlistItem } from '../data/types'
import { priceLabel } from '../domain/cigars'
import { cigarTitle, formatDate } from '../domain/format'
import { levelLabel } from '../domain/scoring'

interface Row {
  item: WishlistItem
  cigar: Cigar | undefined
}

export function Wishlist() {
  const state = useStore()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<WishlistItem | null>(null)
  const [buying, setBuying] = useState<WishlistItem | null>(null)

  const { open, bought } = useMemo(() => {
    const rows: Row[] = [...state.wishlist.values()]
      .filter((item) => !item.deletedAt)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((item) => ({ item, cigar: state.cigars.get(item.cigarId) }))
    return {
      open: rows.filter((row) => row.item.status === 'open'),
      bought: rows.filter((row) => row.item.status === 'bought'),
    }
  }, [state.wishlist, state.cigars])

  function remove(item: WishlistItem) {
    void softDelete('wishlist', item.id)
    showToast({
      message: 'Removed from your wishlist',
      actionLabel: 'Undo',
      onAction: () => void restoreRecord('wishlist', item.id),
    })
  }

  const card = ({ item, cigar }: Row, index: number) => {
    const lot = item.boughtLotId ? state.lots.get(item.boughtLotId) : undefined
    const facts = [levelLabel(cigar?.strength ?? null), priceLabel(cigar?.priceTier ?? null)]
    return (
      <li
        key={item.id}
        className="card-item"
        style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      >
        <article className="wish-card card">
          {/* The whole top of the card opens the cigar's page: a full-size tap target. */}
          <Link href={cigar ? `/cigars/${cigar.id}` : '/cigars'} className="lot-card-top wish-top">
            <Monogram brand={cigar?.brand || cigar?.line || '?'} />
            <span className="pick-main">
              <span className="pick-brand">{cigar?.brand || 'Unknown brand'}</span>
              <span className="pick-title">{cigar ? cigarTitle(cigar) : 'Unknown cigar'}</span>
              <span className="pick-sub">
                <WrapperDot wrapper={cigar?.wrapperType ?? null} />
                {facts.filter(Boolean).map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </span>
            </span>
          </Link>
          {item.why && <p className="wish-why">{item.why}</p>}
          <p className="lot-meta num">
            {item.heardFrom && <span>Heard from: {item.heardFrom}</span>}
            <span>Added {formatDate(item.createdAt)}</span>
          </p>
          <div className="wish-actions">
            {item.status === 'open' ? (
              <button type="button" className="btn btn-primary" onClick={() => setBuying(item)}>
                <Check size={20} strokeWidth={1.5} aria-hidden="true" />
                Bought it
              </button>
            ) : lot && !lot.deletedAt ? (
              <Link href={`/humidor/${lot.id}`} className="btn btn-quiet">
                See it in the humidor
              </Link>
            ) : (
              <span className="ready-line">Bought</span>
            )}
            <span className="wish-icons">
              {item.status === 'open' && (
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Edit ${cigar ? cigarTitle(cigar) : 'wish'}`}
                  onClick={() => setEditing(item)}
                >
                  <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="icon-btn"
                aria-label={`Remove ${cigar ? cigarTitle(cigar) : 'wish'}`}
                onClick={() => remove(item)}
              >
                <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </span>
          </div>
        </article>
      </li>
    )
  }

  return (
    <div className="page">
      <header className="hero">
        <HeroArt art="leaf" />
        <div className="hero-top">
          <h1>Wishlist</h1>
          <button type="button" className="btn btn-quiet" onClick={() => setAdding(true)}>
            <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
            Add
          </button>
        </div>
        <dl className="hero-facts">
          <div>
            <dt>Want to try</dt>
            <dd className="num">{open.length}</dd>
          </div>
          <div>
            <dt>Bought</dt>
            <dd className="num">{bought.length}</dd>
          </div>
        </dl>
      </header>

      {open.length === 0 && bought.length === 0 && (
        <div className="empty">
          <svg className="empty-art" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" />
            <circle cx="60" cy="60" r="36" />
            <circle cx="60" cy="60" r="20" />
          </svg>
          <p className="empty-title">Nothing on your wishlist</p>
          <p className="muted">When a guest or a review sells you on one, note it here.</p>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            Add to wishlist
          </button>
        </div>
      )}

      <ul className="card-list wish-list">
        {open.map((row, index) => card(row, index))}
        {bought.length > 0 && (
          <li className="month-head">
            <span>Bought ({bought.length})</span>
          </li>
        )}
        {bought.map((row, index) => card(row, open.length + index))}
      </ul>

      <WishForm
        open={adding}
        item={null}
        onClose={() => setAdding(false)}
        onSaved={() => showToast({ message: 'Added to your wishlist' })}
      />
      <WishForm
        open={editing !== null}
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => showToast({ message: 'Wish saved' })}
      />
      {/* "Bought it" opens the new-lot form with the cigar filled in. Saving moves it to the humidor. */}
      <LotForm
        open={buying !== null}
        lot={null}
        cigarId={buying?.cigarId}
        onClose={() => setBuying(null)}
        onSaved={(lot) => {
          if (buying) {
            void saveRecord('wishlist', { ...buying, status: 'bought', boughtLotId: lot.id })
          }
          showToast({ message: 'Moved to your humidor' })
        }}
      />
    </div>
  )
}
