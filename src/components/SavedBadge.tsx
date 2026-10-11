import { Check, CircleAlert } from 'lucide-react'
import { useStore } from '../data/store'

/** Shows "Saved" only after the write has reached disk. Errors stay on screen. */
export function SavedBadge() {
  const { save } = useStore()
  if (save.status === 'idle') return <span className="saved-badge" aria-live="polite" />
  if (save.status === 'error') {
    return (
      <span className="saved-badge saved-badge-error" role="alert">
        <CircleAlert size={16} strokeWidth={1.5} aria-hidden="true" />
        {save.message ?? 'Not saved'}
      </span>
    )
  }
  return (
    <span className="saved-badge" aria-live="polite">
      {save.status === 'saved' ? (
        <>
          <Check size={16} strokeWidth={1.5} aria-hidden="true" />
          Saved
        </>
      ) : (
        'Saving'
      )}
    </span>
  )
}
