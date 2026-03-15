<script lang="ts">
	import { FluidCanvas, SiteHeader } from '$lib/components';
</script>

<svelte:head>
	<title>maber.io</title>
	<meta name="description" content="Michael Abernathy - Software Developer" />
	<link rel="icon" href="/images/bear-icon.png" type="image/png" />
</svelte:head>

<SiteHeader />

<div class="logo-container">
	<img id="logo" src="/images/maber-logo.png" alt="maber.io" />
</div>

<FluidCanvas />

<style>
	.logo-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 0;
	}

	#logo {
		max-width: 60%;
		max-height: 60%;
		object-fit: contain;
	}
</style>
