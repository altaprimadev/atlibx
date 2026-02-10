import { describe, it, expect, vi } from 'vitest'
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
			expect(decryptedParams.message).toBeDefined()
		}
	})

	it('should fail decryption with invalid base64', async () => {
		const decryptedParams = await decrypt('!!!invalid-base64!!!', 'key')
		expect(decryptedParams.isSuccess).toBe(false)
		expect(decryptedParams.result).toBeNull()
	})

	it('should handle non-Error throws in encrypt (mock)', async () => {
		const spy = vi.spyOn(globalThis.crypto.subtle, 'encrypt').mockRejectedValue('string error')

		const result = await encrypt('msg', 'key')
		expect(result.isSuccess).toBe(false)
		expect(result.message).toBe('Encryption failed')

		spy.mockRestore()
	})

	it('should handle actual Error throws in encrypt (mock)', async () => {
		const spy = vi.spyOn(globalThis.crypto.subtle, 'encrypt').mockRejectedValue(new Error('forced error'))

		const result = await encrypt('msg', 'key')
		expect(result.isSuccess).toBe(false)
		expect(result.message).toBe('forced error')

		spy.mockRestore()
	})

	it('should handle non-Error throws in decrypt (mock)', async () => {
		const spy = vi.spyOn(globalThis.crypto.subtle, 'decrypt').mockRejectedValue('string error')

		const result = await decrypt('YmFzZTY0', 'key')
		expect(result.isSuccess).toBe(false)
		expect(result.message).toBe('Decryption failed')

		spy.mockRestore()
	})

	it('should handle actual Error throws in decrypt (mock)', async () => {
		const spy = vi.spyOn(globalThis.crypto.subtle, 'decrypt').mockRejectedValue(new Error('forced error'))

		const result = await decrypt('YmFzZTY0', 'key')
		expect(result.isSuccess).toBe(false)
		expect(result.message).toBe('forced error')

		spy.mockRestore()
	})
})
