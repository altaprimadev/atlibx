import type { SanitizeObjectOptions } from './types'

const sanitizeObject = <T extends Record<string, any>>(obj: T, options: SanitizeObjectOptions = { noEmptyString: false }): Partial<T> => {
	if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj?.constructor?.name === 'Decimal') {
		return obj
	}

	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (value === null || value === undefined) return acc
		if (options.noEmptyString && typeof value === 'string' && value.trim() === '') {
			return acc
		}
		if (typeof value === 'number' && !Number.isFinite(value)) {
			return acc
		}
		if (typeof value === 'object') {
			if (value instanceof Date || value?.constructor?.name === 'Decimal') {
				return { ...acc, [key]: value }
			}
			if (Array.isArray(value)) {
				if (value.length === 0) return acc
				const cleanArray = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? sanitizeObject(item, options) : item))

				return { ...acc, [key]: cleanArray }
			}
			const cleanedNested = sanitizeObject(value, options)
			if (Object.keys(cleanedNested).length === 0) return acc

			return { ...acc, [key]: cleanedNested }
		}

		return { ...acc, [key]: value }
	}, {} as Partial<T>)
}

export default sanitizeObject
