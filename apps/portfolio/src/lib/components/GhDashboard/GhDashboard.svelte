<script lang="ts">
	/**
	 * GitHub dashboard composition shell.
	 *
	 * Replaces the static "stats strip" with live GitHub data — the dashboard
	 * IS the proof, eliminating the need for a separate proof strip section.
	 *
	 * Phase 1: every module renders skeleton placeholders. The visual layout
	 * is locked in here so Phase 2 just swaps skeletons for live values from
	 * a single server-side GraphQL fetch (see spec §4 Data layer).
	 *
	 * Spec: §4 GhDashboard.
	 */

	import HeaderRow from './HeaderRow.svelte';
	import ContribHeatmap from './ContribHeatmap.svelte';
	import TopRepos from './TopRepos.svelte';
	import RecentActivity from './RecentActivity.svelte';
	import LanguagesBar from './LanguagesBar.svelte';
</script>

<section class="dashboard" aria-label="GitHub activity dashboard">
	<HeaderRow />
	<div class="heatmap-wrap">
		<ContribHeatmap />
	</div>
	<div class="grid">
		<TopRepos />
		<RecentActivity />
	</div>
	<LanguagesBar />
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
