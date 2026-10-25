import type { ReactNode } from 'react'
import { LabelArt } from './LabelArt'
import { SavedBadge } from './SavedBadge'

interface Props {
  /** Back or close button. */
  lead: ReactNode
  title: ReactNode
  children: ReactNode
  /** Sticky bottom bar: Next, Save. Stays in the bottom half within thumb reach. */
  actions: ReactNode
}

export function FlowLayout({ lead, title, children, actions }: Props) {
  return (
    <div className="flow">
      <header className="flow-head">
        {lead}
        <div className="flow-title">{title}</div>
        <SavedBadge />
      </header>
      <div className="flow-body">
        <LabelArt compact scene="cigar" />
        {children}
      </div>
      <div className="actionbar">{actions}</div>
    </div>
  )
}
