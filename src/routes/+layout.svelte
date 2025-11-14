<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css'
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div data-theme="night" class="min-h-screen h-screen flex flex-col">
		{@render children()}
</div>
	