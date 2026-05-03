<script lang="ts">
	/**
	 * Single expandable Q/A card. Default state shows the question; click
	 * to expand the answer. Same `grid-template-rows: 0fr → 1fr` animation
	 * trick as ProjectRow.
	 *
	 * Spec §7 §4.
	 */

	interface Props {
		question: string;
		answer: string;
	}

	const { question, answer }: Props = $props();

	let open = $state(false);

	function toggle() {
		open = !open;
	}
</script>

<article class="card" class:open>
	<button class="header" type="button" onclick={toggle} aria-expanded={open}>
		<span class="prefix">Q:</span>
		<span class="question">{question}</span>
		<span class="caret" aria-hidden="true">{open ? '−' : '+'}</span>
	</button>
	<div class="panel" class:open>
		<div class="panel-inner">
			<span class="prefix answer-prefix">A:</span>
			<p class="answer">{answer}</p>
		</div>
	</div>
</article>

<style>
	.card {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--panel-2);
		overflow: hidden;
		transition: border-color var(--transition-fast);
	}

	.card:hover {
		border-color: var(--border-strong);
	}

	.card.open {
		border-color: var(--accent-dim);
	}

	.header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-3);
		align-items: baseline;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--text);
		cursor: pointer;
	}

	.prefix {
		color: var(--accent);
		font-weight: var(--fw-bold);
	}

	.question {
		color: var(--text);
		line-height: var(--lh-snug);
	}

	.caret {
		color: var(--accent);
		font-family: var(--font-mono);
		width: 1.5em;
		text-align: center;
	}

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
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		padding: 0 var(--space-4);
	}

	.panel.open .panel-inner {
		padding-bottom: var(--space-4);
	}

	.answer-prefix {
		align-self: flex-start;
		padding-top: 2px;
	}

	.answer {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		line-height: var(--lh-relaxed);
		max-width: 60ch;
	}
</style>
