import type { Coordinate } from './types'

const encodePolyline = (coordinates: Coordinate[]): string => {
	let lastLatitude = 0,
		lastLongitude = 0,
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

	for (const [latitudeVal, longitudeVal] of coordinates) {
		const latitude = Math.round(latitudeVal * 1e5)
		const longitude = Math.round(longitudeVal * 1e5)
		encodePart(latitude - lastLatitude)
		encodePart(longitude - lastLongitude)
		lastLatitude = latitude
		lastLongitude = longitude
	}

	return result
}

export default encodePolyline
