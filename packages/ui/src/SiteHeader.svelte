<script lang="ts">
	interface NavLink {
		href: string;
		label: string;
		external?: boolean;
	}

	interface Props {
		siteName?: string;
		homeHref?: string;
		links?: NavLink[];
	}

	let { siteName = 'maber.io', homeHref = '/', links = [] }: Props = $props();
</script>

<header class="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
		<a href={homeHref} class="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors">
			{siteName}
		</a>
		{#if links.length > 0}
			<ul class="flex items-center gap-6">
				{#each links as link}
					<li>
						<a
							href={link.href}
							class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noopener noreferrer' : undefined}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>
</header>
