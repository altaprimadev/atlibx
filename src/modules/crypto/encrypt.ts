import { webcrypto } from 'node:crypto'
import type { CryptoResult } from './types'
import { getKey, toBase64 } from './utils'
const { subtle } = webcrypto

const encrypt = async (payload: string, secretKey: string): Promise<CryptoResult> => {
	try {
		const key = await getKey(secretKey)

		const iv = webcrypto.getRandomValues(new Uint8Array(12))
		const data = Buffer.from(payload, 'utf-8')

		const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

		const encryptedBytes = new Uint8Array(encrypted)

		const combined = new Uint8Array(iv.length + encryptedBytes.length)
		combined.set(iv)
		combined.set(encryptedBytes, iv.length)

		return {
			isSuccess: true,
			message: 'Encryption successful',
			result: toBase64(combined),
		}
	} catch (e: any) {
		return {
			isSuccess: false,
			message: e?.message || 'Encryption failed',
			result: null,
		}
	}
}

export default encrypt
