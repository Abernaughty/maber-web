<script lang="ts">
	/**
	 * Single expandable project row inside WorkSection.
	 *
	 * Default state shows: number, title, year, one-line blurb, stack pills.
	 * Click anywhere on the row (or toggle button) to expand and reveal: full
	 * description, live + source links, deep-dive link, and optional thumbnail.
	 *
	 * Animation uses the `grid-template-rows: 0fr → 1fr` trick to animate
	 * `auto`-height content. Cleaner than measuring pixels and works with
	 * dynamic content height changes.
	 *
	 * Spec §3 Work — project row.
	 */

	import type { Project } from '$lib/constants/projects';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	let expanded = $state(false);

	function toggle() {
		expanded = !expanded;
	}
</script>

<article class="row" class:expanded>
	<!-- Whole-row toggle button. The expanded panel below contains the actual
	     interactive links — those bubble click events on themselves. -->
	<button class="header" type="button" onclick={toggle} aria-expanded={expanded}>
		<span class="number">{project.number}</span>
		<span class="title-block">
			<h3 class="title">{project.title}</h3>
			<span class="blurb">{project.blurb}</span>
			<ul class="stack">
				{#each project.stack as tech (tech)}
					<li class="pill">{tech}</li>
				{/each}
			</ul>
		</span>
		<span class="year-toggle">
			<span class="year">{project.year}</span>
			<span class="caret" aria-hidden="true">{expanded ? '−' : '+'}</span>
		</span>
	</button>

	<div class="panel" class:open={expanded}>
		<div class="panel-inner">
			<p class="description">{project.description}</p>

			{#if project.thumbnail}
				<img class="thumbnail" src={project.thumbnail} alt={`${project.title} screenshot`} loading="lazy" />
			{/if}

			<div class="links">
				{#if project.liveUrl}
					<a class="link primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
						live <span aria-hidden="true">→</span>
					</a>
				{/if}
				{#if project.sourceUrl}
					<a class="link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
						source <span aria-hidden="true">→</span>
					</a>
				{/if}
				<a class="link" href="/projects/{project.slug}">
					read deep-dive <span aria-hidden="true">→</span>
				</a>
			</div>
		</div>
	</div>
</article>

<style>
	.row {
		border-top: 1px solid var(--border);
		transition: background-color var(--transition-fast);
	}

	.row:last-child {
		border-bottom: 1px solid var(--border);
	}

	.row:hover {
		background-color: var(--accent-glow);
	}

	.header {
		width: 100%;
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-4);
		align-items: start;
		padding: var(--space-6) var(--space-3);
		text-align: left;
		color: inherit;
		cursor: pointer;
	}

	.number {
		font-family: var(--font-mono);
		font-size: var(--fs-xl);
		color: var(--accent);
		line-height: 1;
		font-weight: var(--fw-bold);
		padding-top: 4px;
	}

	.title-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.title {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--fs-lg);
		font-weight: var(--fw-semibold);
		color: var(--text);
		line-height: var(--lh-snug);
	}

	.blurb {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		line-height: var(--lh-snug);
	}

	.stack {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin-top: var(--space-1);
	}

	.pill {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--accent);
		background: var(--accent-glow);
		border: 1px solid var(--accent-dim);
		border-radius: var(--radius-sm);
		padding: 2px var(--space-2);
		text-transform: lowercase;
	}

	.year-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
	}

	.year {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--dim);
	}

	.caret {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		color: var(--accent);
		width: 1.5em;
		text-align: center;
		line-height: 1;
	}

	/* Smooth height animation via grid-template-rows trick: animate from 0fr
	 * to 1fr and let the inner div's natural height carry the rendered size. */
	.panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--transition-normal);
	}

	.panel.open {
		grid-template-rows: 1fr;
	}

	.panel-inner {
		overflow: hidden;
		padding: 0 var(--space-3);
	}

	.panel.open .panel-inner {
		padding-bottom: var(--space-6);
	}

	.description {
		font-family: var(--font-sans);
		font-size: var(--fs-base);
		color: var(--muted);
		line-height: var(--lh-relaxed);
		max-width: 60ch;
		margin-bottom: var(--space-4);
	}

	.thumbnail {
		max-width: 100%;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		margin-bottom: var(--space-4);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.link {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--accent);
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding-bottom: 1px;
		border-bottom: 1px solid transparent;
		transition: border-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.link:hover {
		border-color: var(--accent);
	}

	.link:hover span {
		transform: translateX(2px);
	}

	.link.primary {
		font-weight: var(--fw-semibold);
	}

	@media (max-width: 720px) {
		.header {
			grid-template-columns: auto 1fr;
			grid-template-areas:
				'number main'
				'meta   meta';
			gap: var(--space-2) var(--space-3);
			padding: var(--space-4) var(--space-2);
		}
		.number {
			grid-area: number;
		}
		.title-block {
			grid-area: main;
		}
		.year-toggle {
			grid-area: meta;
			justify-content: space-between;
		}
		.year {
			margin-right: auto;
		}
		.panel-inner {
			padding: 0 var(--space-2);
		}
		.panel.open .panel-inner {
			padding-bottom: var(--space-4);
		}
	}
</style>
