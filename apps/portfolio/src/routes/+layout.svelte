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
	import { NAME } from '$lib/constants/identity';
	import { EMAIL } from '$lib/constants/contact';
	import {
		OG_IMAGE_URL,
		OG_IMAGE_WIDTH,
		OG_IMAGE_HEIGHT,
		SITE_NAME,
		SITE_URL,
		SAME_AS
	} from '$lib/constants/site';

	let { children }: { children: Snippet } = $props();

	let paletteOpen = $state(false);

	// Cross-route hash scroll: handled by CSS `scroll-padding-top` on `html`
	// (see app.css). Browsers honor that during native hash navigation so
	// `#section` lands below the sticky TopBar+Nav rather than under it.

	// JSON-LD Person schema. Built once at module scope so SvelteKit's
	// CSP hash-mode produces a single stable hash per build. `<` is escaped
	// to `<` as defense-in-depth against any embedded value ever
	// closing the script tag prematurely. The closing `</` + `script>` split
	// keeps Svelte's <script>-block parser from terminating this block early.
	const personJsonLdBody = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: NAME,
		jobTitle: 'Cloud & Platform Engineer',
		url: SITE_URL,
		email: `mailto:${EMAIL}`,
		image: OG_IMAGE_URL,
		worksFor: { '@type': 'Organization', name: 'Independent' },
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Colorado Springs',
			addressRegion: 'CO',
			addressCountry: 'US'
		},
		knowsAbout: [
			'Microsoft Azure',
			'Terraform',
			'Kubernetes',
			'Infrastructure as Code',
			'DevOps',
			'Platform Engineering',
			'SvelteKit',
			'TypeScript'
		],
		sameAs: SAME_AS
	}).replace(/</g, '\\u003c');
	const personJsonLdTag =
		'<script type="application/ld+json">' + personJsonLdBody + '</' + 'script>';
</script>

<svelte:head>
	<!-- Site-wide structural meta. Per-page <svelte:head> blocks override
	     title / description / og:title / og:description / og:url / canonical. -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:image" content={OG_IMAGE_URL} />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:image:alt" content="{NAME} — Cloud & Platform Engineer" />
	<meta property="og:locale" content="en_US" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={OG_IMAGE_URL} />
	<meta name="twitter:image:alt" content="{NAME} — Cloud & Platform Engineer" />
	<meta name="author" content={NAME} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- whole tag built from controlled values; `<` is escaped in the JSON body. -->
	{@html personJsonLdTag}
</svelte:head>

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
