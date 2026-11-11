import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from './hooks'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/** How long the sheet takes to slide away. Matches .sheet.is-closing in the stylesheet. */
const CLOSE_MS = 160

/** Bottom sheet on phone, centered panel on laptop. Esc and a tap outside both close it. */
export function Sheet({ open, title, onClose, children, footer }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  // What the sheet last showed, so it still has its content while it slides away.
  const last = useRef({ title, children, footer })
  if (open) last.current = { title, children, footer }

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      setClosing(false)
      if (!dialog.open) dialog.showModal()
      return
    }
    if (!dialog.open) return
    if (prefersReducedMotion()) {
      dialog.close()
      return
    }
    setClosing(true)
    const timer = setTimeout(() => {
      setClosing(false)
      if (dialog.open) dialog.close()
    }, CLOSE_MS)
    return () => clearTimeout(timer)
  }, [open])

  const shown = open ? { title, children, footer } : last.current

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the dialog closes on Esc natively; the click is only the backdrop
    <dialog
      ref={ref}
      className={closing ? 'sheet is-closing' : 'sheet'}
      aria-labelledby={titleId}
      onClose={() => {
        if (open) onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      {(open || closing) && (
        <div className="sheet-panel">
          <div className="sheet-head">
            <h2 id={titleId}>{shown.title}</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
              <X size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <div className="sheet-body">{shown.children}</div>
          {shown.footer && <div className="sheet-foot">{shown.footer}</div>}
        </div>
      )}
    </dialog>
  )
}
