<script lang="ts">
	import { GameBoard } from '$lib/components';
</script>

<svelte:head>
	<title>Blackjack | Classic Casino Card Game</title>
	<meta
		name="description"
		content="Play Blackjack online - a free web-based casino card game with betting, splitting, doubling down and more"
	/>
	<meta name="keywords" content="blackjack, card game, casino game, 21, web game" />
	<meta name="author" content="Abernaughty" />
	<meta name="theme-color" content="#468C4E" />
</svelte:head>

<div class="page-wrapper">
	<GameBoard />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
</style>
