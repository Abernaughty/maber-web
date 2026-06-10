import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatRelativeDate } from './formatting.js';

describe('formatDate', () => {
	it('formats a Date with the default long format', () => {
		expect(formatDate(new Date(2026, 0, 30))).toBe('January 30, 2026');
	});

	it('accepts a date string', () => {
		expect(formatDate('2026-01-30T12:00:00')).toBe('January 30, 2026');
	});

	it('respects custom Intl options', () => {
		expect(formatDate(new Date(2026, 0, 30), { year: 'numeric', month: 'short' })).toBe(
			'Jan 2026'
		);
	});
});

describe('formatRelativeDate', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const secondsAgo = (s: number) => new Date(Date.now() - s * 1000);

	it('returns "just now" for under a minute', () => {
		expect(formatRelativeDate(secondsAgo(0))).toBe('just now');
		expect(formatRelativeDate(secondsAgo(59))).toBe('just now');
	});

	it('returns minutes for under an hour', () => {
		expect(formatRelativeDate(secondsAgo(60))).toBe('1m ago');
		expect(formatRelativeDate(secondsAgo(59 * 60))).toBe('59m ago');
	});

	it('returns hours for under a day', () => {
		expect(formatRelativeDate(secondsAgo(60 * 60))).toBe('1h ago');
		expect(formatRelativeDate(secondsAgo(23 * 60 * 60))).toBe('23h ago');
	});

	it('returns days for under 30 days', () => {
		expect(formatRelativeDate(secondsAgo(24 * 60 * 60))).toBe('1d ago');
		expect(formatRelativeDate(secondsAgo(29 * 24 * 60 * 60))).toBe('29d ago');
	});

	it('falls back to an absolute date at 30 days and beyond', () => {
		expect(formatRelativeDate(secondsAgo(30 * 24 * 60 * 60))).toBe('May 11, 2026');
	});

	it('accepts a date string', () => {
		expect(formatRelativeDate(secondsAgo(5 * 60).toISOString())).toBe('5m ago');
	});
});
