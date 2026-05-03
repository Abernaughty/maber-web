<script lang="ts">
	/**
	 * `$ cmd` prompt primitive — the leading cyan dollar sign + dim-mono
	 * command label that introduces each Hero terminal line.
	 *
	 * Rendered inline; consumers compose it with their typed-text body:
	 *
	 *   <TerminalPrompt cmd="whoami" />
	 *   <span>{typed.text}</span>
	 */

	interface Props {
		/** The text after `$`, e.g. `whoami` or `cat /etc/about`. */
		cmd: string;
	}

	const { cmd }: Props = $props();
</script>

<span class="prompt">
	<span class="dollar">$</span>
	<span class="cmd">{cmd}</span>
</span>

<style>
	.prompt {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		color: var(--dim);
		display: inline-flex;
		gap: var(--space-2);
		align-items: baseline;
		margin-right: var(--space-3);
	}

	.dollar {
		color: var(--accent);
	}

	.cmd {
		color: var(--dim);
	}
</style>
