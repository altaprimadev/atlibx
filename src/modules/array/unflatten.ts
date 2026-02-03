import type { Unflatten, FlattenResult, FlattenResultStrict } from './types'

const unflatten: Unflatten = <K extends PropertyKey>(payload: FlattenResultStrict<K> | FlattenResult) => {
	const header = payload?.h
	if (!Array.isArray(header)) throw new TypeError(`unflatten: missing "h"`)

	const rowCount = (Object.keys(payload).length - 1) | 0
	if (rowCount < 0) throw new TypeError(`unflatten: invalid payload shape`)

	const out = new Array<Record<K, unknown>>(rowCount)

	for (let i = 0; i < rowCount; i++) {
		const row = payload[i] ?? []
		const obj = {} as Record<K, unknown>
		for (let j = 0; j < header.length; j++) obj[header[j] as K] = row[j]
		out[i] = obj
	}

	return out
}

export default unflatten
