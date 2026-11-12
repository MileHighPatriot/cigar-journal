import {
  Armchair,
  Bookmark,
  BookOpen,
  ChartColumn,
  ChevronRight,
  Ellipsis,
  Plus,
  Settings,
  ThumbsUp,
} from 'lucide-react'
import { type ComponentType, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { CigarIcon, CompareIcon, HumidorIcon, MarkIcon } from './icons'
import { LabelArt } from './LabelArt'
import { Logo } from './Logo'
import { SavedBadge } from './SavedBadge'
import { Sheet } from './Sheet'

interface NavItem {
  href: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  match: (path: string) => boolean
}

const home: NavItem = {
  href: '/',
  label: 'Home',
  icon: MarkIcon,
  match: (path) => path === '/',
}
const journal: NavItem = {
  href: '/journal',
  label: 'Journal',
  icon: BookOpen,
  match: (path) => path.startsWith('/journal') || path.startsWith('/smokes'),
}
const humidor: NavItem = {
  href: '/humidor',
  label: 'Humidor',
  icon: HumidorIcon,
  match: (path) => path.startsWith('/humidor'),
}
const lounge: NavItem = {
  href: '/lounge',
  label: 'Lounge',
  icon: Armchair,
  match: (path) => path.startsWith('/lounge'),
}
const picks: NavItem = {
  href: '/picks',
  label: 'Picks',
  icon: ThumbsUp,
  match: (path) => path.startsWith('/picks'),
}
const stats: NavItem = {
  href: '/stats',
  label: 'Stats',
  icon: ChartColumn,
  match: (path) => path.startsWith('/stats'),
}
const cigars: NavItem = {
  href: '/cigars',
  label: 'Cigars',
  icon: CigarIcon,
  match: (path) => path.startsWith('/cigars'),
}
const wishlist: NavItem = {
  href: '/wishlist',
  label: 'Wishlist',
  icon: Bookmark,
  match: (path) => path.startsWith('/wishlist'),
}
const compare: NavItem = {
  href: '/compare',
  label: 'Compare',
  icon: CompareIcon,
  match: (path) => path.startsWith('/compare'),
}
const settings: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
  match: (path) => path.startsWith('/settings'),
}
/** The laptop sidebar lists every tab. */
const ITEMS = [home, journal, cigars, humidor, lounge, picks, wishlist, stats, compare, settings]
/** A phone has room for four tabs and the Log button. The rest sit one tap away under More. */
const BAR_LEFT = [home, journal]
const BAR_RIGHT = [cigars, lounge]
const MORE = [picks, humidor, wishlist, stats, compare, settings]

function TabLink({ item, path }: { item: NavItem; path: string }) {
  const active = item.match(path)
  return (
    <Link href={item.href} className="tab" aria-current={active ? 'page' : undefined}>
      <item.icon size={24} strokeWidth={1.5} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}

/** Phone and tablet: four tabs, Log in the middle, and More for the other six. */
export function TabBar() {
  const [path] = useLocation()
  const [more, setMore] = useState(false)
  const inMore = MORE.some((item) => item.match(path))

  return (
    <>
      <nav className="tabbar" aria-label="Main">
        {BAR_LEFT.map((item) => (
          <TabLink key={item.href} item={item} path={path} />
        ))}
        <Link href="/log" className="tab tab-log" aria-label="Log a smoke">
          <span className="tab-log-mark">
            <Plus size={26} strokeWidth={1.75} aria-hidden="true" />
          </span>
        </Link>
        {BAR_RIGHT.map((item) => (
          <TabLink key={item.href} item={item} path={path} />
        ))}
        <button
          type="button"
          className="tab"
          aria-haspopup="dialog"
          aria-expanded={more}
          data-current={inMore ? 'true' : undefined}
          onClick={() => setMore(true)}
        >
          <Ellipsis size={24} strokeWidth={1.5} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
      <Sheet open={more} title="More" onClose={() => setMore(false)}>
        <ul className="more-list">
          {MORE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="more-row"
                aria-current={item.match(path) ? 'page' : undefined}
                onClick={() => setMore(false)}
              >
                <item.icon size={24} strokeWidth={1.5} aria-hidden="true" />
                <span>{item.label}</span>
                <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}

/** Laptop: left sidebar. */
export function Sidebar() {
  const [path] = useLocation()
  return (
    <nav className="sidebar" aria-label="Main">
      <Link href="/" className="sidebar-brand">
        <Logo className="sidebar-mark" />
        <span className="sidebar-name">Cigar Journal</span>
      </Link>
      <LabelArt band scene="villa" />
      <Link href="/log" className="btn btn-primary btn-block">
        <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        New log
      </Link>
      <ul className="sidebar-list">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="sidebar-link"
              aria-current={item.match(path) ? 'page' : undefined}
            >
              <item.icon size={20} strokeWidth={1.5} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-foot">
        <SavedBadge />
      </div>
    </nav>
  )
}
