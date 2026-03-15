<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		techStack?: string[];
		liveUrl?: string;
		sourceUrl?: string;
		imageUrl?: string;
	}

	let {
		title = 'Project Title',
		description = 'Project description goes here.',
		techStack = [],
		liveUrl = '#',
		sourceUrl = '#',
		imageUrl = ''
	}: Props = $props();
</script>

<div class="card project-card">
	{#if imageUrl}
		<div class="project-image">
			<img src={imageUrl} alt={title} />
		</div>
	{/if}

	<h3>{title}</h3>
	<p>{description}</p>

	<div class="tech-stack">
		{#each techStack as tech}
			<span class="tech-tag">{tech}</span>
		{/each}
	</div>

	<div class="project-links">
		<a href={liveUrl} class="project-link" target="_blank" rel="noopener noreferrer">View Project</a>
		<a href={sourceUrl} class="project-link" target="_blank" rel="noopener noreferrer">Source Code</a>
	</div>
</div>

<style>
	.project-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.project-image {
		margin-bottom: var(--space-md);
		border-radius: var(--border-radius);
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: auto;
		display: block;
		transition: transform var(--transition-speed) ease;
	}

	.project-image img:hover {
		transform: scale(1.03);
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: var(--space-md) 0;
	}

	.tech-tag {
		background-color: var(--background);
		color: var(--blue-color);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--border-radius);
		font-size: var(--fs-small);
	}

	.project-links {
		display: flex;
		gap: var(--space-md);
		margin-top: auto;
		padding-top: var(--space-md);
	}

	.project-link {
		color: var(--blue-color);
		font-size: var(--fs-small);
		text-decoration: underline;
	}
</style>
