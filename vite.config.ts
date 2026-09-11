import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'My App',
				short_name: 'App',
				theme_color: '#ffffff'
			},
			workbox: {
				navigateFallback: '/offline.html',
				runtimeCaching: [
				{
					urlPattern: /^https:\/\/.*/,
					handler: 'NetworkFirst',
					options: { cacheName: 'pages' }
				}]
			}
		})
	],
})
