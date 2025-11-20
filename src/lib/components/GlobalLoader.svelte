<script>
    import { navigating } from '$app/stores';
    import { isLoading } from '$lib/stores/loading';
    import { fade } from 'svelte/transition';

    // El loader se muestra si:
    // 1. SvelteKit está navegando ($navigating tiene valor)
    // 2. O si activamos manualmente nuestra variable ($isLoading es true)
    $: show = $navigating || $isLoading;
</script>

{#if show}
    <div 
        class="fixed top-0 left-0 w-full z-50"
        transition:fade={{ duration: 200 }}
    >
        <progress class="progress progress-info w-full h-1 rounded-none"></progress>
    </div>
{/if}

<style>
    /* Opcional: Si quieres que la barra tenga un brillo o sombra */
    progress {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
</style>