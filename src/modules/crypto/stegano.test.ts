import { describe, it, expect } from 'vitest'
import steganoEncode from './stegano-encode'
import steganoDecode from './stegano-decode'
import encodeToZeroWidthCharacter from './stegano-encode-to-zero-width-character'
import decodeFromZeroWidthCharacter from './stegano-decode-from-zero-width-character'
import { stringToSeed, combineShuffleString, splitZeroWidthCharacters, CHAR_SET } from './utils'

describe('Crypto Module - Steganography', () => {
	const seed = 'my-secret-seed'
	const visibleText = 'This is a public message.'
	const hiddenText = 'Secret payload 123!'

	describe('Zero Width Character Encoding (Low Level)', () => {
		it('should encode and decode correctly with correct seed', () => {
			const encoded = encodeToZeroWidthCharacter(hiddenText, seed)
			// Result should only contain zero width characters (and maybe some specific invisible chars)
			// It relies on CHAR_SET in utils.

			expect(encoded).not.toBe(hiddenText)
			const decoded = decodeFromZeroWidthCharacter(encoded, seed)
			expect(decoded).toBe(hiddenText)
		})

		it('should fail or produce garbage with wrong seed', () => {
			const encoded = encodeToZeroWidthCharacter(hiddenText, seed)
			// Depending on implementation, it might throw or return garbage.
			// decodeFromZeroWidthCharacter uses randomOrder. If shuffle is different, characters are scrambled.
			// It parses chunks. If chunks are scrambled, parseInt might result in garbage chars.

			const decoded = decodeFromZeroWidthCharacter(encoded, 'wrong-seed')
			expect(decoded).not.toBe(hiddenText)
		})
	})

	describe('Stegano Encode/Decode (High Level)', () => {
		it('should hide text inside visible text and retrieve it', () => {
			const combined = steganoEncode(visibleText, hiddenText, seed)

			// Should look like visible text (if printed, though it has hidden chars)
			// But strict equality should fail because of hidden chars
			expect(combined.length).toBeGreaterThan(visibleText.length)

			const result = steganoDecode(combined, seed)
			expect(result.originalText).toBe(visibleText)
			expect(result.hiddenText).toBe(hiddenText)
		})

		it('should fail to recover hidden text with wrong seed', () => {
			const combined = steganoEncode(visibleText, hiddenText, seed)
			const result = steganoDecode(combined, 'wrong-seed')

			expect(result.originalText).toBe(visibleText)
			expect(result.hiddenText).not.toBe(hiddenText)
		})
	})
})

describe('Crypto Utils Edge Cases', () => {
	it('stringToSeed should return 0 for empty string', () => {
		expect(stringToSeed('')).toBe(0)
		expect(stringToSeed(null as any)).toBe(0)
		expect(stringToSeed(undefined as any)).toBe(0)
	})

	it('combineShuffleString should handle edge cases', () => {
		// When str1 (visible) is much longer than hidden
		const longVisible = 'This is a very long visible text message'
		const shortHidden = encodeToZeroWidthCharacter('hi', 'seed')
		const combined = combineShuffleString(longVisible, shortHidden)
		expect(combined.length).toBeGreaterThan(0)

		// Uneven: more hidden than visible (for line 97)
		const shortVisible = 'A'
		const longHidden = encodeToZeroWidthCharacter('This is a very long hidden message indeed', 'seed')
		const combined2 = combineShuffleString(shortVisible, longHidden)
		expect(combined2.length).toBeGreaterThan(0)

		// Regex fallback (for lines 79-80) - though match usually won't return null with these regexes
		// We can test empty strings
		const combined3 = combineShuffleString('', '')
		expect(combined3).toBe('')
	})

	it('splitZeroWidthCharacters should separate visible and hidden', () => {
		const visible = 'Hello'
		const hidden = CHAR_SET.join('')
		const mixed = visible + hidden
		const result = splitZeroWidthCharacters(mixed)
		expect(result.originalText).toBe(visible)
		expect(result.hiddenText).toBe(hidden)
	})

	it('decodeFromZeroWidthCharacter should throw error for unknown characters', () => {
		// Pass a character that is NOT in CHAR_SET
		expect(() => decodeFromZeroWidthCharacter('X', 'my-seed')).toThrow(/Unknown zero-width character/)
	})
})
