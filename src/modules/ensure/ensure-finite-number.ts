const ensureFiniteNumber = (value: unknown, defaultValue: number = 0): number => {
	return Number.isFinite(value) ? (value as number) : defaultValue
}

export default ensureFiniteNumber
