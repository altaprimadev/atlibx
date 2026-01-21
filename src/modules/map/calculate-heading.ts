import type { CoordinateObject } from './types'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI
const EARTH_RADIUS_M = 6371008.8 // mean earth radius, cukup untuk jarak pendek
const MIN_DISTANCE_M = 3

/**
 * Optimized heading for vehicle tracking (short distance updates).
 * - Uses fast spherical initial bearing.
 * - Optional deadzone: if movement < minDistanceMeters, return lastHeading (or 0).
 */

type ParamsType = {
	previousCoordinate: CoordinateObject | undefined | null
	currentCoordinate: CoordinateObject | undefined | null
	minDistanceMeters?: number // default 3m (bisa lu adjust)
	lastHeadingDegrees?: number // dipakai kalau lagi deadzone
}
type CalculateHeadingType = (params: ParamsType) => number

const normalizeDegrees0To360 = (degrees: number): number => {
	const result = degrees % 360

	return result < 0 ? result + 360 : result
}

const calculateHeading: CalculateHeadingType = (params) => {
	const prev = params.previousCoordinate
	const curr = params.currentCoordinate

	// Init / missing data: skip calculation
	if (!prev || !curr) {
		return 0
	}

	if (prev.lat === curr.lat && prev.lng === curr.lng) {
		return params.lastHeadingDegrees ?? 0
	}

	const lat1 = prev.lat * DEG_TO_RAD
	const lat2 = curr.lat * DEG_TO_RAD
	const dLat = (curr.lat - prev.lat) * DEG_TO_RAD
	const dLng = (curr.lng - prev.lng) * DEG_TO_RAD
	const minDist = params.minDistanceMeters ?? MIN_DISTANCE_M

	// Haversine (short distance)
	const sinHalfDLat = Math.sin(dLat * 0.5)
	const sinHalfDLng = Math.sin(dLng * 0.5)
	const a = sinHalfDLat * sinHalfDLat + Math.cos(lat1) * Math.cos(lat2) * (sinHalfDLng * sinHalfDLng)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distanceMeters = EARTH_RADIUS_M * c

	if (distanceMeters < minDist) {
		return params.lastHeadingDegrees ?? 0
	}

	const y = Math.sin(dLng) * Math.cos(lat2)
	const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

	const bearingRad = Math.atan2(y, x)

	return normalizeDegrees0To360(bearingRad * RAD_TO_DEG)
}

export default calculateHeading
