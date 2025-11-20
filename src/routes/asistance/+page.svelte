<script>
    import { afterUpdate, onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { supabase } from '$lib/supabase/supabaseClient'; 
    import { goto } from '$app/navigation'; 
    import { browser } from '$app/environment';
    // Eliminamos 'redirect' porque da error en el cliente, usamos 'goto'

    const imageLogo = '/images/logo.png'
    const welcomeMessage = {
        role: 'model',
        text: '¡Bienvenido a Refrí-Asistente! ❄ \n\n¿En qué puedo ayudarte hoy? Sube una foto de un componente o hazme una pregunta sobre refrigeración.',
        image: null
    };  

    const MESSAGES_KEY = 'chat_messages';
    const HISTORY_KEY = 'chat_history';

    let messages = []; 
    let history = []; 
    
    let userInput = '';
    let loading = false;
    let selectedFile = null;
    let imagePreview = null;
    let imageBase64 = null;
    let imageMimeType = '';
    const MAX_FILE_SIZE_MB = 10;
    const MAX_RESOLUTION_PX = 1024;

    let chatContainer;

    // --- CORRECCIÓN PRINCIPAL AQUÍ ---
    onMount(async () => { // Hacemos la función async
        // 1. PRIMERO obtenemos la sesión
        const { data: { session } } = await supabase.auth.getSession();

        // 2. AHORA sí verificamos
        if (!session) {
            goto('/'); // Si no hay sesión, volvemos al login
            return; 
        }

        // 3. Escuchar cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!session) {
                goto('/');
            }
        });

        // 4. Cargar LocalStorage
        if (browser) { 
            const savedMessages = localStorage.getItem(MESSAGES_KEY);
            const savedHistory = localStorage.getItem(HISTORY_KEY);

            if (savedMessages) {
                messages = JSON.parse(savedMessages);
            } else {
                messages = [welcomeMessage];
            }

            if (savedHistory) {
                history = JSON.parse(savedHistory);
            } else {
                history = [];
            }
        }
    });

    // --- Guardado reactivo ---
    $: if (browser) {
        if (messages.length > 0) {
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        }
        if (history.length > 0) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
    }

    afterUpdate(() => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    // ... (El resto de tus funciones: handleFileChange, resetImage, handleSubmit, clearChat, etc. SE MANTIENEN IGUAL) ...
    
    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) { resetImage(); return; }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(`El archivo es muy grande. (Máx: ${MAX_FILE_SIZE_MB} MB)`);
            resetImage();
            return;
        }
        selectedFile = file;
        imageMimeType = file.type;
        imagePreview = URL.createObjectURL(file);
        try {
            imageBase64 = await resizeAndEncodeImage(file);
        } catch (err) {
            console.error('Error procesando imagen:', err);
            resetImage();
        }
    }

    function resetImage() {
        selectedFile = null;
        imagePreview = null;
        imageBase64 = null;
        imageMimeType = '';
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
    }

    async function handleSubmit() {
        if (!userInput.trim() && !imageBase64) return;
        loading = true;
        const userMessage = userInput;
        const userImageB64 = imageBase64;
        const userImageMime = imageMimeType;
        const userImagePreview = imagePreview;
        
        userInput = '';
        resetImage();

        messages = [...messages, { role: 'user', text: userMessage, image: userImagePreview }];

        const userParts = [];
        if (userMessage) userParts.push({ text: userMessage });
        if (userImageB64) {
            userParts.push({
                inlineData: { data: userImageB64, mimeType: userImageMime }
            });
        }
        
        const newHistory = [...history, { role: 'user', parts: userParts }];
        history = newHistory; 

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const data = await response.json();
            if (data.success) {
                messages = [...messages, { role: 'model', text: data.message, image: null }];
                history = [...history, { role: 'model', parts: [{ text: data.message }] }];
            } else {
                messages = [...messages, { role: 'model', text: data.message, image: null }];
            }
        } catch (error) {
            console.error('Error al hacer fetch:', error);
            messages = [...messages, { role: 'model', text: 'No pude conectarme. Intenta de nuevo.', image: null }];
        } finally {
            loading = false;
        }
    }

    function clearChat() {
        messages = [welcomeMessage];
        history = []; 
        resetImage();
        if (browser) {
            localStorage.removeItem(MESSAGES_KEY);
            localStorage.removeItem(HISTORY_KEY);
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    function resizeAndEncodeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > MAX_RESOLUTION_PX || height > MAX_RESOLUTION_PX) {
                        if (width > height) {
                            height = Math.round((height * MAX_RESOLUTION_PX) / width);
                            width = MAX_RESOLUTION_PX;
                        } else {
                            width = Math.round((width * MAX_RESOLUTION_PX) / height);
                            height = MAX_RESOLUTION_PX;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL(file.type);
                    resolve(dataUrl.split(',')[1]);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
</script>

<header class="navbar bg-base-300 shadow-lg">
    <div class="flex-1">
        <span class="btn btn-ghost text-xl normal-case">
            <img src={imageLogo} alt="Logo Refrigeracion" width="60rem" height="auto">
            Refrí-Asistente
        </span>
    </div>
    <div class="flex-none">
        <button class="btn btn-ghost bg-red-900" on:click={clearChat} title="Limpiar historial">
            Limpiar
        </button>
        <button class="btn btn-ghost bg-red-900" on:click={async () => {
            await supabase.auth.signOut();
            clearChat(); // Opcional: Limpiar chat al salir
            goto('/');
        }}>
            Salir
        </button>
    </div>
</header>

<main bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4 h-dvh">
    {#each messages as msg (msg)}
        {#if msg.role === 'user'}
            <div class="chat chat-end" in:fade={{ duration: 250 }}>
                <div class="chat-bubble bg-blue-500">
                    {#if msg.image}
                        <img src={msg.image} alt="Vista previa" class="max-w-xs rounded-lg mb-2" />
                    {/if}
                    {#if msg.text}
                        <p>{msg.text}</p>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="chat chat-start" in:fade={{ duration: 250 }}>
                <div class="chat-bubble bg-blue-900 text-white-900 ">
                    <p class="prose" style="white-space: pre-wrap;">{msg.text}</p>
                </div>
            </div>
        {/if}
    {/each}

    {#if loading}
        <div class="chat chat-start" in:fade={{ duration: 100 }}>
            <div class="chat-bubble">
                    <span class="loading loading-infinity loading-md"></span>
            </div>
        </div>
    {/if}
</main>

<footer class="p-4 bg-base-300">
    {#if imagePreview}
        <div class="preview p-2 relative w-24" in:fade={{ duration: 150 }}>
            <img src={imagePreview} alt="Vista previa" class="rounded-lg" />
            <button 
                class="btn btn-xs btn-circle btn-error absolute -top-2 -right-2"
                on:click={resetImage} 
                title="Quitar imagen">X</button>
        </div>
    {/if}

    <form class="flex items-center space-x-2" on:submit|preventDefault={handleSubmit}>
        <label for="file-input" class="btn btn-ghost bg-blue-700 btn-circle">
            📎
            <input 
                type="file" 
                id="file-input"
                class="hidden border-blue-900"
                accept="image/png, image/jpeg" 
                on:change={handleFileChange}
                disabled={loading}
            />
        </label>
        
        <input
            type="text"
            bind:value={userInput}
            placeholder={imageBase64 ? "Describe la imagen (opcional)" : "Pregunta sobre refrigeración..."}
            class="input border-blue-900 w-full"
            disabled={loading}
        />
        
        <button type="submit" class="btn btn-ghost bg-blue-700 btn-circle" disabled={loading}>
            {#if loading}
                <span class="loading loading-spinner"></span>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.875L6 12z" />
                </svg>
            {/if}
        </button>
    </form>
</footer>

<style>
    .prose {
        color: inherit;
    }
</style>