<script lang="ts">
	/**
	 * Recent activity card — 5 event rows showing time-ago, verb, target.
	 * Phase 1 renders all five as skeleton placeholders.
	 *
	 * Spec: §4 Modules → Recent activity card.
	 */

	import Skeleton from './Skeleton.svelte';

	const ROW_COUNT = 5;
</script>

<div class="card">
	<header class="card-header">
		<span class="title">recent activity</span>
	</header>
	<ul class="rows">
		{#each Array.from({ length: ROW_COUNT }) as _, i (i)}
			<li class="row">
				<Skeleton width="32px" height="0.8em" />
				<Skeleton width="100%" height="0.85em" />
			</li>
		{/each}
	</ul>
</div>

<style>
	.card {
		background: var(--panel-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.card-header {
		margin-bottom: var(--space-3);
	}

	.title {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.rows {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
</style>
