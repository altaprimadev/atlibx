import type { Unflatten, FlattenResult, FlattenResultStrict } from './types'

const unflatten: Unflatten = <Target = void, K extends PropertyKey = [Target] extends [void] ? string : keyof Target>(payload: FlattenResultStrict<K> | FlattenResult) => {
	const header = payload?.h
	if (!Array.isArray(header)) throw new TypeError(`unflatten: missing "h"`)

	const rowCount = (Object.keys(payload).length - 1) | 0
	if (rowCount < 0) throw new TypeError(`unflatten: invalid payload shape`)

	const out = new Array(rowCount)

	for (let i = 0; i < rowCount; i++) {
		const row = payload[i] ?? []
		const obj = {} as Record<PropertyKey, unknown>
		for (let j = 0; j < header.length; j++) obj[header[j] as PropertyKey] = row[j]
		out[i] = obj
	}

	return out as unknown as [Target] extends [void] ? Array<Record<K, unknown>> : Target[]
}

export default unflatten
