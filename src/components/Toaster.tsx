import { dismissToast, useToast } from './toast'

export function Toaster() {
  const toast = useToast()
  return (
    <div className="toaster" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.message}</span>
          {toast.onAction && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                toast.onAction?.()
                dismissToast()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
