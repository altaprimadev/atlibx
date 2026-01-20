import { webcrypto } from 'node:crypto'
const { subtle } = webcrypto

export const getKey = async (secretKey: string): Promise<webcrypto.CryptoKey> => {
	const keyData = Buffer.from(secretKey, 'utf-8')
	const hash = await subtle.digest('SHA-256', keyData)

	return subtle.importKey('raw', hash, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export const toBase64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64')

export const fromBase64 = (base64: string): Uint8Array => new Uint8Array(Buffer.from(base64, 'base64'))

export const toArrayBuffer = (view: Uint8Array): ArrayBuffer => view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer
