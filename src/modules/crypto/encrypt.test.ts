import { describe, it, expect } from 'vitest'
import encrypt from './encrypt'
import decrypt from './decrypt'

describe('Crypto Module', () => {
	it('should encrypt and decrypt a message successfully', async () => {
		const message = 'Hello, World!'
		const secretKey = 'my-secret-key'

		// Encrypt
		const encryptedParams = await encrypt(message, secretKey)
		expect(encryptedParams.isSuccess).toBe(true)
		expect(encryptedParams.result).not.toBeNull()
		expect(typeof encryptedParams.result).toBe('string')

		// Decrypt
		if (encryptedParams.result) {
			const decryptedParams = await decrypt(encryptedParams.result, secretKey)
			expect(decryptedParams.isSuccess).toBe(true)
			expect(decryptedParams.result).toBe(message)
		}
	})

	it('should fail decryption with wrong key', async () => {
		const message = 'Secret Data'
		const secretKey = 'my-secret-key'
		const wrongKey = 'wrong-key'

		const encryptedParams = await encrypt(message, secretKey)

		if (encryptedParams.result) {
			const decryptedParams = await decrypt(encryptedParams.result, wrongKey)
			expect(decryptedParams.isSuccess).toBe(false)
			expect(decryptedParams.result).toBeNull()
		}
	})
})
