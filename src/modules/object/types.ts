export type SanitizeObjectOptions = {
	noEmptyString?: boolean
}

export type JSONSafeParseResult<T> = {
	isValid: boolean
	value: T | null
}
