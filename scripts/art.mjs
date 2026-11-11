// Makes the web copies of the label lithographs from the full-size originals in art/.
// Run with: node scripts/art.mjs
import { readdir } from 'node:fs/promises'
import sharp from 'sharp'

const WIDTHS = [640, 1280]

for (const file of await readdir('art')) {
  if (!file.endsWith('.jpg')) continue
  const name = file.replace(/\.jpg$/, '')
  for (const width of WIDTHS) {
    const out = `src/assets/${name}-${width}.webp`
    const info = await sharp(`art/${file}`)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 640 ? 74 : 70, effort: 6 })
      .toFile(out)
    console.log(out, Math.round(info.size / 1024), 'KB', `${info.width}x${info.height}`)
  }
}
