import type { JSONSafeParseResult } from './types'

const jsonSafeParse = <T = unknown>(input: string): JSONSafeParseResult<T> => {
	try {
		const value = JSON.parse(input)

		return {
			isValid: true,
			value: value as T,
		}
	} catch {
		return {
			isValid: false,
			value: null,
		}
	}
}

export default jsonSafeParse
