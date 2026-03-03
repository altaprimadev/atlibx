import { describe, it, expect } from 'vitest'
import { isValidPasswordFormat } from './index'

describe('isValidPasswordFormat', () => {
	it('validates passwords with only allowed characters', () => {
		// All valid character types
		expect(isValidPasswordFormat('Password123!')).toBe(true)
		// Only lowercase
		expect(isValidPasswordFormat('password')).toBe(true)
		// Only uppercase
		expect(isValidPasswordFormat('PASSWORD')).toBe(true)
		// Only numbers
		expect(isValidPasswordFormat('123456')).toBe(true)
		// Only special characters
		expect(isValidPasswordFormat('!@#$%^&*()_+')).toBe(true)
		// Short passwords are valid format-wise
		expect(isValidPasswordFormat('a')).toBe(true)
	})

	it('invalidates password with leading or trailing space', () => {
		expect(isValidPasswordFormat(' Password123!')).toBe(false)
		expect(isValidPasswordFormat('Password123! ')).toBe(false)
		expect(isValidPasswordFormat(' ')).toBe(false)
	})

	it('invalidates password with invalid characters', () => {
		// Emoji
		expect(isValidPasswordFormat('P@ssw0rd123🔥')).toBe(false)
		// Checkmark / Symbols outside the defined set
		expect(isValidPasswordFormat('P@ssw0rd123✓')).toBe(false)
		// Cyrillic
		expect(isValidPasswordFormat('пароль123')).toBe(false)
		// Arabic
		expect(isValidPasswordFormat('كلمةالسر')).toBe(false)
		// Spaces in the middle are NOT allowed based on the regex ^[...]+$ which doesn't include space
		expect(isValidPasswordFormat('Pass word!')).toBe(false)
	})
})
