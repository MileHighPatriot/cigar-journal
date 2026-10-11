import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// GitHub Pages serves the app under /cigar-journal/; the deploy workflow sets this.
const base = loadEnv('production', '.', 'VITE_').VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  // Shown in Settings, so it is easy to tell which version a device is running.
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  plugins: [
    react(),
    VitePWA({
      // Never auto-reload: an update waits until Kohlton taps Reload.
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: base,
        name: 'Cigar Journal',
        short_name: 'Journal',
        description: 'A personal cigar journal that works offline.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#16110D',
        background_color: '#16110D',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,json,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  // Fixed ports: the port is part of the address, and data is tied to the address.
  server: { host: true, port: 5173, strictPort: true, allowedHosts: ['.local'] },
  preview: { host: true, port: 4173, strictPort: true, allowedHosts: ['.local'] },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
