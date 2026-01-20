import type { Coordinate } from './types'

const encodePolyline = (coordinates: Coordinate[]): string => {
	let lastLat = 0,
		lastLng = 0,
		result = ''

	const encodePart = (parts: number) => {
		let unit = parts << 1
		if (parts < 0) unit = ~unit
		while (unit >= 0x20) {
			result += String.fromCharCode((0x20 | (unit & 0x1f)) + 63)
			unit >>= 5
		}
		result += String.fromCharCode(unit + 63)
	}

	for (const [latVal, lngVal] of coordinates) {
		const lat = Math.round(latVal * 1e5)
		const lng = Math.round(lngVal * 1e5)
		encodePart(lat - lastLat)
		encodePart(lng - lastLng)
		lastLat = lat
		lastLng = lng
	}

	return result
}

export default encodePolyline
