<script lang="ts">
	/**
	 * Single annotated code highlight. The highlighted HTML is produced by
	 * Shiki at server-load time (see lib/server/shiki.ts) so the client
	 * receives ready-to-paint markup with zero highlighting JS shipped.
	 *
	 * Spec §7 §5.
	 */

	import type { CodeSnippet as Snippet } from '$lib/constants/deepdives';

	interface Props {
		snippet: Snippet;
		/** Pre-rendered Shiki HTML for `snippet.code`. */
		html: string;
	}

	const { snippet, html }: Props = $props();
</script>

<article class="snippet">
	<header class="header">
		<h3 class="title">{snippet.title}</h3>
		<p class="caption">{snippet.caption}</p>
	</header>
	<div class="code-wrap">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki HTML is generated from a constant at SSR time — safe to inject. -->
		{@html html}
	</div>
	{#if snippet.sourceUrl}
		<a class="link" href={snippet.sourceUrl} target="_blank" rel="noopener noreferrer">
			view full file on github <span aria-hidden="true">→</span>
		</a>
	{/if}
</article>

<style>
	.snippet {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.title {
		font-family: var(--font-sans);
		font-size: var(--fs-lg);
		font-weight: var(--fw-semibold);
		color: var(--text);
	}

	.caption {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		line-height: var(--lh-snug);
		max-width: 70ch;
	}

	.code-wrap {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: #0d1117;
	}

	/* Shiki injects <pre><code>… that we let bleed to the panel edges with
	 * inner padding for breathing room. Wrap long lines disabled — the
	 * horizontal scroll preserves indentation, important for code reads. */
	.code-wrap :global(pre) {
		margin: 0;
		padding: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		line-height: var(--lh-relaxed);
		overflow-x: auto;
		background: transparent !important;
	}

	.code-wrap :global(pre code) {
		font-family: inherit;
	}

	.link {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--accent);
		align-self: flex-start;
	}

	.link:hover {
		border-bottom: 1px solid var(--accent);
	}
</style>
