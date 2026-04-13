import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * GitHub Pages: сайт открывается как https://<user>.github.io/<имя-репозитория>/
 * Задаётся при сборке: VITE_BASE_PATH=/ИмяРепо/
 * Локально: не задавать (будет "/")
 */
const base = process.env.VITE_BASE_PATH || '/';
const navigateFallback =
  base === '/' ? '/index.html' : `${base.replace(/\/$/, '')}/index.html`;

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'ProfiTabs',
        short_name: 'ProfiTabs',
        description: 'Создавайте и делитесь гитарными табулатурами',
        theme_color: '#8B6FAE',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
