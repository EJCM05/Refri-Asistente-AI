import { writable } from 'svelte/store';

// Un simple interruptor: true = cargando, false = listo
export const isLoading = writable(false);

// Helpers para hacerlo más fácil de usar en tu código
export const startLoading = () => isLoading.set(true);
export const stopLoading = () => isLoading.set(false);