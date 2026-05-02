<script lang="ts">
	/**
	 * Work section — features the active project lineup as a vertical stack
	 * of expandable rows.
	 *
	 * Spec: §3 Work.
	 */

	import { PROJECTS } from '$lib/constants/projects';
	import SectionHeader from './SectionHeader.svelte';
	import ProjectRow from './ProjectRow.svelte';

	const count = `${PROJECTS.length} project${PROJECTS.length === 1 ? '' : 's'}`;
</script>

<section id="work" class="work">
	<div class="inner">
		<SectionHeader
			path="/work"
			{count}
			title="What I'm shipping"
			subtitle="Click a row to expand. Each project links to a deep-dive case study."
		/>

		<div class="rows">
			{#each PROJECTS as project (project.slug)}
				<ProjectRow {project} />
			{/each}
		</div>
	</div>
</section>

<style>
	.work {
		padding: var(--section-pad-y) var(--section-pad-x);
		background: var(--bg-2);
		position: relative;
		z-index: var(--z-content);
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 720px) {
		.work {
			padding: var(--section-pad-y-mobile) var(--section-pad-x-mobile);
		}
	}
</style>
