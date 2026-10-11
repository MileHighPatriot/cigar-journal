import { useRegisterSW } from 'virtual:pwa-register/react'

/** A new version waits here until Reload is tapped. The app never reloads on its own. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="banner update-banner" role="status">
      <p>
        <strong>Update ready.</strong> Reload when you are between entries.
      </p>
      <button
        type="button"
        className="btn btn-quiet"
        onClick={() => void updateServiceWorker(true)}
      >
        Reload
      </button>
    </div>
  )
}
