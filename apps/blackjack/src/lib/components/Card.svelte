<script lang="ts">
	import type { Card } from '$lib/game/types';

	let { card, faceDown = false }: { card: Card; faceDown?: boolean } = $props();

	const src = $derived(faceDown ? '/images/card_faces/red_back.png' : card.imgPath);
	const alt = $derived(faceDown ? 'Card back' : `${card.value} of ${card.suit}`);
</script>

<div class="card" class:face-down={faceDown}>
	<img {src} {alt} draggable="false" />
</div>

<style>
	.card {
		width: 80px;
		height: 116px;
		margin: 0 -15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
		transition: transform 0.3s ease;
		overflow: hidden;
		flex-shrink: 0;
	}

	.card:hover {
		transform: translateY(-5px);
		z-index: 10;
	}

	.card img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}

	@media (max-width: 768px) {
		.card {
			width: 60px;
			height: 87px;
			margin: 0 -10px;
		}
	}

	@media (max-width: 480px) {
		.card {
			width: 50px;
			height: 73px;
			margin: 0 -8px;
		}
	}
</style>
