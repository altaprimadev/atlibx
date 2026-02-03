const { subtle } = globalThis.crypto

export const getKey = async (secretKey: string): Promise<CryptoKey> => {
	const keyData = new TextEncoder().encode(secretKey)
	const hash = await subtle.digest('SHA-256', keyData)

	return subtle.importKey('raw', hash, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export const toBase64 = (bytes: Uint8Array): string => {
	let binary = ''
	const len = bytes.byteLength
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return btoa(binary)
}

export const fromBase64 = (base64: string): Uint8Array => {
	const binaryString = atob(base64)
	const len = binaryString.length
	const bytes = new Uint8Array(len)
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	return bytes
}

export const toArrayBuffer = (view: Uint8Array): ArrayBuffer => view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer

export const CHAR_SET: string[] = ['\u200c', '\u200d', '\u200b', '\u200e', '\u200f', '\u202a', '\u202b', '\u202c', '\u202d', '\u2061']

export const UNICODE_RANGES_REGEX = new RegExp(
	'[\\u0000-\\u002F\\u003A-\\u0040\\u005b-\\u0060\\u007b-\\u007f]|[\\u0030-\\u0039]+|[\\u0041-\\u005a\\u0061-\\u007a]+|[\\u0080-\\u00FF]+|[\\u0100-\\u017F]+|[\\u0180-\\u024F]+|[\\u0250-\\u02AF]+|[\\u02B0-\\u02FF]+|[\\u0300-\\u036F]+|[\\u0370-\\u03FF]+|[\\u0400-\\u04FF]+|[\\u0500-\\u052F]+|[\\u2000-\\u206F]+|[\\u2070-\\u209F]+|[\\u20A0-\\u20CF]+|[\\u20D0-\\u20FF]+|[\\u2100-\\u214F]+|[\\u2150-\\u218F]+|[\\u2190-\\u21FF]+|[\\u2200-\\u22FF]+|[\\u2300-\\u23FF]+|[\\u2400-\\u243F]+|[\\u2440-\\u245F]+|[\\u2460-\\u24FF]+|[\\u2500-\\u257F]+|[\\u2580-\\u259F]+|[\\u25A0-\\u25FF]+|[\\u2600-\\u26FF]+|[\\u2700-\\u27BF]+|[\\u2800-\\u28FF]+|[\\u2900-\\u297F]+|[\\u2980-\\u29FF]+|[\\u2A00-\\u2AFF]+|[\\u2B00-\\u2BFF]+|[\\u2C00-\\u2C5F]+|[\\u2C60-\\u2C7F]+|[\\u2C80-\\u2CFF]+|[\\u2D00-\\u2D2F]+|[\\u2D30-\\u2D7F]+|[\\u2D80-\\u2DDF]+|[\\u2DE0-\\u2DFF]+|[\\u2E00-\\u2E7F]+|[\\u2E80-\\u2EFF]+|[\\u2F00-\\u2FDF]+|[\\u2FF0-\\u2FFF]+|[\\u3000-\\u303F]+|[\\u3040-\\u309F]+|[\\u30A0-\\u30FF]+|[\\u3100-\\u312F]+|[\\u3130-\\u318F]+|[\\u3190-\\u319F]+|[\\u31A0-\\u31BF]+|[\\u31C0-\\u31EF]+|[\\u31F0-\\u31FF]+|[\\u3200-\\u32FF]+|[\\u3300-\\u33FF]+|[\\u3400-\\u4DBF]+|[\\u4DC0-\\u4DFF]+|[\\u4E00-\\u9FFF]+|[\\uA000-\\uA48F]+|[\\uAC00-\\uD7AF]+|[\\uE000-\\uF8FF]+|[\\uF900-\\uFAFF]+|[\\uFB00-\\uFB4F]+|[\\uFE00-\\uFE0F]+|[\\uFE10-\\uFE1F]+|[\\uFE20-\\uFE2F]+|[\\uFE30-\\uFE4F]+|[\\uFE50-\\uFE6F]+|[\\uFE70-\\uFEFF]+|[\\uFF00-\\uFFEF]+|[\\uFFF0-\\uFFFF]+',
	'g',
)

export const RADIX = CHAR_SET.length

export const CODE_LENGTH = Math.ceil(Math.log(65536) / Math.log(RADIX))

export const seededRandom = (seed: number): number => {
	const x = Math.sin(seed) * 10000

	return x - Math.floor(x)
}

export const stringToSeed = (str: string): number => {
	if (!str) return 0
	let seed = 0
	for (let i = 0; i < str.length; i++) {
		seed += str.charCodeAt(i) * (i + 1)
	}

	return seed
}

export const shuffle = <T>(array: T[], seed: number): T[] => {
	const arr = array.slice()
	for (let i = 0; i < arr.length - 1; i++) {
		const m = arr.length - (i + 1)
		const randIndex = Math.floor(seededRandom(seed + (i + 1)) * m)
		;[arr[m], arr[randIndex]] = [arr[randIndex], arr[m]]
	}

	return arr
}

export const generateArray = (length: number, passkey: string): number[] => {
	const seed = stringToSeed(passkey)

	return shuffle(
		Array.from({ length }, (_, i) => i),
		seed,
	)
}

export const combineShuffleString = (str1: string, str2: string): string => {
	const segments = str1.match(UNICODE_RANGES_REGEX) || []
	const hiddenChunks = str2.match(new RegExp(`.{${CODE_LENGTH}}`, 'g')) || []

	const ratio = segments.length / (segments.length + hiddenChunks.length)
	const result: string[] = []

	let i = 0
	let j = 0

	while (i < segments.length && j < hiddenChunks.length) {
		if (Math.random() <= ratio) {
			result.push(segments[i++])
		} else {
			result.push(hiddenChunks[j++])
		}
	}

	if (i < segments.length) result.push(...segments.slice(i))
	if (j < hiddenChunks.length) result.push(...hiddenChunks.slice(j))

	return result.join('')
}

export const splitZeroWidthCharacters = (str: string): { originalText: string; hiddenText: string } => {
	const charsClass = CHAR_SET.join('')
	const originalText = str.replace(new RegExp(`[${charsClass}]`, 'g'), '')
	const hiddenText = str.replace(new RegExp(`[^${charsClass}]`, 'g'), '')

	return { originalText, hiddenText }
}
