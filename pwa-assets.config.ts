import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// The icon already fills its square on the app background, so no padding is added.
const fill = { padding: 0, resizeOptions: { background: '#16110e' } }

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, ...fill },
    apple: { ...minimal2023Preset.apple, ...fill },
  },
  images: ['public/icon.svg'],
})
