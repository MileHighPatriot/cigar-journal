import { Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getRepo } from '../data/store'
import { isIos, isStandalone } from '../pwa/storage'

/**
 * One-time hint in an iOS Safari tab. A tab and the Home Screen app do not share data,
 * so the advice is to install first, then start logging.
 */
export function InstallHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIos() || isStandalone()) return
    getRepo()
      .getMeta('installHintDismissed')
      .then((dismissed) => setShow(!dismissed))
      .catch(() => {})
  }, [])

  if (!show) return null

  return (
    <div className="banner install-hint">
      <Share size={20} strokeWidth={1.5} aria-hidden="true" />
      <p>
        <strong>Add this to your Home Screen first.</strong> Tap Share, then Add to Home Screen.
        Entries saved here in Safari do not move to the Home Screen app.
      </p>
      <button
        type="button"
        className="icon-btn"
        aria-label="Dismiss"
        onClick={() => {
          setShow(false)
          void getRepo().setMeta('installHintDismissed', true)
        }}
      >
        <X size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  )
}
