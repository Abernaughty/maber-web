<script lang="ts">
	import { onMount } from 'svelte';
	import { FluidSimulation } from '$lib/fluid';

	let canvas: HTMLCanvasElement;
	let simulation: FluidSimulation | null = null;

	onMount(() => {
		// Set initial canvas size
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Check WebGL support
		const gl =
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl');

		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		simulation = new FluidSimulation(canvas);

		return () => {
			simulation?.destroy();
		};
	});
</script>

<canvas bind:this={canvas} id="fluid-canvas"></canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
