<script lang="ts">
	/**
	 * Section 4 of the deep-dive — stack of expandable Q/A cards.
	 * Spec §7 §4.
	 */

	import DecisionCard from './DecisionCard.svelte';
	import type { DecisionEntry } from '$lib/constants/deepdives';

	interface Props {
		decisions: readonly DecisionEntry[];
	}

	const { decisions }: Props = $props();
</script>

<section class="decisions">
	<header class="header">
		<span class="prefix">/decisions</span>
		<h2>decisions worth reading</h2>
	</header>

	<div class="cards">
		{#each decisions as decision (decision.question)}
			<DecisionCard question={decision.question} answer={decision.answer} />
		{/each}
	</div>
</section>

<style>
	.decisions {
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
	}

	h2 {
		font-family: var(--font-sans);
		font-size: var(--fs-xl);
		font-weight: var(--fw-bold);
		color: var(--text);
		line-height: var(--lh-tight);
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
