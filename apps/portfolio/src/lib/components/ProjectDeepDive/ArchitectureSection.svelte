<script lang="ts">
	/**
	 * Section 3 of the deep-dive — Mermaid architecture diagram + paragraph.
	 *
	 * Mermaid is loaded lazily on the client only — keeps it out of the SSR
	 * bundle and off the critical path. Diagrams render after first paint
	 * so the page is interactive before the diagram resolves.
	 *
	 * On `prefers-reduced-motion: reduce` Mermaid still renders (it's not
	 * animated by default), so no extra handling needed.
	 *
	 * Spec §7 §3.
	 */

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		diagram: string;
		paragraph: string;
	}

	const { diagram, paragraph }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state(undefined);
	let renderedSvg = $state<string | null>(null);
	let renderError = $state<string | null>(null);

	onMount(async () => {
		if (!browser) return;
		try {
			const mermaid = (await import('mermaid')).default;
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'strict',
				fontFamily:
					'"JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace',
				themeVariables: {
					darkMode: true,
					background: '#0a0b0a',
					primaryColor: '#121310',
					primaryTextColor: '#e6e7e3',
					primaryBorderColor: '#22d3ee',
					lineColor: 'rgba(34, 211, 238, 0.6)',
					secondaryColor: '#16181a',
					tertiaryColor: '#0e0f0d',
					textColor: '#e6e7e3'
				}
			});
			const { svg } = await mermaid.render(
				`mermaid-${Math.random().toString(36).slice(2)}`,
				diagram
			);
			renderedSvg = svg;
		} catch (err) {
			renderError = err instanceof Error ? err.message : String(err);
		}
	});
</script>

<section class="architecture">
	<header class="header">
		<span class="prefix">/architecture</span>
		<h2>architecture</h2>
	</header>

	<div class="diagram-wrap" bind:this={containerEl}>
		{#if renderedSvg}
			<!-- Mermaid SVG is generated locally from a constant — safe to inject. -->
			{@html renderedSvg}
		{:else if renderError}
			<pre class="fallback" aria-label="Mermaid render failed; showing source">{diagram}</pre>
		{:else}
			<pre class="fallback" aria-label="Mermaid diagram loading">{diagram}</pre>
		{/if}
	</div>

	<p class="paragraph">{paragraph}</p>
</section>

<style>
	.architecture {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.prefix {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		text-transform: lowercase;
	}

	h2 {
		font-family: var(--font-sans);
		font-size: var(--fs-xl);
		font-weight: var(--fw-bold);
		color: var(--text);
		line-height: var(--lh-tight);
	}

	.diagram-wrap {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--panel-2);
		padding: var(--space-4);
		overflow-x: auto;
	}

	/* Center the SVG and let it scale to its natural width up to the panel. */
	.diagram-wrap :global(svg) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0 auto;
	}

	.fallback {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--muted);
		white-space: pre-wrap;
	}

	.paragraph {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		line-height: var(--lh-relaxed);
		max-width: 70ch;
	}
</style>
