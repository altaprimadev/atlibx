import type { Coordinate } from './types'

const decodePolyline = (encoded: string): Coordinate[] => {
	const points: Coordinate[] = []
	let index = 0
	const len = encoded.length
	let latitude = 0,
		longitude = 0

	while (index < len) {
		let b,
			shift = 0,
			result = 0
		do {
			b = encoded.charCodeAt(index++) - 63
			result |= (b & 0x1f) << shift
			shift += 5
		} while (b >= 0x20)
		latitude += result & 1 ? ~(result >> 1) : result >> 1

		shift = 0
		result = 0
		do {
			b = encoded.charCodeAt(index++) - 63
			result |= (b & 0x1f) << shift
			shift += 5
		} while (b >= 0x20)
		longitude += result & 1 ? ~(result >> 1) : result >> 1

		points.push([latitude / 1e5, longitude / 1e5])
	}

	return points
}

export default decodePolyline
