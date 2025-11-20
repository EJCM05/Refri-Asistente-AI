<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css'
    import NoConnection from '$lib/components/NoConnection.svelte';
    import { isOnline } from '$lib/stores/connection';
    import GlobalLoader from '$lib/components/GlobalLoader.svelte';
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase/supabaseClient";
    import { goto, invalidate } from "$app/navigation";

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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<GlobalLoader />
<NoConnection />
<div data-theme="night" class="min-h-screen h-screen flex flex-col">
		{@render children()}
</div>
	