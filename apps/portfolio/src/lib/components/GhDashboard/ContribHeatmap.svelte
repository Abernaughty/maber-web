<script lang="ts">
	/**
	 * Contribution heatmap — 53 columns × 7 rows of cells.
	 *
	 * When `days` is null shows an empty grid (skeleton). When data is
	 * present, each cell is filled with a cyan-tinted intensity based on
	 * the day's contribution count quartile, with a `<title>` tooltip for
	 * zero-JS hover. Days are layout-grouped column-by-column (Sunday top
	 * → Saturday bottom) to match GitHub's own rendering.
	 *
	 * Spec: §4 Modules → Contribution heatmap.
	 */

	import type { GhContribDay } from '$lib/server/github';

	interface Props {
		days: GhContribDay[] | null;
	}

	const { days }: Props = $props();

	const COLUMNS = 53;
	const ROWS = 7;
	const TOTAL = COLUMNS * ROWS;

	const filledDays = $derived.by(() => {
		if (!days || days.length === 0) return null;
		// Pad the front so the grid still has 371 cells if GitHub returned a
		// short calendar (rare — the API returns a full year).
		const pad = Math.max(0, TOTAL - days.length);
		return Array.from({ length: pad }, () => null as GhContribDay | null).concat(
			days.slice(-TOTAL)
		);
	});

	// Quartile thresholds derived from the day distribution (excluding zeros)
	// so a small number of high-contribution days drive the top intensity
	// rather than rounding everything to level 1.
	const thresholds = $derived.by(() => {
		if (!filledDays) return null;
		const positives = filledDays
			.filter((d): d is GhContribDay => d !== null && d.count > 0)
			.map((d) => d.count)
			.sort((a, b) => a - b);
		if (positives.length === 0) return [1, 2, 3, 4];
		const quartile = (q: number) =>
			positives[Math.min(positives.length - 1, Math.floor(positives.length * q))];
		return [quartile(0.25), quartile(0.5), quartile(0.75), quartile(0.95)];
	});

	function level(count: number): number {
		if (!thresholds || count === 0) return 0;
		if (count <= thresholds[0]) return 1;
		if (count <= thresholds[1]) return 2;
		if (count <= thresholds[2]) return 3;
		return 4;
	}
</script>

<div class="heatmap" role="img" aria-label="GitHub contribution heatmap">
	<div class="grid">
		{#if filledDays}
			{#each filledDays as day, i (i)}
				{#if day}
					<span
						class="cell"
						data-level={level(day.count)}
						title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
					></span>
				{:else}
					<span class="cell" data-level="0"></span>
				{/if}
			{/each}
		{:else}
			{#each Array.from({ length: TOTAL }) as _, i (i)}
				<span class="cell" data-level="0"></span>
			{/each}
		{/if}
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

	.cell[data-level='1'] {
		background: rgba(34, 211, 238, 0.18);
	}
	.cell[data-level='2'] {
		background: rgba(34, 211, 238, 0.36);
	}
	.cell[data-level='3'] {
		background: rgba(34, 211, 238, 0.6);
	}
	.cell[data-level='4'] {
		background: rgba(34, 211, 238, 0.92);
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
