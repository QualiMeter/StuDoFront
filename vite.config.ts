import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			workbox: {
				navigateFallback: '/index.html',
				navigateFallbackAllowlist: [/^\/.*$/],
				globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						urlPattern: /\/[^.]*$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'navigation',
							networkTimeoutSeconds: 3
						}
					}
				]
			}
		})
	],
})
