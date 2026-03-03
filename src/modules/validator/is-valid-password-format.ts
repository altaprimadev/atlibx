import { generalCharsRegex } from '../regex'

/**
 * Validates password format based on strict rules:
 * 1. A-Z (Uppercase)
 * 2. a-z (Lowercase)
 * 3. 0-9 (Numbers)
 * 4. Special characters: !@#$%^&*()_+-=[]{};':",./<>?
 * 5. No leading/trailing spaces
 * 6. No invalid characters
 */
const isValidPasswordFormat = (password: string): boolean => {
	if (password.trim() !== password) return false

	return generalCharsRegex.test(password)
}

export default isValidPasswordFormat
