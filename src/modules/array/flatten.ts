import type { Flatten, FlattenResultStrict } from './types'

const flatten: Flatten = (header, data) => {
	const out: FlattenResultStrict<(typeof header)[number]> = { h: header }

	for (let i = 0; i < data.length; i++) {
		const d = data[i]
		const row = new Array<unknown>(header.length)

		for (let j = 0; j < header.length; j++) {
			row[j] = (d as Record<PropertyKey, unknown>)[header[j]]
		}

		out[i] = row
	}

	return out
}

export default flatten
