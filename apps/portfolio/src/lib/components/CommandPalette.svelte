<script lang="ts">
	import { onMount } from 'svelte';
	import { SECTIONS, type Section } from '$lib/constants/sections';
	import { smoothScrollTo } from '$lib/hooks/useSmoothScroll.svelte';

	interface Props {
		/** Bind from parent: `<CommandPalette bind:open />`. */
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	let query = $state('');
	let highlighted = $state(0);
	let inputEl: HTMLInputElement | undefined = $state(undefined);
	let dialogEl: HTMLDivElement | undefined = $state(undefined);

	const results = $derived.by<Section[]>(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [...SECTIONS];
		return SECTIONS.filter(
			(s) =>
				s.label.toLowerCase().includes(q) ||
				(s.hint?.toLowerCase().includes(q) ?? false)
		);
	});

	// Reset state and focus input when the palette opens. Keep highlighted
	// in range when the query changes.
	$effect(() => {
		if (open) {
			query = '';
			highlighted = 0;
			// Focus on next tick so the input exists in the DOM.
			queueMicrotask(() => inputEl?.focus());
		}
	});

	$effect(() => {
		if (highlighted >= results.length) {
			highlighted = Math.max(0, results.length - 1);
		}
	});

	function close() {
		open = false;
	}

	function jump(section: Section) {
		close();
		// Wait one frame for the modal to unmount before scrolling so focus
		// returns cleanly to the page body.
		requestAnimationFrame(() => smoothScrollTo(section.id));
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlighted = (highlighted + 1) % Math.max(1, results.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlighted =
				(highlighted - 1 + Math.max(1, results.length)) %
				Math.max(1, results.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const target = results[highlighted];
			if (target) jump(target);
		} else if (event.key === 'Tab') {
			// Trap focus inside the dialog.
			event.preventDefault();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		// Only close when clicking the backdrop itself, not bubbled clicks
		// from the inner dialog.
		if (event.target === event.currentTarget) {
			close();
		}
	}

	// Global ⌘K / Ctrl+K listener. Mounted once at the layout level via this
	// component instance.
	onMount(() => {
		function onGlobalKey(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				open = !open;
			}
		}
		window.addEventListener('keydown', onGlobalKey);
		return () => window.removeEventListener('keydown', onGlobalKey);
	});
</script>

{#if open}
	<div
		class="backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="Command palette"
		onclick={handleBackdropClick}
		onkeydown={handleKey}
		bind:this={dialogEl}
		tabindex="-1"
	>
		<div class="palette">
			<div class="prompt">
				<span class="caret">❯</span>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					placeholder="jump to section…"
					autocomplete="off"
					spellcheck="false"
				/>
				<kbd class="esc">esc</kbd>
			</div>
			{#if results.length > 0}
				<ul class="results">
					{#each results as section, i (section.id)}
						<li>
							<button
								type="button"
								class:highlighted={i === highlighted}
								onclick={() => jump(section)}
								onmouseenter={() => (highlighted = i)}
							>
								<span class="bracket">[</span>
								<span class="label">{section.label}</span>
								<span class="bracket">]</span>
								{#if section.hint}
									<span class="hint">{section.hint}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">no matches</div>
			{/if}
			<div class="footer">
				<span><kbd>↑↓</kbd> navigate</span>
				<span><kbd>↵</kbd> jump</span>
				<span><kbd>esc</kbd> close</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		background: rgba(10, 11, 10, 0.6);
		backdrop-filter: var(--blur-backdrop);
		display: grid;
		place-items: start center;
		padding-top: 12vh;
		animation: fade-in var(--transition-fast);
	}

	.palette {
		width: min(560px, calc(100vw - 2 * var(--space-4)));
		background: var(--panel);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		overflow: hidden;
		animation: slide-in var(--transition-fast);
	}

	.prompt {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.caret {
		color: var(--accent);
		font-weight: var(--fw-bold);
	}

	.prompt input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		color: var(--text);
		font: inherit;
	}

	.prompt input::placeholder {
		color: var(--dim);
	}

	.esc {
		font-size: var(--fs-micro);
		color: var(--dim);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 2px var(--space-1);
	}

	.results {
		list-style: none;
		max-height: 320px;
		overflow-y: auto;
	}

	.results button {
		width: 100%;
		text-align: left;
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		color: var(--muted);
		transition: background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.results button:hover,
	.results button.highlighted {
		background: var(--accent-glow);
		color: var(--text);
	}

	.results .bracket {
		color: var(--dim);
	}

	.results .label {
		color: var(--accent);
		min-width: 70px;
	}

	.results .hint {
		color: var(--muted);
		font-size: var(--fs-micro);
		margin-left: auto;
	}

	.empty {
		padding: var(--space-6) var(--space-4);
		text-align: center;
		color: var(--dim);
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-4);
		padding: var(--space-2) var(--space-4);
		border-top: 1px solid var(--border);
		font-size: var(--fs-micro);
		color: var(--dim);
	}

	.footer kbd {
		font-size: var(--fs-micro);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 1px 4px;
		margin-right: 4px;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
