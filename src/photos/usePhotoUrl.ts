import { useEffect, useRef, useState } from 'react'
import { getRepo, usePhotoBytesVersion } from '../data/store'

/**
 * Object URL for a stored photo. Pass enabled=false to hold off until a card nears the
 * viewport. The URL is revoked when the component unmounts. A photo whose image has not
 * reached this device yet is looked for again when sync brings photos down.
 */
export function usePhotoUrl(
  photoId: string | null | undefined,
  size: 'full' | 'thumb',
  enabled = true,
): string | null {
  const [url, setUrl] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const missing = useRef(false)
  const arrived = usePhotoBytesVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: arrived is the signal to look again
  useEffect(() => {
    if (missing.current) setAttempt((n) => n + 1)
  }, [arrived])

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt asks for another look
  useEffect(() => {
    if (!photoId || !enabled) return
    let cancelled = false
    let created: string | null = null
    getRepo()
      .getPhotoBytes(size, photoId)
      .then((row) => {
        if (cancelled) return
        missing.current = !row
        if (!row) return
        created = URL.createObjectURL(new Blob([row.bytes], { type: row.mime }))
        setUrl(created)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
      setUrl(null)
    }
  }, [photoId, size, enabled, attempt])

  return url
}
