import { Unzip, UnzipInflate, Zip, ZipDeflate, ZipPassThrough } from 'fflate'

/** Builds a zip in pieces so a big backup never sits in memory twice. */
export class ZipWriter {
  private chunks: Uint8Array[] = []
  private zip: Zip
  private finished: Promise<Blob>

  constructor() {
    let resolve: (blob: Blob) => void = () => {}
    let reject: (error: unknown) => void = () => {}
    this.finished = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    this.zip = new Zip((error, chunk, final) => {
      if (error) return reject(error)
      this.chunks.push(chunk)
      if (final) resolve(new Blob(this.chunks as BlobPart[], { type: 'application/octet-stream' }))
    })
  }

  /** Text compresses well. Photos are already JPEG, so they are stored as they are. */
  add(name: string, bytes: Uint8Array, compress: boolean) {
    const entry = compress ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name)
    this.zip.add(entry)
    entry.push(bytes, true)
  }

  finish(): Promise<Blob> {
    this.zip.end()
    return this.finished
  }
}

const READ_CHUNK = 2 * 1024 * 1024

/**
 * Reads a zip a couple of megabytes at a time and hands over one entry at a time.
 * The next piece is not read until the entry handler has finished, so memory stays flat.
 */
export async function scanZip(
  file: Blob,
  onEntry: (name: string, bytes: Uint8Array) => void | Promise<void>,
): Promise<void> {
  let queue: Promise<void> = Promise.resolve()
  let failure: unknown = null
  const unzip = new Unzip()
  unzip.register(UnzipInflate)
  unzip.onfile = (entry) => {
    const parts: Uint8Array[] = []
    entry.ondata = (error, data, final) => {
      if (error) {
        failure = error
        return
      }
      parts.push(data)
      if (!final) return
      const size = parts.reduce((sum, part) => sum + part.length, 0)
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const part of parts) {
        bytes.set(part, offset)
        offset += part.length
      }
      queue = queue.then(() => onEntry(entry.name, bytes))
    }
    entry.start()
  }
  for (let offset = 0; offset < file.size; offset += READ_CHUNK) {
    const piece = new Uint8Array(await file.slice(offset, offset + READ_CHUNK).arrayBuffer())
    unzip.push(piece, offset + READ_CHUNK >= file.size)
    if (failure) throw failure
    await queue
  }
  await queue
  if (failure) throw failure
}
