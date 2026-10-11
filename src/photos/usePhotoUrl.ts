import { useEffect, useState } from 'react'
import { getRepo } from '../data/store'

/**
 * Object URL for a stored photo. Pass enabled=false to hold off until a card nears the
 * viewport. The URL is revoked when the component unmounts.
 */
export function usePhotoUrl(
  photoId: string | null | undefined,
  size: 'full' | 'thumb',
  enabled = true,
): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!photoId || !enabled) return
    let cancelled = false
    let created: string | null = null
    getRepo()
      .getPhotoBytes(size, photoId)
      .then((row) => {
        if (cancelled || !row) return
        created = URL.createObjectURL(new Blob([row.bytes], { type: row.mime }))
        setUrl(created)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
      setUrl(null)
    }
  }, [photoId, size, enabled])

  return url
}
