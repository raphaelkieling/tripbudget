/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app from /<repo-name>/. The deploy workflow sets
// BASE_PATH; locally it defaults to "/".
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Generates favicons, apple-touch and maskable PNGs from public/favicon.svg
      // (see pwa-assets.config.ts) and injects them into the manifest + <head>.
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: 'TripBudget',
        short_name: 'TripBudget',
        description: 'Know exactly how much you can spend each day of your trip.',
        theme_color: '#7c5cff',
        background_color: '#fff7f0',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['finance', 'travel'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
