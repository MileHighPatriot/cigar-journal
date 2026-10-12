import {
  Archive,
  Bookmark,
  BookOpen,
  ChartColumn,
  Columns2,
  Leaf,
  type LucideIcon,
  Plus,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { SavedBadge } from './SavedBadge'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

const journal: NavItem = {
  href: '/',
  label: 'Journal',
  icon: BookOpen,
  match: (path) => path === '/' || path.startsWith('/smokes'),
}
const humidor: NavItem = {
  href: '/humidor',
  label: 'Humidor',
  icon: Archive,
  match: (path) => path.startsWith('/humidor'),
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
  icon: Leaf,
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
  icon: Columns2,
  match: (path) => path.startsWith('/compare'),
}
const settings: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
  match: (path) => path.startsWith('/settings'),
}
/** The same tabs in the same order on every screen size. */
const ITEMS = [journal, cigars, humidor, wishlist, stats, compare, settings]

function TabLink({ item, path }: { item: NavItem; path: string }) {
  const active = item.match(path)
  return (
    <Link href={item.href} className="tab" aria-current={active ? 'page' : undefined}>
      <item.icon size={22} strokeWidth={1.5} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}

/** Phone and tablet: every tab along the bottom, with the Log button floating above it. */
export function TabBar() {
  const [path] = useLocation()
  return (
    <>
      <Link href="/log" className="tab-log" aria-label="Log a smoke">
        <Plus size={28} strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <nav className="tabbar" aria-label="Main">
        {ITEMS.map((item) => (
          <TabLink key={item.href} item={item} path={path} />
        ))}
      </nav>
    </>
  )
}

/** Laptop: left sidebar. */
export function Sidebar() {
  const [path] = useLocation()
  return (
    <nav className="sidebar" aria-label="Main">
      <p className="sidebar-name">
        <img className="sidebar-mark" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        Cigar Journal
      </p>
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
