<script lang="ts">
	/**
	 * Skills section — 6-column responsive grid of categories. Each column
	 * shows the category name (cyan, mono, uppercase) over a stacked list
	 * of skills in muted mono.
	 *
	 * Spec §3 says the subtitle is "dropping the buzzword soup" — that
	 * framing tells the reader these are tools I actually ship with, not
	 * a comprehensive list of everything I've ever touched.
	 *
	 * Spec: §3 Skills.
	 */

	import { SKILLS } from '$lib/constants/skills';
	import SectionHeader from './SectionHeader.svelte';
</script>

<section id="skills" class="skills">
	<div class="inner">
		<SectionHeader
			path="/skills"
			title="Skills"
			subtitle="dropping the buzzword soup — these are the tools I actually ship with."
		/>

		<div class="grid">
			{#each SKILLS as category (category.name)}
				<div class="category">
					<h3 class="category-name">{category.name}</h3>
					<ul class="skill-list">
						{#each category.skills as skill (skill)}
							<li>{skill}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.skills {
		padding: var(--section-pad-y) var(--section-pad-x);
		background: var(--bg-2);
		position: relative;
		z-index: var(--z-content);
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: var(--space-6);
	}

	.category {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.category-name {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		font-weight: var(--fw-bold);
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--border);
	}

	.skill-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.skill-list li {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		line-height: var(--lh-snug);
	}

	@media (max-width: 1080px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 720px) {
		.skills {
			padding: var(--section-pad-y-mobile) var(--section-pad-x-mobile);
		}
		.grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-4);
		}
	}

	@media (max-width: 480px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
