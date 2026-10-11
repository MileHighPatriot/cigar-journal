import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import {
  addPhoto,
  photosForSmoke,
  restoreRecord,
  saveRecord,
  softDelete,
  useStore,
} from '../data/store'
import type { Photo, PhotoKind } from '../data/types'
import { PhotoDecodeError } from '../photos/pipeline'
import { usePhotoUrl } from '../photos/usePhotoUrl'
import { showToast } from './toast'

export const PHOTO_KINDS: { key: PhotoKind; label: string }[] = [
  { key: 'band', label: 'Band' },
  { key: 'stick', label: 'Stick' },
  { key: 'wrapper', label: 'Wrapper' },
  { key: 'foot', label: 'Foot' },
  { key: 'ash', label: 'Ash' },
  { key: 'setting', label: 'Setting' },
  { key: 'box', label: 'Box or label' },
]

function Thumb({
  photo,
  selected,
  onSelect,
}: {
  photo: Photo
  selected: boolean
  onSelect: () => void
}) {
  const url = usePhotoUrl(photo.id, 'thumb')
  const kind = PHOTO_KINDS.find((k) => k.key === photo.kind)?.label ?? 'Photo'
  return (
    <button
      type="button"
      className="photo-thumb"
      aria-pressed={selected}
      aria-label={`${kind} photo`}
      onClick={onSelect}
    >
      {url && <img src={url} alt="" />}
      <span className="photo-thumb-kind">{kind}</span>
    </button>
  )
}

/** Take photo (rear camera) and Choose photo (library), with the kind picked after capture. */
export function PhotoSection({ smokeId }: { smokeId: string }) {
  const state = useStore()
  const photos = photosForSmoke(state.photos, smokeId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const takeRef = useRef<HTMLInputElement>(null)
  const chooseRef = useRef<HTMLInputElement>(null)
  const selected = photos.find((photo) => photo.id === selectedId)

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      for (const file of files) {
        const photo = await addPhoto(smokeId, file, 'band')
        setSelectedId(photo.id)
      }
    } catch (caught) {
      if (caught instanceof PhotoDecodeError) setError(caught.message)
      else if (caught instanceof DOMException && caught.name === 'QuotaExceededError') {
        setError(
          'Storage is full. Your notes are saved, but this photo was not. Export a backup, then free up space.',
        )
      } else setError('That photo could not be saved. Your notes are safe. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function remove(photo: Photo) {
    void softDelete('photos', photo.id)
    setSelectedId(null)
    showToast({
      message: 'Photo removed',
      actionLabel: 'Undo',
      onAction: () => void restoreRecord('photos', photo.id),
    })
  }

  return (
    <section className="photos">
      <h2>Photos</h2>
      {photos.length > 0 && (
        <div className="photo-row">
          {photos.map((photo) => (
            <Thumb
              key={photo.id}
              photo={photo}
              selected={photo.id === selectedId}
              onSelect={() => setSelectedId(photo.id === selectedId ? null : photo.id)}
            />
          ))}
        </div>
      )}
      {selected && (
        <div className="photo-edit">
          <div className="chip-row" role="group" aria-label="What this photo shows">
            {PHOTO_KINDS.map((kind) => (
              <button
                key={kind.key}
                type="button"
                className="chip"
                aria-pressed={selected.kind === kind.key}
                onClick={() => void saveRecord('photos', { ...selected, kind: kind.key })}
              >
                {kind.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-quiet" onClick={() => remove(selected)}>
            <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
            Remove photo
          </button>
        </div>
      )}
      <div className="photo-buttons">
        <button
          type="button"
          className="btn btn-quiet"
          disabled={busy}
          onClick={() => takeRef.current?.click()}
        >
          <Camera size={20} strokeWidth={1.5} aria-hidden="true" />
          Take photo
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          disabled={busy}
          onClick={() => chooseRef.current?.click()}
        >
          <ImageIcon size={20} strokeWidth={1.5} aria-hidden="true" />
          Choose photo
        </button>
      </div>
      {/* capture="environment" opens the rear camera on iOS. Desktop browsers show a file picker. */}
      <input
        ref={takeRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onFiles}
        aria-label="Take photo"
        tabIndex={-1}
      />
      <input
        ref={chooseRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onFiles}
        aria-label="Choose photo"
        tabIndex={-1}
      />
      {busy && (
        <p className="muted" aria-live="polite">
          Saving photo
        </p>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
