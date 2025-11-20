<script>
    import favicon from '$lib/assets/Logo_pwa_192.png';
	import '../app.css'
    import { pwaInfo } from 'virtual:pwa-info';
    import NoConnection from '$lib/components/NoConnection.svelte';
    import { isOnline } from '$lib/stores/connection';
    import GlobalLoader from '$lib/components/GlobalLoader.svelte';
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase/supabaseClient";
    import { goto, invalidate } from "$app/navigation";

    onMount(async () => {
        // 2. Esto registra el Service Worker en el navegador
        // 3. LÓGICA DE PWA
        if (pwaInfo) {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: true,
                onRegistered(r) {
                    console.log('✅ PWA: Service Worker registrado');
                },
                onRegisterError(error) {
                    console.log('❌ PWA: Error de registro', error);
                }
            });
        }
        
        // ... el resto de tu onMount existente ...
    });
    
    // 3. Preparamos el link del manifiesto para el HTML
    
    // Lógica de sesión global (MANTENLA, es importante para seguridad)
    onMount(() => {
        // --- LÓGICA DE CONEXIÓN ---
        // Definimos las funciones para actualizar el store
        const updateOnlineStatus = () => isOnline.set(navigator.onLine);

        // Escuchamos los eventos del navegador
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Verificamos el estado inicial al cargar
        updateOnlineStatus();

        // --- TU LÓGICA DE SUPABASE EXISTENTE ---
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!session) {
                invalidate('supabase:auth');
                goto('/');
            }
        });

        // Limpieza: Cuando se desmonta el componente, dejamos de escuchar
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    });
	let { children } = $props();
    const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    {@html webManifestLink}
</svelte:head>
<GlobalLoader />
<NoConnection />
<div data-theme="night" class="min-h-screen h-screen flex flex-col">
		{@render children()}
</div>
	