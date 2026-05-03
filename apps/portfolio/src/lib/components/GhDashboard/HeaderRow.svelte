<script lang="ts">
	/**
	 * GhDashboard header line: `$ gh status ── @login · N repos · M followers
	 * · ● live`.
	 *
	 * When `user` is null the row falls back to skeleton placeholders and the
	 * live-dot turns grey/amber per `status` so the degraded state is
	 * visually distinct from "still loading."
	 *
	 * Spec: §4 Modules → Header row.
	 */

	import Skeleton from './Skeleton.svelte';
	import type { GhUser } from '$lib/server/github';

	interface Props {
		user: GhUser | null;
		status: 'live' | 'error';
	}

	const { user, status }: Props = $props();
</script>

<div class="header">
	<span class="prompt">
		<span class="dollar">$</span>
		<span class="cmd">gh status</span>
	</span>
	<span class="separator" aria-hidden="true">──</span>
	<span class="meta">
		{#if user}
			<span class="login"><span class="at">@</span>{user.login}</span>
			<span class="dim">·</span>
			<span>{user.repoCount} repos</span>
			<span class="dim">·</span>
			<span>{user.followerCount} followers</span>
		{:else}
			<Skeleton width="80px" />
			<span class="dim">·</span>
			<Skeleton width="60px" />
			<span class="dim">·</span>
			<Skeleton width="80px" />
		{/if}
		<span class="dim">·</span>
		<span class="live status-{status}" aria-label="data freshness {status}">
			<span class="dot" aria-hidden="true"></span>
			<span class="label">{status === 'live' ? 'live' : 'degraded'}</span>
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

	.login {
		color: var(--text);
	}

	.at {
		color: var(--accent);
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

	.live.status-live .dot {
		background: var(--status-live);
		box-shadow: 0 0 6px var(--status-live);
	}

	.live.status-error .dot {
		background: #f59e0b;
	}

	.label {
		color: var(--dim);
		font-size: var(--fs-micro);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}
</style>
