export type RoundingMode = 'ceil' | 'floor' | 'expand' | 'trunc' | 'halfCeil' | 'halfFloor' | 'halfExpand' | 'halfTrunc' | 'halfEven'

export type RoundToPrecisionOptions = {
	maxFractionDigits?: number
	minFractionDigits?: number
	roundingMode: RoundingMode
}

export type RoundToPrecision = (value: number, options?: RoundToPrecisionOptions) => number
