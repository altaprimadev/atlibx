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

export type KeyValueData = {
	key: string
	value: number
}

export type AnomalyResult = {
	key: string
	value: number
	isAnomaly: boolean
	zScore: number
	deviation: number
}

export type DetectionSummary = {
	mean: number
	stdDev: number
	threshold: number
	upperBound: number
	lowerBound: number
	totalData: number
	totalAnomalies: number
	totalNormal: number
	results: AnomalyResult[]
	anomalies: AnomalyResult[]
	normals: AnomalyResult[]
}
