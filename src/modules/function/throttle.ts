import type { ThrottledFunction, ThrottleOptions } from './types'

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds.
 *
 * @param func The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @param options Options to control leading and trailing behavior.
 * @returns Returns the new throttled function.
 */
const throttle = <Args extends unknown[], R>(func: (this: unknown, ...args: Args) => R, wait: number, options: ThrottleOptions = {}): ThrottledFunction<Args, R> => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null
	let lastArgs: Args | undefined
	let lastThis: unknown
	let result: R | undefined
	let lastCallTime = 0
	let lastInvokeTime = 0

	const leading = 'leading' in options ? !!options.leading : true
	const trailing = 'trailing' in options ? !!options.trailing : true

	const invokeFunc = (time: number) => {
		const args = lastArgs
		const thisArg = lastThis

		lastArgs = undefined
		lastThis = undefined
		lastInvokeTime = time
		if (args) {
			result = func.apply(thisArg, args)
		}
		return result
	}

	const leadingEdge = (time: number) => {
		lastInvokeTime = time
		timeoutId = setTimeout(timerExpired, wait)
		return leading ? invokeFunc(time) : result
	}

	const remainingWait = (time: number) => {
		const timeSinceLastCall = time - lastCallTime
		const timeSinceLastInvoke = time - lastInvokeTime
		const timeWaiting = wait - timeSinceLastCall

		return Math.min(timeWaiting, wait - timeSinceLastInvoke)
	}

	const shouldInvoke = (time: number) => {
		const timeSinceLastCall = time - lastCallTime
		const timeSinceLastInvoke = time - lastInvokeTime

		return lastCallTime === 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || timeSinceLastInvoke >= wait
	}

	const timerExpired = () => {
		const time = Date.now()
		if (shouldInvoke(time)) {
			return trailingEdge(time)
		}
		// Restart the timer.
		timeoutId = setTimeout(timerExpired, remainingWait(time))
	}

	const trailingEdge = (time: number) => {
		timeoutId = null

		if (trailing && lastArgs) {
			return invokeFunc(time)
		}
		lastArgs = undefined
		lastThis = undefined
		return result
	}

	const cancel = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId)
		}
		lastInvokeTime = 0
		lastArgs = undefined
		lastCallTime = 0
		lastThis = undefined
		timeoutId = null
	}

	const flush = () => {
		return timeoutId === null ? result : trailingEdge(Date.now())
	}

	const throttled = function (this: unknown, ...args: Args) {
		const time = Date.now()
		const isInvoking = shouldInvoke(time)

		lastArgs = args
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		lastThis = this
		lastCallTime = time

		if (isInvoking) {
			if (timeoutId === null) {
				return leadingEdge(lastCallTime)
			}
			// Handle invocations in a tight loop.
			if (timeoutId !== null) {
				clearTimeout(timeoutId)
			}
			timeoutId = setTimeout(timerExpired, wait)
			return invokeFunc(lastCallTime)
		}
		if (timeoutId === null) {
			timeoutId = setTimeout(timerExpired, wait)
		}
		return result
	}

	throttled.cancel = cancel
	throttled.flush = flush

	return throttled as ThrottledFunction<Args, R>
}

export default throttle
