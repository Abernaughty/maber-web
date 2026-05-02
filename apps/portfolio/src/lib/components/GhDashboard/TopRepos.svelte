<script lang="ts">
	/**
	 * Top repos card — 4 repo rows showing name, description, primary language
	 * dot, and star count. Phase 1 renders all four as skeleton placeholders.
	 *
	 * Spec: §4 Modules → Top repos card.
	 */

	import Skeleton from './Skeleton.svelte';

	const ROW_COUNT = 4;
</script>

<div class="card">
	<header class="card-header">
		<span class="title">top repos</span>
	</header>
	<ul class="rows">
		{#each Array.from({ length: ROW_COUNT }) as _, i (i)}
			<li class="row">
				<Skeleton width="120px" height="0.95em" />
				<Skeleton width="100%" height="0.8em" />
				<div class="meta">
					<Skeleton width="60px" height="0.7em" />
					<Skeleton width="40px" height="0.7em" />
				</div>
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
		gap: var(--space-3);
	}

	.row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.meta {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}
</style>
