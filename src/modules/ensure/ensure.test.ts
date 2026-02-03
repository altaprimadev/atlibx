import { describe, it, expect } from 'vitest'
import ensureArray from './ensure-array'
import ensureFiniteNumber from './ensure-finite-number'

describe('Ensure Module', () => {
	describe('ensureArray', () => {
		it('should return empty array for undefined or null', () => {
			expect(ensureArray(undefined)).toEqual([])
			expect(ensureArray(null)).toEqual([])
		})

		it('should return the array itself if input is an array', () => {
			const arr = [1, 2, 3]
			expect(ensureArray(arr)).toBe(arr) // Reference check
		})

		it('should wrap single value in an array', () => {
			expect(ensureArray(1)).toEqual([1])
			expect(ensureArray('string')).toEqual(['string'])
			expect(ensureArray({ a: 1 })).toEqual([{ a: 1 }])
		})
	})

	describe('ensureFiniteNumber', () => {
		it('should return the number if it is finite', () => {
			expect(ensureFiniteNumber(123)).toBe(123)
			expect(ensureFiniteNumber(-1.5)).toBe(-1.5)
			expect(ensureFiniteNumber(0)).toBe(0)
		})

		it('should return default value for non-finite numbers', () => {
			expect(ensureFiniteNumber(Infinity)).toBe(0)
			expect(ensureFiniteNumber(-Infinity)).toBe(0)
			expect(ensureFiniteNumber(NaN)).toBe(0)
		})

		it('should return default value for non-number types', () => {
			expect(ensureFiniteNumber('123')).toBe(0)
			expect(ensureFiniteNumber(null)).toBe(0)
			expect(ensureFiniteNumber(undefined)).toBe(0)
		})

		it('should support custom default value', () => {
			expect(ensureFiniteNumber(NaN, 10)).toBe(10)
			expect(ensureFiniteNumber('invalid', -1)).toBe(-1)
		})
	})
})
