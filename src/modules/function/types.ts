export type ThrottleOptions = {
	leading?: boolean
	trailing?: boolean
}

export type ThrottledFunction<Args extends unknown[], R> = {
	(...args: Args): R | undefined
	cancel(): void
	flush(): R | undefined
}

export type DebounceOptions = {
	leading?: boolean
	trailing?: boolean
	maxWait?: number
}

export type DebouncedFunction<Args extends unknown[], R> = {
	(...args: Args): R | undefined
	cancel(): void
	flush(): R | undefined
}
