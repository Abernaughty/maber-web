<script lang="ts">
	/**
	 * Root layout — mounts the sticky shell (TopBar + Nav), the page slot,
	 * the Footer, and a single CommandPalette instance whose open state is
	 * shared via two-way binding with the Nav's ⌘K trigger.
	 *
	 * Spec: §3 — TopBar (sticky top:0, z-60) + Nav (sticky top:33px, z-50).
	 */

	import type { Snippet } from 'svelte';
	import '../app.css';
	import TopBar from '$lib/components/TopBar.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';

	let { children }: { children: Snippet } = $props();

	let paletteOpen = $state(false);

	// Cross-route hash scroll: handled by CSS `scroll-padding-top` on `html`
	// (see app.css). Browsers honor that during native hash navigation so
	// `#section` lands below the sticky TopBar+Nav rather than under it.
</script>

<div class="app">
	<TopBar />
	<Nav bind:paletteOpen />

	<main id="top">
		{@render children()}
	</main>

	<Footer />
	<CommandPalette bind:open={paletteOpen} />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		/* Reset scroll anchor; sections inside provide their own ids. */
	}
</style>
