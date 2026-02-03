import { describe, it, expect } from 'vitest'
import hasKey from './has-key'
import isRecord from './is-record'
import jsonSafeParse from './json-safe-parse'
import sanitizeObject from './sanitize-object'

describe('Object Module', () => {
	describe('hasKey', () => {
		it('should return true if object has key', () => {
			expect(hasKey({ a: 1 }, 'a')).toBe(true)
		})
		it('should return false if object fails to have key', () => {
			expect(hasKey({}, 'a')).toBe(false)
			expect(hasKey(null, 'a')).toBe(false)
		})
	})

	describe('isRecord', () => {
		it('should return true for objects and arrays', () => {
			expect(isRecord({})).toBe(true)
			expect(isRecord({ a: 1 })).toBe(true)
			expect(isRecord([])).toBe(true) // Implementation allows arrays
		})
		it('should return false for null or primitives', () => {
			expect(isRecord(null)).toBe(false)
			expect(isRecord(1)).toBe(false)
			expect(isRecord('str')).toBe(false)
		})
	})

	describe('jsonSafeParse', () => {
		it('should parse valid JSON', () => {
			expect(jsonSafeParse('{"a":1}')).toEqual({ isValid: true, value: { a: 1 } })
		})
		it('should return failure for invalid JSON', () => {
			expect(jsonSafeParse('invalid')).toEqual({ isValid: false, value: null })
		})
	})

	describe('sanitizeObject', () => {
		it('should remove null and undefined', () => {
			const input = { a: 1, b: null, c: undefined }
			expect(sanitizeObject(input)).toEqual({ a: 1 })
		})

		it('should remove non-finite numbers', () => {
			const input = { a: 1, b: Infinity, c: NaN }
			expect(sanitizeObject(input)).toEqual({ a: 1 })
		})

		it('should recurse', () => {
			const input = { a: { b: null, c: 2 } }
			expect(sanitizeObject(input)).toEqual({ a: { c: 2 } })
		})

		it('should remove empty nested objects/arrays', () => {
			const input = { a: { b: null }, c: [] }
			expect(sanitizeObject(input)).toEqual({})
		})

		it('should handle noEmptyString option', () => {
			const input = { a: '', b: ' ' }
			// default: keep empty string
			expect(sanitizeObject(input)).toEqual({ a: '', b: ' ' })

			// option true: removes empty and whitespace-only strings
			expect(sanitizeObject(input, { noEmptyString: true })).toEqual({})
		})

		it('should return Date as-is (early return)', () => {
			const date = new Date('2024-01-01')
			expect(sanitizeObject(date as any)).toBe(date)
		})

		it('should preserve nested Date values', () => {
			const date = new Date('2024-01-01')
			const input = { created: date, name: 'test' }
			expect(sanitizeObject(input)).toEqual({ created: date, name: 'test' })
		})

		it('should sanitize array of objects', () => {
			const input = { items: [{ a: 1, b: null }, { c: 2 }] }
			expect(sanitizeObject(input)).toEqual({ items: [{ a: 1 }, { c: 2 }] })
		})

		it('should preserve primitives and Dates in arrays', () => {
			const date = new Date('2024-01-01')
			const input = { items: [1, 'str', date] }
			expect(sanitizeObject(input)).toEqual({ items: [1, 'str', date] })
		})
	})
})
