import { describe, it, expect } from 'vitest'
import kebabLower from './kebab-lower'
import snakeLower from './snake-lower'
import sanitizeString from './sanitize-string'

describe('String Module', () => {
	describe('sanitizeString', () => {
		it('should trim whitespace', () => {
			expect(sanitizeString('  hello  ')).toBe('hello')
		})

		it('should fallback if input is null/undefined', () => {
			expect(sanitizeString(null)).toBe('')
			expect(sanitizeString(undefined)).toBe('')
			expect(sanitizeString(undefined, 'fallback')).toBe('fallback')
		})

		it('should convert numbers to string', () => {
			// Implementation: "Number.isFinite(value) || typeof value === 'string'"
			expect(sanitizeString(123 as any)).toBe('123')
		})

		// Note: Regex replacements are hard to test perfectly without knowing exact regex implementation,
		// but we can test general behavior.
		it('should normalize multiple spaces', () => {
			expect(sanitizeString('a   b')).toBe('a b')
		})

		it('should clean control chars', () => {
			// \u0000 is generic null char
			expect(sanitizeString('\u0000hello')).toBe('hello')
		})
	})

	describe('kebabLower', () => {
		it('should convert string to kebab-case and lowercase', () => {
			expect(kebabLower('Hello World')).toBe('hello-world')
			expect(kebabLower('Hello   World')).toBe('hello-world')
			expect(kebabLower('  Hello World  ')).toBe('hello-world')
		})

		it('should handle null/undefined', () => {
			expect(kebabLower(null)).toBe('')
			expect(kebabLower(undefined)).toBe('')
		})
	})

	describe('snakeLower', () => {
		it('should convert string to snake_case and lowercase', () => {
			expect(snakeLower('Hello World')).toBe('hello_world')
			expect(snakeLower('Hello   World')).toBe('hello_world')
		})

		it('should handle null/undefined', () => {
			expect(snakeLower(null)).toBe('')
		})
	})
})
