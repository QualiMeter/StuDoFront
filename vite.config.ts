import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			devOptions: { enabled: true },
			workbox: {
				navigateFallback: '/offline.html',
				navigateFallbackAllowlist: [/^\/.*$/],
				runtimeCaching: [
					{
						urlPattern: /\/index\.html$/,
						handler: 'NetworkFirst',
						options: { cacheName: 'navigation' }
					}
				],
				additionalManifestEntries: [
					{ url: '/offline.html', revision: null }
				],
				cleanupOutdatedCaches: true
			}
		})
	],
})
