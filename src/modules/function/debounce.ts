import type { DebounceOptions, DebouncedFunction } from './types'

const debounce = <Args extends unknown[], R>(func: (...args: Args) => R, wait = 0, options: DebounceOptions = {}): DebouncedFunction<Args, R> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	let lastArgs: Args | undefined
	let result: R | undefined
	let lastCallTime: number | undefined
	let lastInvokeTime = 0
	let maxWaitTimerId: ReturnType<typeof setTimeout> | undefined

	const leading = !!options.leading
	const trailing = 'trailing' in options ? !!options.trailing : true
	const maxing = 'maxWait' in options
	const maxWait = maxing ? Math.max(options.maxWait || 0, wait) : 0

	const invokeFunc = (time: number): R => {
		const args = lastArgs
		lastArgs = undefined
		lastInvokeTime = time
		result = func(...(args as Args))
		return result
	}

	const leadingEdge = (time: number): R | undefined => {
		lastInvokeTime = time
		timeoutId = setTimeout(timerExpired, wait)
		if (maxing) {
			maxWaitTimerId = setTimeout(maxWaitExpired, maxWait)
		}
		return leading ? invokeFunc(time) : result
	}

	const remainingWait = (time: number): number => {
		const timeSinceLastCall = time - (lastCallTime as number)
		const timeSinceLastInvoke = time - lastInvokeTime
		const timeWaiting = wait - timeSinceLastCall

		return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting
	}

	const shouldInvoke = (time: number): boolean => {
		const timeSinceLastCall = time - (lastCallTime ?? 0)
		const timeSinceLastInvoke = time - lastInvokeTime

		return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || (maxing && timeSinceLastInvoke >= maxWait)
	}

	const timerExpired = (): void => {
		const time = Date.now()
		if (shouldInvoke(time)) {
			trailingEdge(time)
			return
		}
		// Restart the timer
		timeoutId = setTimeout(timerExpired, remainingWait(time))
	}

	const maxWaitExpired = (): void => {
		const time = Date.now()
		if (shouldInvoke(time)) {
			trailingEdge(time)
		}
	}

	const trailingEdge = (time: number): R | undefined => {
		timeoutId = undefined
		if (maxWaitTimerId) {
			clearTimeout(maxWaitTimerId)
			maxWaitTimerId = undefined
		}

		if (trailing && lastArgs) {
			return invokeFunc(time)
		}
		lastArgs = undefined
		return result
	}

	const cancel = (): void => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId)
		}
		if (maxWaitTimerId !== undefined) {
			clearTimeout(maxWaitTimerId)
		}
		lastInvokeTime = 0
		lastArgs = undefined
		lastCallTime = undefined
		timeoutId = undefined
		maxWaitTimerId = undefined
	}

	const flush = (): R | undefined => {
		return timeoutId === undefined ? result : trailingEdge(Date.now())
	}

	const debounced = (...args: Args): R | undefined => {
		const time = Date.now()
		const isInvoking = shouldInvoke(time)

		lastArgs = args
		lastCallTime = time

		if (isInvoking) {
			if (timeoutId === undefined) {
				return leadingEdge(lastCallTime)
			}
			if (maxing) {
				// Handle invocations in a tight loop.
				clearTimeout(timeoutId)
				timeoutId = setTimeout(timerExpired, wait)
				return invokeFunc(lastCallTime)
			}
		}
		if (timeoutId === undefined) {
			timeoutId = setTimeout(timerExpired, wait)
		}
		return result
	}

	debounced.cancel = cancel
	debounced.flush = flush

	return debounced
}

export default debounce
