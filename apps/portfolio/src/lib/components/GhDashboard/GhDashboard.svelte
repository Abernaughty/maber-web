<script lang="ts">
	/**
	 * GitHub dashboard composition shell.
	 *
	 * Replaces the static "stats strip" with live GitHub data — the dashboard
	 * IS the proof, eliminating the need for a separate proof strip section.
	 *
	 * Receives `data` from the server load (see +page.server.ts). When data
	 * is null the fetch failed at the edge and every module shows its
	 * skeleton; the HeaderRow flips its live-dot to amber/grey via `status`.
	 *
	 * Spec: §4 GhDashboard.
	 */

	import HeaderRow from './HeaderRow.svelte';
	import ContribHeatmap from './ContribHeatmap.svelte';
	import TopRepos from './TopRepos.svelte';
	import RecentActivity from './RecentActivity.svelte';
	import LanguagesBar from './LanguagesBar.svelte';
	import type { GhDashboardData } from '$lib/server/github';

	interface Props {
		data: GhDashboardData | null;
		status: 'live' | 'error';
	}

	const { data, status }: Props = $props();
</script>

<section class="dashboard" aria-label="GitHub activity dashboard">
	<HeaderRow user={data?.user ?? null} {status} />
	<div class="heatmap-wrap">
		<ContribHeatmap days={data?.contribDays ?? null} />
	</div>
	<div class="grid">
		<TopRepos repos={data?.topRepos ?? null} />
		<RecentActivity events={data?.recentActivity ?? null} />
	</div>
	<LanguagesBar langs={data?.languages ?? null} />
</section>

<style>
	.dashboard {
		background: rgba(10, 11, 10, 0.7);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		backdrop-filter: var(--blur-backdrop);
	}

	.heatmap-wrap {
		display: flex;
		justify-content: center;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	@media (max-width: 720px) {
		.dashboard {
			padding: var(--space-4);
			gap: var(--space-4);
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
