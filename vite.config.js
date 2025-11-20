import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate', 
			devOptions: {
				enabled: true // Para poder probarlo en localhost
			},
			manifest: {
				name: 'Refrí-Asistente',
				short_name: 'Refrí-Asistente',
				description: 'Asistente experto en refrigeración con IA',
				theme_color: '#0f172a', // Coincide con tu tema dark (bg-base-200 aprox)
				background_color: '#0f172a',
				display: 'standalone', // Esto quita la barra del navegador
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'images/Logo_pwa_192.png', // Necesitamos crear estos iconos
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'images/Logo_pwa_512.png',
						sizes: '512x512',
						type: 'image/png'
					},
                    {
                        src: 'images/Logo_pwa_512_stalone.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable' // Importante para Android modernos
                    }
				]
			}
		})
	],
});
