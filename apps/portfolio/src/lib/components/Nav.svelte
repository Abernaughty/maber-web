<script lang="ts">
	/**
	 * Section nav — sits flush below the TopBar.
	 *
	 * Left: logo button (`❯ mike_abernathy.portfolio`) — clicking returns to top.
	 * Right: section links with active-section highlight (scroll-spy).
	 * Far right: ⌘K button — opens the command palette.
	 *
	 * Spec: §3 Nav — height 56px, sticky top:33px (flush below TopBar), z-50,
	 * translucent bg with backdrop blur.
	 */

	import { SECTIONS, SECTION_IDS } from '$lib/constants/sections';
	import { useActiveSection } from '$lib/hooks/useActiveSection.svelte';
	import { smoothScrollHandler } from '$lib/hooks/useSmoothScroll.svelte';

	interface Props {
		/** Bound from layout — opens the CommandPalette on ⌘K click. */
		paletteOpen: boolean;
	}

	let { paletteOpen = $bindable(false) }: Props = $props();

	const activeSection = useActiveSection(SECTION_IDS);

	// Mac vs Windows/Linux key glyph in the ⌘K button hint.
	let isMac = $state(false);
	$effect(() => {
		if (typeof navigator !== 'undefined') {
			isMac = /Mac|iPhone|iPad/.test(navigator.platform);
		}
	});

	function scrollToTop(event: Event) {
		event.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
		if (history.replaceState) {
			history.replaceState(null, '', window.location.pathname);
		}
	}
</script>

<nav class="nav" aria-label="Sections">
	<div class="inner">
		<a class="logo" href="#top" onclick={scrollToTop}>
			<span class="caret">❯</span>
			<span class="name">mike_abernathy.portfolio</span>
		</a>

		<ul class="sections">
			{#each SECTIONS as section (section.id)}
				<li>
					<a
						href="#{section.id}"
						class:active={activeSection.active === section.id}
						onclick={smoothScrollHandler(section.id)}
					>
						<span class="bracket">[</span>
						<span class="label">{section.label}</span>
						<span class="bracket">]</span>
					</a>
				</li>
			{/each}
		</ul>

		<button
			class="palette-trigger"
			type="button"
			aria-label="Open command palette"
			onclick={() => (paletteOpen = true)}
		>
			<kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
			<kbd>K</kbd>
		</button>
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: var(--topbar-height);
		z-index: var(--z-nav);
		height: var(--nav-height);
		background: rgba(10, 11, 10, 0.92);
		backdrop-filter: var(--blur-backdrop);
		border-bottom: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
	}

	.inner {
		max-width: var(--layout-max-width);
		height: 100%;
		margin: 0 auto;
		padding: 0 var(--section-pad-x);
		display: flex;
		align-items: center;
		gap: var(--space-6);
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text);
		font-weight: var(--fw-semibold);
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	.logo:hover {
		opacity: 0.85;
	}

	.logo .caret {
		color: var(--accent);
	}

	.sections {
		list-style: none;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		margin-left: auto;
	}

	.sections a {
		display: inline-flex;
		gap: 2px;
		padding: var(--space-2) var(--space-3);
		color: var(--muted);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast),
			background-color var(--transition-fast);
	}

	.sections a:hover {
		color: var(--text);
		background: var(--accent-glow);
	}

	.sections .bracket {
		color: var(--dim);
		transition: color var(--transition-fast);
	}

	.sections .label {
		color: inherit;
	}

	.sections a.active {
		color: var(--accent);
	}

	.sections a.active .bracket {
		color: var(--accent-dim);
	}

	.palette-trigger {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		transition: color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.palette-trigger:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}

	.palette-trigger kbd {
		font: inherit;
	}

	/* Mobile: hide section labels (use ⌘K to navigate); keep logo + palette. */
	@media (max-width: 720px) {
		.sections {
			display: none;
		}
		.inner {
			padding: 0 var(--section-pad-x-mobile);
			justify-content: space-between;
		}
		.palette-trigger {
			margin-left: auto;
		}
	}
</style>
