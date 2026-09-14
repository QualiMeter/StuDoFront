import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			includeAssets: ['offline.html'],
			workbox: {
				navigateFallback: '/offline.html',
				navigateFallbackAllowlist: [/^\/.*$/],
				globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
				additionalManifestEntries: [
					{ url: '/offline.html', revision: null }
				],
				cleanupOutdatedCaches: true
			}
		})
	],
})
