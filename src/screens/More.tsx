import {
  Bookmark,
  ChartColumn,
  ChevronRight,
  type LucideIcon,
  Settings,
  Wrench,
} from 'lucide-react'
import { Link } from 'wouter'

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/stats', label: 'Stats', icon: ChartColumn },
  { href: '/wishlist', label: 'Wishlist', icon: Bookmark },
  { href: '/settings', label: 'Settings and backup', icon: Settings },
]

export function More() {
  const links = import.meta.env.DEV
    ? [...LINKS, { href: '/dev', label: 'Dev tools', icon: Wrench }]
    : LINKS
  return (
    <div className="page">
      <header className="page-head">
        <h1>More</h1>
      </header>
      <ul className="link-list card">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="link-row">
              <link.icon size={20} strokeWidth={1.5} aria-hidden="true" />
              <span>{link.label}</span>
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
