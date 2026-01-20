import whitespaceRegex from '../regex/whitespace'
import sanitizeString from './sanitize-string'

const snakeLower = (value: string | undefined | null) => {
	return sanitizeString(value).replace(whitespaceRegex, '_').toLowerCase()
}

export default snakeLower
