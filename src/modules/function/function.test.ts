import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { debounce, throttle, detectAnomalies, detectAnomaliesFast } from './index'
import type { KeyValueData } from './types'

describe('function module', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('debounce', () => {
		it('should delay execution', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100)

			debounced()
			expect(func).not.toHaveBeenCalled()

			vi.advanceTimersByTime(50)
			expect(func).not.toHaveBeenCalled()

			debounced()
			vi.advanceTimersByTime(50)
			expect(func).not.toHaveBeenCalled()

			vi.advanceTimersByTime(50)
			expect(func).toHaveBeenCalledTimes(1)
		})

		it('should execute on leading edge if specified', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100, { leading: true })

			debounced()
			expect(func).toHaveBeenCalledTimes(1)

			debounced()
			vi.advanceTimersByTime(100)
			expect(func).toHaveBeenCalledTimes(2)
		})

		it('should cancel delayed execution', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100)

			debounced()
			debounced.cancel()

			vi.advanceTimersByTime(100)
			expect(func).not.toHaveBeenCalled()
		})

		it('should flush delayed execution', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100)

			debounced()
			debounced.flush()

			expect(func).toHaveBeenCalledTimes(1)
			vi.advanceTimersByTime(100)
			expect(func).toHaveBeenCalledTimes(1) // Should not be called again
		})

		it('should pass arguments to the debounced function', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100)

			debounced('hello', 'world')
			vi.advanceTimersByTime(100)

			expect(func).toHaveBeenCalledWith('hello', 'world')
		})

		it('should handle maxWait option', () => {
			const func = vi.fn()
			const debounced = debounce(func, 100, { maxWait: 150 })

			debounced()
			vi.advanceTimersByTime(50)
			debounced()
			vi.advanceTimersByTime(50)
			debounced() // 100ms passed total

			expect(func).not.toHaveBeenCalled()

			vi.advanceTimersByTime(50) // 150ms passed total, maxWait triggered
			expect(func).toHaveBeenCalledTimes(1)
		})
	})

	describe('throttle', () => {
		it('should throttle execution', () => {
			const func = vi.fn()
			const throttled = throttle(func, 100)

			throttled()
			expect(func).toHaveBeenCalledTimes(1)

			throttled()
			throttled()
			expect(func).toHaveBeenCalledTimes(1)

			vi.advanceTimersByTime(100)
			expect(func).toHaveBeenCalledTimes(2)
		})

		it('should pass arguments to the throttled function', () => {
			const func = vi.fn()
			const throttled = throttle(func, 100)

			throttled('hello', 'world')
			expect(func).toHaveBeenCalledWith('hello', 'world')
		})

		it('should cancel throttled execution', () => {
			const func = vi.fn()
			const throttled = throttle(func, 100)

			throttled() // Called immediately (leading edge)
			expect(func).toHaveBeenCalledTimes(1)

			throttled() // Queued for trailing edge
			throttled.cancel()

			vi.advanceTimersByTime(100)
			expect(func).toHaveBeenCalledTimes(1) // Trailing edge execution was canceled
		})

		it('should flush throttled execution', () => {
			const func = vi.fn()
			const throttled = throttle(func, 100)

			throttled() // Called immediately
			throttled() // Queued

			throttled.flush()
			expect(func).toHaveBeenCalledTimes(2)

			vi.advanceTimersByTime(100)
			expect(func).toHaveBeenCalledTimes(2) // Not called again
		})
	})
})

// ── detectAnomalies ─────────────────────────────────────────────────────

describe('detectAnomalies', () => {
	it('should return empty results for empty data', () => {
		const result = detectAnomalies([])

		expect(result).toEqual({
			mean: 0,
			stdDev: 0,
			threshold: 2,
			upperBound: 0,
			lowerBound: 0,
			totalData: 0,
			totalAnomalies: 0,
			totalNormal: 0,
			min: 0,
			max: 0,
			results: [],
			anomalies: [],
			normals: [],
		})
	})

	it('should handle single element (stdDev = 0)', () => {
		const data: KeyValueData[] = [{ key: 'a', value: 5 }]
		const result = detectAnomalies(data)

		expect(result.mean).toBe(5)
		expect(result.stdDev).toBe(0)
		expect(result.totalData).toBe(1)
		expect(result.totalAnomalies).toBe(0)
		expect(result.totalNormal).toBe(1)
		expect(result.results[0].zScore).toBe(0)
		expect(result.results[0].deviation).toBe(0)
		expect(result.results[0].isAnomaly).toBe(false)
	})

	it('should treat all values as normal when all values are identical', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
		]
		const result = detectAnomalies(data)

		expect(result.stdDev).toBe(0)
		expect(result.mean).toBe(10)
		expect(result.totalAnomalies).toBe(0)
		expect(result.totalNormal).toBe(3)
	})

	it('should detect anomalies with default threshold (2)', () => {
		// many identical values + one extreme outlier to ensure it exceeds 2σ
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: 500 },
		]
		const result = detectAnomalies(data)

		expect(result.totalData).toBe(10)
		expect(result.anomalies.length).toBeGreaterThan(0)
		expect(result.anomalies.some((a) => a.key === 'outlier')).toBe(true)
		expect(result.totalAnomalies + result.totalNormal).toBe(result.totalData)
		expect(result.results.length).toBe(10)
	})

	it('should respect custom threshold', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 1 },
			{ key: 'b', value: 2 },
			{ key: 'c', value: 3 },
			{ key: 'd', value: 4 },
			{ key: 'e', value: 5 },
		]

		const strict = detectAnomalies(data, 0.5)
		const loose = detectAnomalies(data, 5)

		// stricter threshold → more anomalies
		expect(strict.totalAnomalies).toBeGreaterThanOrEqual(loose.totalAnomalies)
	})

	it('should compute correct mean and stdDev', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 2 },
			{ key: 'b', value: 4 },
			{ key: 'c', value: 4 },
			{ key: 'd', value: 4 },
			{ key: 'e', value: 5 },
			{ key: 'f', value: 5 },
			{ key: 'g', value: 7 },
			{ key: 'h', value: 9 },
		]
		const result = detectAnomalies(data)

		expect(result.mean).toBe(5)
		expect(result.stdDev).toBeCloseTo(2, 5)
		expect(result.upperBound).toBeCloseTo(9, 5)
		expect(result.lowerBound).toBeCloseTo(1, 5)
	})

	it('should produce correct zScore and deviation values', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 2 },
			{ key: 'b', value: 4 },
			{ key: 'c', value: 4 },
			{ key: 'd', value: 4 },
			{ key: 'e', value: 5 },
			{ key: 'f', value: 5 },
			{ key: 'g', value: 7 },
			{ key: 'h', value: 9 },
		]
		const result = detectAnomalies(data)

		for (const r of result.results) {
			expect(r.deviation).toBeCloseTo(Math.abs(r.value - result.mean), 10)
			expect(r.zScore).toBeCloseTo((r.value - result.mean) / result.stdDev, 10)
		}
	})

	it('should separate anomalies and normals correctly', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: 500 },
		]
		const result = detectAnomalies(data)

		expect(result.results.filter((r) => r.isAnomaly)).toEqual(result.anomalies)
		expect(result.results.filter((r) => !r.isAnomaly)).toEqual(result.normals)
	})

	it('should detect negative anomalies', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: -400 },
		]
		const result = detectAnomalies(data)

		expect(result.anomalies.some((a) => a.key === 'outlier')).toBe(true)
	})
})

// ── detectAnomaliesFast ─────────────────────────────────────────────────

describe('detectAnomaliesFast', () => {
	it('should return empty results for empty data', () => {
		const result = detectAnomaliesFast([])

		expect(result).toEqual({ anomalies: [], mean: 0, stdDev: 0, min: 0, max: 0 })
	})

	it('should handle single element (no anomaly)', () => {
		const data: KeyValueData[] = [{ key: 'a', value: 42 }]
		const result = detectAnomaliesFast(data)

		expect(result.mean).toBe(42)
		expect(result.stdDev).toBe(0)
		expect(result.anomalies).toHaveLength(0)
	})

	it('should return no anomalies when all values are identical', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 7 },
			{ key: 'b', value: 7 },
			{ key: 'c', value: 7 },
		]
		const result = detectAnomaliesFast(data)

		expect(result.anomalies).toHaveLength(0)
		expect(result.mean).toBe(7)
		expect(result.stdDev).toBe(0)
	})

	it('should detect anomalies with default threshold (2)', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: 500 },
		]
		const result = detectAnomaliesFast(data)

		expect(result.anomalies.length).toBeGreaterThan(0)
		expect(result.anomalies.some((a) => a.key === 'outlier')).toBe(true)
	})

	it('should respect custom threshold', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 1 },
			{ key: 'b', value: 2 },
			{ key: 'c', value: 3 },
			{ key: 'd', value: 4 },
			{ key: 'e', value: 5 },
		]

		const strict = detectAnomaliesFast(data, 0.5)
		const loose = detectAnomaliesFast(data, 5)

		expect(strict.anomalies.length).toBeGreaterThanOrEqual(loose.anomalies.length)
	})

	it('should compute correct mean and stdDev', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 2 },
			{ key: 'b', value: 4 },
			{ key: 'c', value: 4 },
			{ key: 'd', value: 4 },
			{ key: 'e', value: 5 },
			{ key: 'f', value: 5 },
			{ key: 'g', value: 7 },
			{ key: 'h', value: 9 },
		]
		const result = detectAnomaliesFast(data)

		expect(result.mean).toBe(5)
		expect(result.stdDev).toBeCloseTo(2, 5)
	})

	it('should detect negative outliers', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: -400 },
		]
		const result = detectAnomaliesFast(data)

		expect(result.anomalies.some((a) => a.key === 'outlier')).toBe(true)
	})

	it('should return the original KeyValueData objects as anomalies', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'i', value: 10 },
			{ key: 'outlier', value: 500 },
		]
		const result = detectAnomaliesFast(data)

		for (const anomaly of result.anomalies) {
			expect(anomaly).toHaveProperty('key')
			expect(anomaly).toHaveProperty('value')
			// should NOT have extended AnomalyResult fields
			expect(anomaly).not.toHaveProperty('isAnomaly')
			expect(anomaly).not.toHaveProperty('zScore')
		}
	})
})

// ── Cross-function consistency ──────────────────────────────────────────

describe('detectAnomalies vs detectAnomaliesFast consistency', () => {
	it('should agree on mean, stdDev, and boundaries', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 3 },
			{ key: 'b', value: 7 },
			{ key: 'c', value: 12 },
			{ key: 'd', value: 5 },
			{ key: 'e', value: 50 },
		]

		const full = detectAnomalies(data)
		const fast = detectAnomaliesFast(data)

		expect(full.mean).toBeCloseTo(fast.mean, 10)
		expect(full.stdDev).toBeCloseTo(fast.stdDev, 10)
		expect(full.min).toBe(fast.min)
		expect(full.max).toBe(fast.max)
		expect(full.minNormal).toBe(fast.minNormal)
		expect(full.maxNormal).toBe(fast.maxNormal)
		expect(full.minAnomaly).toBe(fast.minAnomaly)
		expect(full.maxAnomaly).toBe(fast.maxAnomaly)
	})

	it('should identify the same anomaly keys', () => {
		const data: KeyValueData[] = [
			{ key: 'a', value: 10 },
			{ key: 'b', value: 10 },
			{ key: 'c', value: 10 },
			{ key: 'd', value: 10 },
			{ key: 'e', value: 10 },
			{ key: 'f', value: 10 },
			{ key: 'g', value: 10 },
			{ key: 'h', value: 10 },
			{ key: 'outlier_high', value: 500 },
			{ key: 'outlier_low', value: -400 },
		]

		const fullKeys = detectAnomalies(data)
			.anomalies.map((a) => a.key)
			.sort()
		const fastKeys = detectAnomaliesFast(data)
			.anomalies.map((a) => a.key)
			.sort()

		expect(fullKeys).toEqual(fastKeys)
	})
})
