import { CHAR_SET, CODE_LENGTH, generateArray, RADIX } from './utils'

const decodeFromZeroWidthCharacter = (str: string, seed: string): string => {
	const randomOrder = generateArray(str.length, seed)
	const normalized: string[] = []

	for (let i = 0; i < str.length; i++) {
		normalized[randomOrder[i]] = str[i]
	}

	const digitArray = normalized.map((ch) => {
		const idx = CHAR_SET.indexOf(ch)
		if (idx === -1) throw new Error(`Unknown zero-width character: ${ch}`)

		return idx.toString()
	})

	let result = ''
	for (let i = 0; i < digitArray.length; i += CODE_LENGTH) {
		const chunk = digitArray.slice(i, i + CODE_LENGTH).join('')
		const charCode = parseInt(chunk, RADIX)
		result += String.fromCharCode(charCode)
	}

	return result
}

export default decodeFromZeroWidthCharacter
