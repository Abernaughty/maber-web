/**
 * Game state persistence using localStorage
 */

import { DEFAULT_BALANCE, DEFAULT_BET } from './types';

const STORAGE_KEYS = {
	balance: 'blackjack_balance',
	previousBet: 'blackjack_previous_bet'
} as const;

function isLocalStorageAvailable(): boolean {
	try {
		const test = '__storage_test__';
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

function save(key: string, value: string): boolean {
	if (!isLocalStorageAvailable()) return false;
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

function load(key: string): string | null {
	if (!isLocalStorageAvailable()) return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

/** Save balance and previous bet to localStorage */
export function saveGameData(balance: number, previousBet: number): void {
	save(STORAGE_KEYS.balance, String(balance));
	save(STORAGE_KEYS.previousBet, String(previousBet));
}

/** Load balance and previous bet from localStorage */
export function loadGameData(): { balance: number; previousBet: number } {
	const savedBalance = load(STORAGE_KEYS.balance);
	const savedPreviousBet = load(STORAGE_KEYS.previousBet);

	return {
		balance: savedBalance ? parseInt(savedBalance, 10) : DEFAULT_BALANCE,
		previousBet: savedPreviousBet ? parseInt(savedPreviousBet, 10) : DEFAULT_BET
	};
}

/** Clear all game data from localStorage */
export function clearGameData(): void {
	if (!isLocalStorageAvailable()) return;
	try {
		localStorage.removeItem(STORAGE_KEYS.balance);
		localStorage.removeItem(STORAGE_KEYS.previousBet);
	} catch {
		// silently fail
	}
}
