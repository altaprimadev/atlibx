import whitespaceRegex from '../regex/whitespace'
import sanitizeString from './sanitize-string'

const kebabLower = (value: string | undefined | null): string => {
	return sanitizeString(value).replace(new RegExp(whitespaceRegex, 'g'), '-').toLowerCase()
}

export default kebabLower
