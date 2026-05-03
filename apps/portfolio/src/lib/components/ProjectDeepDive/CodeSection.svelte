<script lang="ts">
	/**
	 * Section 5 of the deep-dive — 1–3 annotated code highlights.
	 * Spec §7 §5.
	 */

	import CodeSnippet from './CodeSnippet.svelte';
	import type { CodeSnippet as Snippet } from '$lib/constants/deepdives';

	interface Props {
		snippets: readonly Snippet[];
		/** Map from snippet index → pre-rendered Shiki HTML. */
		htmlBySnippet: readonly string[];
	}

	const { snippets, htmlBySnippet }: Props = $props();
</script>

<section class="code">
	<header class="header">
		<span class="prefix">/code</span>
		<h2>code highlights</h2>
	</header>

	<div class="snippets">
		{#each snippets as snippet, i (snippet.title)}
			<CodeSnippet {snippet} html={htmlBySnippet[i] ?? ''} />
		{/each}
	</div>
</section>

<style>
	.code {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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
	}

	h2 {
		font-family: var(--font-sans);
		font-size: var(--fs-xl);
		font-weight: var(--fw-bold);
		color: var(--text);
		line-height: var(--lh-tight);
	}

	.snippets {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
</style>
