/**
 * Deck management - creation and shuffling
 */

import type { Card } from './types';
import { SUITS, VALUES } from './types';

/** Create a standard 52-card deck */
export function createDeck(): Card[] {
	const deck: Card[] = [];

	for (const suit of SUITS) {
		for (const value of VALUES) {
			deck.push({
				value,
				suit,
				imgPath: `/images/card_faces/${value}${suit}.png`
			});
		}
	}

	return deck;
}

/** Fisher-Yates shuffle algorithm */
export function shuffle(deck: Card[]): Card[] {
	const shuffled = [...deck];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
}

/** Create a new shuffled deck */
export function createShuffledDeck(): Card[] {
	return shuffle(createDeck());
}

/** Draw a card from the top of the deck (pop) */
export function drawCard(deck: Card[]): { card: Card; deck: Card[] } {
	if (deck.length === 0) {
		// Reshuffle if deck is empty
		const newDeck = createShuffledDeck();
		const card = newDeck.pop()!;
		return { card, deck: newDeck };
	}

	const newDeck = [...deck];
	const card = newDeck.pop()!;
	return { card, deck: newDeck };
}
