<script lang="ts">
	interface Props {
		copyright?: string;
	}

	let { copyright = `© ${new Date().getFullYear()} Michael Abernathy` }: Props = $props();
</script>

<footer class="w-full border-t border-gray-200 bg-white">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
		<p class="text-sm text-gray-500">{copyright}</p>
		<a
			href="https://github.com/Abernaughty"
			target="_blank"
			rel="noopener noreferrer"
			class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
		>
			GitHub
		</a>
	</div>
</footer>
