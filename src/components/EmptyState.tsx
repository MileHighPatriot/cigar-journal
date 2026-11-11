import type { ComponentType, ReactNode } from 'react'

interface Props {
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  /** One or two plain sentences. */
  children?: ReactNode
  /** The one thing to do next. */
  action?: ReactNode
  /** Inside a section, where it sits in a dashed box rather than filling the page. */
  boxed?: boolean
}

/** What a list shows when it has nothing in it yet: what goes here, and how to start. */
export function EmptyState({ icon: Icon, title, children, action, boxed }: Props) {
  return (
    <div className={boxed ? 'empty empty-boxed' : 'empty'}>
      {Icon && (
        <span className="empty-mark" aria-hidden="true">
          <Icon size={28} strokeWidth={1.5} />
        </span>
      )}
      <p className="empty-title">{title}</p>
      {children && <p className="muted empty-text">{children}</p>}
      {action}
    </div>
  )
}
