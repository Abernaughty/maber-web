<script lang="ts">
	/**
	 * GhDashboard header line: `$ gh status ── @Abernaughty · N repos · M
	 * followers · ● live`
	 *
	 * Phase 1 stub — renders the literal `$ gh status` prompt + skeletons for
	 * the dynamic metadata. Phase 2 swaps the skeletons for live values from
	 * the server-side GraphQL fetch.
	 *
	 * Spec: §4 Modules → Header row.
	 */

	import Skeleton from './Skeleton.svelte';
</script>

<div class="header">
	<span class="prompt">
		<span class="dollar">$</span>
		<span class="cmd">gh status</span>
	</span>
	<span class="separator" aria-hidden="true">──</span>
	<span class="meta">
		<Skeleton width="80px" />
		<span class="dim">·</span>
		<Skeleton width="60px" />
		<span class="dim">·</span>
		<Skeleton width="80px" />
		<span class="dim">·</span>
		<span class="live" aria-label="data freshness pending">
			<span class="dot" aria-hidden="true"></span>
			<span class="label">loading</span>
		</span>
	</span>
</div>

<style>
	.header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		flex-wrap: wrap;
	}

	.prompt {
		display: inline-flex;
		gap: var(--space-2);
		color: var(--dim);
	}

	.dollar {
		color: var(--accent);
	}

	.separator {
		color: var(--dim);
	}

	.meta {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.dim {
		color: var(--dim);
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--dim);
	}

	.label {
		color: var(--dim);
		font-size: var(--fs-micro);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}
</style>
