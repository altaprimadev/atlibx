import { describe, it, expect } from 'vitest'
import flatten from './flatten'
import unflatten from './unflatten'

describe('Array Module', () => {
	describe('flatten', () => {
		it('should flatten an array of objects based on headers', () => {
			const headers = ['id', 'name']
			const data = [
				{ id: 1, name: 'Alice', age: 25 }, // age should be ignored
				{ id: 2, name: 'Bob' },
			]

			const result = flatten(headers, data)

			expect(result).toHaveProperty('h', headers)
			expect(result[0]).toEqual([1, 'Alice'])
			expect(result[1]).toEqual([2, 'Bob'])
			expect(Object.keys(result).length).toBe(3) // h, 0, 1
		})

		it('should handle undefined values for missing keys', () => {
			const headers = ['id', 'name']
			const data = [{ id: 1 }] // name missing

			const result = flatten(headers, data)
			expect(result[0]).toEqual([1, undefined])
		})

		it('should handle empty data', () => {
			const headers = ['id']
			const data: any[] = []
			const result = flatten(headers, data)
			expect(result).toHaveProperty('h', headers)
			expect(result[0]).toBeUndefined()
		})
	})

	describe('unflatten', () => {
		it('should unflatten a payload back to array of objects', () => {
			const payload = {
				h: ['id', 'name'],
				0: [1, 'Alice'],
				1: [2, 'Bob'],
			}

			const result = unflatten(payload)

			expect(result).toHaveLength(2)
			expect(result[0]).toEqual({ id: 1, name: 'Alice' })
			expect(result[1]).toEqual({ id: 2, name: 'Bob' })
		})

		it('should throw error if "h" is missing', () => {
			const payload = { 0: [1] }
			expect(() => unflatten(payload as any)).toThrow('unflatten: missing "h"')
		})

		it('should handle partial rows gracefully (undefined)', () => {
			const payload = {
				h: ['id', 'name'],
				0: [1], // name missing
			}

			const result = unflatten(payload)
			expect(result[0]).toEqual({ id: 1, name: undefined })
		})
	})
})
