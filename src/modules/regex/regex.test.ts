import { describe, it, expect, beforeEach } from 'vitest'
import controlCharsRegex from './control-chars'
import multipleNewlinesRegex from './multiple-newlines'
import multipleSpacesRegex from './multiple-spaces'
import nonBasicLatinRegex from './non-basic-latin'
import spacesBeforeNewlineRegex from './spaces-before-newline'
import urlWithVersionRegex from './url-with-version'
import whitespaceRegex from './whitespace'

describe('Regex Module', () => {
	describe('controlCharsRegex', () => {
		beforeEach(() => {
			controlCharsRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(controlCharsRegex).toBeInstanceOf(RegExp)
		})

		it('should match null character (\\u0000)', () => {
			expect(controlCharsRegex.test('\u0000')).toBe(true)
		})

		it('should match tab character (\\u0009)', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('\u0009')).toBe(true)
		})

		it('should match escape character (\\u001B)', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('\u001B')).toBe(true)
		})

		it('should match delete character (\\u007F)', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('\u007F')).toBe(true)
		})

		it('should NOT match newline (\\n / \\u000A)', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('\n')).toBe(false)
		})

		it('should NOT match carriage return (\\r / \\u000D)', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('\r')).toBe(false)
		})

		it('should NOT match normal printable characters', () => {
			controlCharsRegex.lastIndex = 0
			expect(controlCharsRegex.test('Hello World')).toBe(false)
		})

		it('should remove all control chars from a string', () => {
			const dirty = 'He\u0000llo\u0001 W\u007Forld'
			const cleaned = dirty.replace(controlCharsRegex, '')
			expect(cleaned).toBe('Hello World')
		})
	})

	describe('multipleNewlinesRegex', () => {
		beforeEach(() => {
			multipleNewlinesRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(multipleNewlinesRegex).toBeInstanceOf(RegExp)
		})

		it('should match two consecutive newlines', () => {
			expect(multipleNewlinesRegex.test('\n\n')).toBe(true)
		})

		it('should match three or more consecutive newlines', () => {
			multipleNewlinesRegex.lastIndex = 0
			expect(multipleNewlinesRegex.test('\n\n\n\n\n')).toBe(true)
		})

		it('should NOT match a single newline', () => {
			multipleNewlinesRegex.lastIndex = 0
			expect(multipleNewlinesRegex.test('hello\nworld')).toBe(false)
		})

		it('should NOT match text without newlines', () => {
			multipleNewlinesRegex.lastIndex = 0
			expect(multipleNewlinesRegex.test('hello world')).toBe(false)
		})

		it('should collapse multiple newlines into a single newline', () => {
			const text = 'line1\n\n\nline2\n\n\n\nline3'
			const result = text.replace(multipleNewlinesRegex, '\n')
			expect(result).toBe('line1\nline2\nline3')
		})
	})

	describe('multipleSpacesRegex', () => {
		beforeEach(() => {
			multipleSpacesRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(multipleSpacesRegex).toBeInstanceOf(RegExp)
		})

		it('should match multiple consecutive spaces', () => {
			expect(multipleSpacesRegex.test('hello   world')).toBe(true)
		})

		it('should match a single space (non-newline whitespace)', () => {
			multipleSpacesRegex.lastIndex = 0
			expect(multipleSpacesRegex.test('hello world')).toBe(true)
		})

		it('should match tab characters', () => {
			multipleSpacesRegex.lastIndex = 0
			expect(multipleSpacesRegex.test('hello\tworld')).toBe(true)
		})

		it('should NOT match newline characters', () => {
			multipleSpacesRegex.lastIndex = 0
			expect(multipleSpacesRegex.test('\n')).toBe(false)
		})

		it('should NOT match carriage return characters', () => {
			multipleSpacesRegex.lastIndex = 0
			expect(multipleSpacesRegex.test('\r')).toBe(false)
		})

		it('should normalize multiple spaces to a single space', () => {
			const text = 'hello     world   foo'
			const result = text.replace(multipleSpacesRegex, ' ')
			expect(result).toBe('hello world foo')
		})

		it('should preserve newlines when replacing spaces', () => {
			const text = 'hello   world\ngoodbye   world'
			const result = text.replace(multipleSpacesRegex, ' ')
			expect(result).toBe('hello world\ngoodbye world')
		})
	})

	describe('nonBasicLatinRegex', () => {
		beforeEach(() => {
			nonBasicLatinRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(nonBasicLatinRegex).toBeInstanceOf(RegExp)
		})

		it('should NOT match basic ASCII characters', () => {
			expect(nonBasicLatinRegex.test('Hello World 123')).toBe(false)
		})

		it('should NOT match Latin-1 Supplement characters (accented)', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('café résumé')).toBe(false)
		})

		it('should NOT match Latin Extended-A characters', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('Ā ā Ă ă')).toBe(false)
		})

		it('should NOT match newlines and carriage returns', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('hello\nworld\r')).toBe(false)
		})

		it('should match CJK characters', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('你好')).toBe(true)
		})

		it('should match Arabic characters', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('مرحبا')).toBe(true)
		})

		it('should match emoji', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('🎉')).toBe(true)
		})

		it('should match Cyrillic characters', () => {
			nonBasicLatinRegex.lastIndex = 0
			expect(nonBasicLatinRegex.test('Привет')).toBe(true)
		})

		it('should strip non-basic-latin from mixed strings', () => {
			const text = 'Hello 你好 World'
			const result = text.replace(nonBasicLatinRegex, '')
			expect(result).toBe('Hello  World')
		})
	})

	describe('spacesBeforeNewlineRegex', () => {
		beforeEach(() => {
			spacesBeforeNewlineRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(spacesBeforeNewlineRegex).toBeInstanceOf(RegExp)
		})

		it('should match trailing spaces before newline', () => {
			expect(spacesBeforeNewlineRegex.test('hello   \n')).toBe(true)
		})

		it('should match trailing tabs before newline', () => {
			spacesBeforeNewlineRegex.lastIndex = 0
			expect(spacesBeforeNewlineRegex.test('hello\t\n')).toBe(true)
		})

		it('should match mixed spaces and tabs before newline', () => {
			spacesBeforeNewlineRegex.lastIndex = 0
			expect(spacesBeforeNewlineRegex.test('hello \t \n')).toBe(true)
		})

		it('should NOT match newlines without preceding whitespace', () => {
			spacesBeforeNewlineRegex.lastIndex = 0
			expect(spacesBeforeNewlineRegex.test('hello\n')).toBe(false)
		})

		it('should NOT match text without newlines', () => {
			spacesBeforeNewlineRegex.lastIndex = 0
			expect(spacesBeforeNewlineRegex.test('hello world')).toBe(false)
		})

		it('should clean trailing whitespace while preserving newlines', () => {
			const text = 'line1   \nline2\t\t\nline3\n'
			const result = text.replace(spacesBeforeNewlineRegex, '\n')
			expect(result).toBe('line1\nline2\nline3\n')
		})
	})

	describe('urlWithVersionRegex', () => {
		beforeEach(() => {
			urlWithVersionRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(urlWithVersionRegex).toBeInstanceOf(RegExp)
		})

		it('should match /v1', () => {
			expect(urlWithVersionRegex.test('/v1')).toBe(true)
		})

		it('should match /v2/users', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/v2/users')).toBe(true)
		})

		it('should match /v10/api/data', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/v10/api/data')).toBe(true)
		})

		it('should match /v99/deeply/nested/path', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/v99/deeply/nested/path')).toBe(true)
		})

		it('should NOT match paths without version prefix', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/users')).toBe(false)
		})

		it('should NOT match paths without leading slash', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('v1/users')).toBe(false)
		})

		it('should NOT match /vX where X is not a digit', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/va/users')).toBe(false)
		})

		it('should NOT match empty string', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('')).toBe(false)
		})

		it('should NOT match /api/v1/users (version not at root)', () => {
			urlWithVersionRegex.lastIndex = 0
			expect(urlWithVersionRegex.test('/api/v1/users')).toBe(false)
		})
	})

	describe('whitespaceRegex', () => {
		beforeEach(() => {
			whitespaceRegex.lastIndex = 0
		})

		it('should be a RegExp instance', () => {
			expect(whitespaceRegex).toBeInstanceOf(RegExp)
		})

		it('should match spaces', () => {
			expect(whitespaceRegex.test(' ')).toBe(true)
		})

		it('should match tabs', () => {
			whitespaceRegex.lastIndex = 0
			expect(whitespaceRegex.test('\t')).toBe(true)
		})

		it('should match newlines', () => {
			whitespaceRegex.lastIndex = 0
			expect(whitespaceRegex.test('\n')).toBe(true)
		})

		it('should match carriage returns', () => {
			whitespaceRegex.lastIndex = 0
			expect(whitespaceRegex.test('\r')).toBe(true)
		})

		it('should match mixed whitespace', () => {
			whitespaceRegex.lastIndex = 0
			expect(whitespaceRegex.test(' \t\n\r')).toBe(true)
		})

		it('should NOT match non-whitespace text', () => {
			whitespaceRegex.lastIndex = 0
			expect(whitespaceRegex.test('abc')).toBe(false)
		})

		it('should strip all whitespace from a string', () => {
			const text = ' hello \t world \n foo '
			const result = text.replace(whitespaceRegex, '')
			expect(result).toBe('helloworldfoo')
		})

		it('should replace whitespace sequences with single space', () => {
			const text = 'hello   \t\n  world'
			const result = text.replace(whitespaceRegex, ' ')
			expect(result).toBe('hello world')
		})
	})
})
