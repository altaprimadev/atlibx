import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { debounce, throttle } from './index'

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
