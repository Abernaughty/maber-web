<script lang="ts">
	/**
	 * Languages bar — stacked horizontal bar of top languages by total bytes
	 * across the top repos, with a legend below using GitHub-standard
	 * language colors. When `langs` is null, falls back to a muted bar +
	 * skeleton legend.
	 *
	 * Spec: §4 Modules → Languages bar.
	 */

	import Skeleton from './Skeleton.svelte';
	import type { GhLanguage } from '$lib/server/github';

	interface Props {
		langs: GhLanguage[] | null;
	}

	const { langs }: Props = $props();

	const LEGEND_COUNT = 5;
</script>

<div class="languages">
	<div
		class="bar"
		role="img"
		aria-label={langs
			? `Language breakdown: ${langs.map((l) => `${l.name} ${l.pct}%`).join(', ')}`
			: 'Language breakdown loading'}
	>
		{#if langs}
			{#each langs as lang (lang.name)}
				<span
					class="segment"
					style:width="{lang.pct}%"
					style:background={lang.color}
				></span>
			{/each}
		{/if}
	</div>
	<ul class="legend">
		{#if langs}
			{#each langs as lang (lang.name)}
				<li>
					<span class="dot" style:background={lang.color}></span>
					<span class="name">{lang.name}</span>
					<span class="pct">{lang.pct}%</span>
				</li>
			{/each}
		{:else}
			{#each Array.from({ length: LEGEND_COUNT }) as _, i (i)}
				<li>
					<span class="dot"></span>
					<Skeleton width="64px" height="0.7em" />
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	.languages {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.bar {
		height: 8px;
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.05);
		overflow: hidden;
		display: flex;
	}

	.segment {
		height: 100%;
		display: block;
	}

	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
	}

	.legend li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
	}

	.name {
		color: var(--text);
	}

	.pct {
		color: var(--dim);
	}
</style>
