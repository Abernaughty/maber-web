<script lang="ts">
	/**
	 * Languages bar — stacked horizontal bar of top languages by total bytes,
	 * with a legend below using GitHub-standard language colors.
	 *
	 * Phase 1 stub: renders a single muted bar + a 5-item skeleton legend.
	 * Phase 2 swaps in real percentages from the GraphQL languages query.
	 *
	 * Spec: §4 Modules → Languages bar.
	 */

	import Skeleton from './Skeleton.svelte';

	const LEGEND_COUNT = 5;
</script>

<div class="languages">
	<div class="bar" aria-hidden="true"></div>
	<ul class="legend">
		{#each Array.from({ length: LEGEND_COUNT }) as _, i (i)}
			<li>
				<span class="dot"></span>
				<Skeleton width="64px" height="0.7em" />
			</li>
		{/each}
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
	}

	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
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
</style>
