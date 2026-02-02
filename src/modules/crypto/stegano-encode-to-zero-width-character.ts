import { CHAR_SET, CODE_LENGTH, generateArray, RADIX } from './utils'

const encodeToZeroWidthCharacter = (str: string, seed: string): string => {
	const encodedArray: string[] = []

	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i)
		const radixStr = charCode.toString(RADIX).padStart(CODE_LENGTH, '0')
		encodedArray.push(radixStr)
	}

	const joined = encodedArray.join('')
	const encoded = [...joined].map((d) => CHAR_SET[parseInt(d)]).join('')

	const randomOrder = generateArray(encoded.length, seed)

	return randomOrder.map((idx) => encoded[idx]).join('')
}

export default encodeToZeroWidthCharacter
