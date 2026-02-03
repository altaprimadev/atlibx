import { describe, it, expect, vi } from 'vitest'
import sleep from './sleep'

describe('Common Module', () => {
	describe('sleep', () => {
		it('should resolve after the specified timeout', async () => {
			vi.useFakeTimers()
			const ms = 1000
			const promise = sleep(ms)

			vi.advanceTimersByTime(ms)

			await expect(promise).resolves.toBeUndefined()
			vi.useRealTimers()
		})
	})
})
