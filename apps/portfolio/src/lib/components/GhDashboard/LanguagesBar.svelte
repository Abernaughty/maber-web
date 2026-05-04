<script lang="ts">
	/**
	 * Languages bar — stacked horizontal bar of top languages by total bytes
	 * across the top repos, with a legend below using GitHub-standard
	 * language colors. When `langs` is null, falls back to a muted bar +
	 * skeleton legend.
	 *
	 * Bar + legend dots use inline SVG `fill` attributes (not CSS `style:`)
	 * so the strict CSP `style-src 'self'` allows the runtime colors.
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

	const segments = $derived.by(() => {
		if (!langs) return null;
		let offset = 0;
		return langs.map((lang) => {
			const seg = { ...lang, offset };
			offset += lang.pct;
			return seg;
		});
	});
</script>

<div class="languages">
	<svg
		class="bar"
		viewBox="0 0 100 8"
		preserveAspectRatio="none"
		width="100%"
		height="8"
		role="img"
		aria-label={langs
			? `Language breakdown: ${langs.map((l) => `${l.name} ${l.pct}%`).join(', ')}`
			: 'Language breakdown loading'}
	>
		{#if segments}
			{#each segments as seg (seg.name)}
				<rect x={seg.offset} y="0" width={seg.pct} height="8" fill={seg.color} />
			{/each}
		{/if}
	</svg>
	<ul class="legend">
		{#if langs}
			{#each langs as lang (lang.name)}
				<li>
					<svg class="dot" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
						<circle cx="4" cy="4" r="4" fill={lang.color} />
					</svg>
					<span class="name">{lang.name}</span>
					<span class="pct">{lang.pct}%</span>
				</li>
			{/each}
		{:else}
			{#each Array.from({ length: LEGEND_COUNT }) as _, i (i)}
				<li>
					<span class="dot dot-skel"></span>
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
		flex-shrink: 0;
	}

	.dot-skel {
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
