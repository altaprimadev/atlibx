import { webcrypto } from 'node:crypto'
import type { CryptoResult } from './types'
import { fromBase64, getKey, toArrayBuffer } from './utils'
const { subtle } = webcrypto

const decrypt = async (encryptedString: string, secretKey: string): Promise<CryptoResult> => {
	try {
		const key = await getKey(secretKey)

		const combined = fromBase64(encryptedString)

		const ivView = combined.subarray(0, 12)
		const dataView = combined.subarray(12)

		const iv = toArrayBuffer(ivView)
		const data = toArrayBuffer(dataView)

		const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

		return {
			isSuccess: true,
			message: 'Decryption successful',
			result: Buffer.from(decrypted).toString('utf-8'),
		}
	} catch (e: any) {
		return {
			isSuccess: false,
			message: e?.message || 'Decryption failed',
			result: null,
		}
	}
}

export default decrypt
