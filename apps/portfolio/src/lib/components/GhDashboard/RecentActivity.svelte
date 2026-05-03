<script lang="ts">
	/**
	 * Recent activity card — up to 5 event rows showing time-ago, verb,
	 * and target (repo · message). When `events` is null, falls back to
	 * skeleton placeholders.
	 *
	 * Spec: §4 Modules → Recent activity card.
	 */

	import Skeleton from './Skeleton.svelte';
	import type { GhActivityEvent } from '$lib/server/github';

	interface Props {
		events: GhActivityEvent[] | null;
	}

	const { events }: Props = $props();

	const ROW_COUNT = 5;

	function timeAgo(iso: string): string {
		const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
		if (seconds < 60) return `${Math.floor(seconds)}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
		if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
		if (seconds < 604_800) return `${Math.floor(seconds / 86_400)}d`;
		if (seconds < 2_592_000) return `${Math.floor(seconds / 604_800)}w`;
		return `${Math.floor(seconds / 2_592_000)}mo`;
	}

	function verbFor(type: GhActivityEvent['type']): string {
		switch (type) {
			case 'PushEvent':
				return 'pushed to';
			case 'PullRequestEvent':
				return 'opened PR in';
			case 'IssuesEvent':
				return 'updated issue in';
			case 'CreateEvent':
				return 'created in';
		}
	}
</script>

<div class="card">
	<header class="card-header">
		<span class="title">recent activity</span>
	</header>
	<ul class="rows">
		{#if events && events.length > 0}
			{#each events as event (event.createdAt + event.repo)}
				<li class="row">
					<span class="ago" title={event.createdAt}>{timeAgo(event.createdAt)}</span>
					<span class="line">
						<span class="verb">{verbFor(event.type)}</span>
						<span class="repo">{event.repo}</span>
						{#if event.message}
							<span class="dim">·</span>
							<span class="msg">{event.message}</span>
						{/if}
					</span>
				</li>
			{/each}
		{:else if events && events.length === 0}
			<li class="empty">no recent public activity</li>
		{:else}
			{#each Array.from({ length: ROW_COUNT }) as _, i (i)}
				<li class="row">
					<Skeleton width="32px" height="0.8em" />
					<Skeleton width="100%" height="0.85em" />
				</li>
			{/each}
		{/if}
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
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
	}

	.ago {
		color: var(--accent);
		flex-shrink: 0;
		min-width: 28px;
	}

	.line {
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.verb {
		color: var(--dim);
	}

	.repo {
		color: var(--text);
	}

	.dim {
		color: var(--dim);
	}

	.msg {
		color: var(--muted);
	}

	.empty {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		font-style: italic;
	}
</style>
