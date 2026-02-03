import type { CryptoResult } from './types'
import { fromBase64, getKey, toArrayBuffer } from './utils'
const { subtle } = globalThis.crypto

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
			result: new TextDecoder().decode(decrypted),
		}
	} catch (e: unknown) {
		return {
			isSuccess: false,
			message: e instanceof Error ? e.message : 'Decryption failed',
			result: null,
		}
	}
}

export default decrypt
