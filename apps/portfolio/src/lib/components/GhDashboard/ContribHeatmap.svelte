<script lang="ts">
	/**
	 * Contribution heatmap — 53 columns × 7 rows of cells.
	 *
	 * Phase 1 stub: renders the grid with all cells in a single muted shade.
	 * Phase 2 swaps the fill scale for cyan-tinted quartiles based on real
	 * contribution counts from `user.contributionsCollection.contributionCalendar`.
	 *
	 * Spec: §4 Modules → Contribution heatmap.
	 */

	const COLUMNS = 53;
	const ROWS = 7;
	const TOTAL = COLUMNS * ROWS;
</script>

<div class="heatmap" role="img" aria-label="GitHub contribution heatmap (loading)">
	<div class="grid">
		{#each Array.from({ length: TOTAL }) as _, i (i)}
			<span class="cell"></span>
		{/each}
	</div>
</div>

<style>
	.heatmap {
		width: 100%;
		overflow-x: auto;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(53, 12px);
		grid-template-rows: repeat(7, 12px);
		grid-auto-flow: column;
		gap: 3px;
		min-width: max-content;
	}

	.cell {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.04);
	}

	@media (max-width: 720px) {
		.grid {
			grid-template-columns: repeat(53, 8px);
			grid-template-rows: repeat(7, 8px);
			gap: 2px;
		}
		.cell {
			width: 8px;
			height: 8px;
		}
	}
</style>
