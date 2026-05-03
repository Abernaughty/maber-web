<script lang="ts">
	/**
	 * Top repos card — 4 repo rows showing name, description, primary
	 * language dot, and star count. When `repos` is null, falls back to
	 * skeleton placeholders.
	 *
	 * Spec: §4 Modules → Top repos card.
	 */

	import Skeleton from './Skeleton.svelte';
	import type { GhRepo } from '$lib/server/github';

	interface Props {
		repos: GhRepo[] | null;
	}

	const { repos }: Props = $props();

	const ROW_COUNT = 4;
</script>

<div class="card">
	<header class="card-header">
		<span class="title">top repos</span>
	</header>
	<ul class="rows">
		{#if repos}
			{#each repos as repo (repo.name)}
				<li class="row">
					<a
						class="name"
						href={repo.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{repo.name}
					</a>
					{#if repo.description}
						<p class="desc">{repo.description}</p>
					{/if}
					<div class="meta">
						{#if repo.language}
							<span class="lang">
								<span class="lang-dot" style:background={repo.language.color}></span>
								{repo.language.name}
							</span>
						{/if}
						<span class="stars" aria-label={`${repo.stars} stars`}>
							★ {repo.stars}
						</span>
					</div>
				</li>
			{/each}
		{:else}
			{#each Array.from({ length: ROW_COUNT }) as _, i (i)}
				<li class="row">
					<Skeleton width="120px" height="0.95em" />
					<Skeleton width="100%" height="0.8em" />
					<div class="meta">
						<Skeleton width="60px" height="0.7em" />
						<Skeleton width="40px" height="0.7em" />
					</div>
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
		gap: var(--space-3);
	}

	.row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--text);
		font-weight: var(--fw-medium);
	}

	.name:hover {
		color: var(--accent);
	}

	.desc {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--muted);
		line-height: var(--lh-snug);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.meta {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--muted);
		align-items: center;
	}

	.lang {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.lang-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.stars {
		color: var(--dim);
	}
</style>
