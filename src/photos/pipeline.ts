export const FULL_EDGE = 1600
export const THUMB_EDGE = 400

export interface ProcessedPhoto {
  full: ArrayBuffer
  thumb: ArrayBuffer
  width: number
  height: number
}

export class PhotoDecodeError extends Error {
  constructor() {
    super(
      "This photo format can't be read in this browser. Save it as a JPEG first, or add it from your phone.",
    )
    this.name = 'PhotoDecodeError'
  }
}

function fitWithin(width: number, height: number, edge: number) {
  // Never upscale.
  const scale = Math.min(1, edge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new PhotoDecodeError())
    image.src = url
  })
}

function encode(
  source: CanvasImageSource,
  size: { width: number; height: number },
  quality: number,
): Promise<{ bytes: ArrayBuffer; canvas: HTMLCanvasElement }> {
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new PhotoDecodeError()
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, size.width, size.height)
  return new Promise((resolve, reject) => {
    // Canvas output carries pixels only: no EXIF, so no location data.
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new PhotoDecodeError())
        blob.arrayBuffer().then((bytes) => resolve({ bytes, canvas }), reject)
      },
      'image/jpeg',
      quality,
    )
  })
}

function free(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}

/**
 * Shrinks a photo to 1600 px on the long edge plus a 400 px thumbnail, both JPEG.
 * The browser applies EXIF orientation while decoding. Never rotate by hand as well,
 * or the photo turns twice.
 */
export async function processPhoto(file: Blob): Promise<ProcessedPhoto> {
  const url = URL.createObjectURL(file)
  let bitmap: ImageBitmap | null = null
  try {
    // Loading the element reads the size without holding a full-size bitmap.
    const image = await loadImage(url)
    if (!image.naturalWidth || !image.naturalHeight) throw new PhotoDecodeError()
    const target = fitWithin(image.naturalWidth, image.naturalHeight, FULL_EDGE)
    try {
      // Decode straight to the small size so a 48 MP frame is never held in memory.
      // Only the width is given, so the browser keeps the proportions.
      bitmap = await createImageBitmap(file, {
        imageOrientation: 'from-image',
        resizeWidth: target.width,
        resizeQuality: 'high',
      })
    } catch {
      bitmap = null
    }
    const source = bitmap ?? image
    const fullSize = bitmap ? fitWithin(bitmap.width, bitmap.height, FULL_EDGE) : target
    const full = await encode(source, fullSize, 0.8)
    // The thumbnail comes from the already-shrunk canvas.
    const thumb = await encode(
      full.canvas,
      fitWithin(fullSize.width, fullSize.height, THUMB_EDGE),
      0.7,
    )
    free(full.canvas)
    free(thumb.canvas)
    return { full: full.bytes, thumb: thumb.bytes, ...fullSize }
  } finally {
    bitmap?.close()
    URL.revokeObjectURL(url)
  }
}
