import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vitalis',
        short_name: 'Vitalis',
        description: 'AI-powered fitness tracking',
        theme_color: '#0e0e0e',
        background_color: '#0e0e0e',
        display: 'standalone',
        icons: [
              { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ], 
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\.woff2?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // fonts don't change often — 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /https:\/\/.*basemaps\.cartocdn\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          // NOTE: /api/* caches were intentionally REMOVED. Authenticated API
          // responses (dashboard, profile, messages, etc.) must never be
          // cached by the service worker — on a shared device the stale cache
          // can leak one user's data to the next user who logs in.
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-dom') ||
              id.includes('/react/') ||
              id.includes('react-router-dom')
            ) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'chart-vendor';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'leaflet-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
            if (id.includes('react-webcam') || id.includes('@react-oauth/google')) {
              return 'media-vendor';
            }
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
})