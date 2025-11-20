<script>
    import { isOnline } from '$lib/stores/connection';
    import { fade, fly } from 'svelte/transition';
</script>

{#if !$isOnline}
    <div 
        class="fixed inset-0 z-[9999] bg-base-100/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
    >
        <div in:fly={{ y: 20, duration: 500 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-error mb-4 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.5 10.5a6 6 0 00-5.25 3m10.5 0a6 6 0 00-5.25-3m0 0a9 9 0 014.125-1.125M12 12V3m0 0a15 15 0 019 9m-9-9a15 15 0 00-9 9" />
            </svg>

            <h2 class="text-3xl font-bold text-white mb-2">¡Sin Conexión!</h2>
            <p class="text-lg text-gray-300 max-w-md">
                Parece que perdiste la conexión a internet. 
                Refrí-Asistente necesita internet para consultar a la IA.
            </p>
            
            <div class="mt-8">
                <span class="loading loading-dots loading-lg"></span>
                <p class="text-sm text-gray-500 mt-2">Esperando reconexión...</p>
            </div>
        </div>
    </div>
{/if}