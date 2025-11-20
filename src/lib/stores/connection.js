import { writable } from 'svelte/store';

// Por defecto asumimos que SÍ hay internet (true) para evitar parpadeos iniciales
export const isOnline = writable(true);