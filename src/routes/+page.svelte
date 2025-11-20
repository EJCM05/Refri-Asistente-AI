<script>
    import { supabase } from '$lib/supabase/supabaseClient';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte'; // Importamos onMount
	import Footer from '$lib/components/Footer.svelte';

    const imageLogo = '/images/logo.png'


    let email = '';
    let password = '';
    let loading = false;
    let errorMessage = '';

    // --- MEJORA: Si ya hay sesión, saltar el login ---
    onMount(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            goto('/asistance'); // <-- Redirigir al chat si ya está logueado
        }
    });

    const handleLogin = async () => {
        loading = true;
        errorMessage = '';

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            errorMessage = error.message;
            loading = false;
        } else {
            // Login exitoso, vamos al chat
            // CORRECCIÓN: Vamos a '/asistance', no a '/'
            goto('/asistance'); 
        }
    };

    const handleRegister = async () => {
        loading = true;
        errorMessage = '';
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            errorMessage = error.message;
        } else {
            alert('Registro exitoso. Si tienes confirmación de email activa, revisa tu correo.');
        }
        loading = false;
    };
</script>
<div class="hero min-h-screen bg-base-200" data-theme="night">
    <div class="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-12">
        
        <div class="text-center lg:text-left max-w-md lg:max-w-xl">
            
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">  
                <img src={imageLogo} alt="LogoRefrigeracion" class="w-28 lg:w-40 drop-shadow-lg"/>
                
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">Refri-Asistente</h1>
            </div>
            
            <p class="py-2 text-lg font-medium opacity-90">
                Tu compañero experto en diagnóstico y reparación.
            </p>
        </div>
        
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form class="card-body">
                <div class="form-control">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label class="label mb-1">
                        <span class="label-text">Correo Electrónico</span>
                    </label>
                    <input 
                        type="email" 
                        placeholder="email@ejemplo.com" 
                        class="input input-bordered" 
                        bind:value={email}
                        required 
                    />
                </div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="form-control">
                    <label class="label mb-1">
                        <span class="label-text">Contraseña</span>
                    </label>
                    <input 
                        type="password" 
                        placeholder="tu contraseña" 
                        class="input input-bordered" 
                        bind:value={password}
                        required 
                    />
                    {#if errorMessage}
                        <label class="label">
                            <span class="label-text-alt text-error">{errorMessage}</span>
                        </label>
                    {/if}
                </div>
                
                <div class="form-control mt-6">
                    <button 
                        class="btn bg-blue-700 text-white hover:bg-blue-800 border-none w-full transition-colors" 
                        on:click|preventDefault={handleLogin}
                        disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
<Footer/>