import type { RoundToPrecision } from './types'

const roundToPrecision: RoundToPrecision = (value, options = { maxFractionDigits: 2, minFractionDigits: 0, roundingMode: 'halfExpand' }) => {
	if (!Number.isFinite(value)) {
		return value
	}

	const decimalString = new Intl.NumberFormat('en', {
		style: 'decimal',
		maximumFractionDigits: options.maxFractionDigits,
		minimumFractionDigits: options.minFractionDigits,
		roundingMode: options.roundingMode,
		useGrouping: false,
	}).format(value)

	return parseFloat(decimalString)
}

export default roundToPrecision
