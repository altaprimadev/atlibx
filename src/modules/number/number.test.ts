import { describe, expect, it } from 'vitest'
import { ensureFiniteNumber, roundToPrecision } from './index'

describe('Number Module', () => {
	describe('ensureFiniteNumber', () => {
		it('should return the number if it is finite', () => {
			expect(ensureFiniteNumber(123)).toBe(123)
			expect(ensureFiniteNumber(0)).toBe(0)
			expect(ensureFiniteNumber(-1.5)).toBe(-1.5)
		})

		it('should return default value if number is not finite', () => {
			expect(ensureFiniteNumber(Infinity)).toBe(0)
			expect(ensureFiniteNumber(-Infinity)).toBe(0)
			expect(ensureFiniteNumber(NaN)).toBe(0)
		})

		it('should return custom default value if number is not finite', () => {
			expect(ensureFiniteNumber(NaN, 100)).toBe(100)
			expect(ensureFiniteNumber(Infinity, -1)).toBe(-1)
		})

		it('should return default value for non-number types', () => {
			expect(ensureFiniteNumber('123')).toBe(0)
			expect(ensureFiniteNumber(null)).toBe(0)
			expect(ensureFiniteNumber(undefined)).toBe(0)
			expect(ensureFiniteNumber({})).toBe(0)
		})
	})

	describe('roundToPrecision', () => {
		it('should round to default precision (2 decimal places, halfExpand)', () => {
			expect(roundToPrecision(1.234)).toBe(1.23)
			expect(roundToPrecision(1.235)).toBe(1.24)
			expect(roundToPrecision(1.236)).toBe(1.24)
		})

		it('should respect maxFractionDigits', () => {
			expect(roundToPrecision(1.2345, { maxFractionDigits: 3, roundingMode: 'halfExpand' })).toBe(1.235)
			expect(roundToPrecision(1.2, { maxFractionDigits: 3, roundingMode: 'halfExpand' })).toBe(1.2)
		})

		it('should respect minFractionDigits', () => {
			// Note: roundToPrecision returns parseFloat(decimalString), so trailing zeros in the decimal string will be lost if returned as a number.
			// However, minFractionDigits affects how it rounds if combined with maxFractionDigits or roundingMode.
			// Actually, if we want to ensure a certain number of digits, we might expect a string, but the function returns a number.
			expect(roundToPrecision(1, { minFractionDigits: 2, roundingMode: 'halfExpand' })).toBe(1)
		})

		it('should respect different roundingModes', () => {
			// ceil: rounds towards positive infinity
			expect(roundToPrecision(1.234, { maxFractionDigits: 2, roundingMode: 'ceil' })).toBe(1.24)
			expect(roundToPrecision(-1.234, { maxFractionDigits: 2, roundingMode: 'ceil' })).toBe(-1.23)

			// floor: rounds towards negative infinity
			expect(roundToPrecision(1.236, { maxFractionDigits: 2, roundingMode: 'floor' })).toBe(1.23)
			expect(roundToPrecision(-1.236, { maxFractionDigits: 2, roundingMode: 'floor' })).toBe(-1.24)

			// trunc: rounds towards zero
			expect(roundToPrecision(1.236, { maxFractionDigits: 2, roundingMode: 'trunc' })).toBe(1.23)
			expect(roundToPrecision(-1.236, { maxFractionDigits: 2, roundingMode: 'trunc' })).toBe(-1.23)

			// halfEven: rounds towards the nearest neighbor. If both neighbors are equidistant, it rounds towards the neighbor that is even (Banker's rounding).
			expect(roundToPrecision(1.235, { maxFractionDigits: 2, roundingMode: 'halfEven' })).toBe(1.24)
			expect(roundToPrecision(1.225, { maxFractionDigits: 2, roundingMode: 'halfEven' })).toBe(1.22)
		})

		it('should return original value if it is not finite', () => {
			expect(roundToPrecision(Infinity)).toBe(Infinity)
			expect(roundToPrecision(-Infinity)).toBe(-Infinity)
			expect(roundToPrecision(NaN)).toBe(NaN)
		})
	})
})
