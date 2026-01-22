import type { Flatten } from './types'

const flatten: Flatten = (header, data) => {
	const out: any = { h: header }

	for (let i = 0; i < data.length; i++) {
		const d = data[i]
		const row = new Array<any>(header.length)

		for (let j = 0; j < header.length; j++) {
			row[j] = d[header[j]]
		}

		out[i] = row
	}

	return out
}

export default flatten
