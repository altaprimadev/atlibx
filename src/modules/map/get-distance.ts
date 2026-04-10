import type { CoordinateObject, DistanceUnit } from './types'

// Earth ellipsoid constants (WGS-84)
const WGS84 = {
	// semiMajorAxis: 6378137, // equatorial radius (m)
	semiMinorAxis: 6356752.314245, // polar radius (m)
	flattening: 1 / 298.257223563,
	// Precomputed: (a²−b²)/b² — used in series expansion, avoids per-call recomputation
	uSquared: (6378137 ** 2 - 6356752.314245 ** 2) / 6356752.314245 ** 2,
} as const

type ReducedLatitudes = {
	sinLat1: number
	cosLat1: number
	sinLat2: number
	cosLat2: number
}

type VincentyIterationResult = {
	angularDistance: number
	sinAngular: number
	sinSquaredAngular: number // avoids recomputing sinAngular**2 in distance step
	cosAngular: number
	cosSquaredAzimuth: number
	midpointCos: number
}

type VincentyDistanceInput = VincentyIterationResult & {
	uSquared: number
	semiMinorAxis: number
}

type IterationInput = ReducedLatitudes & {
	lonDiffRad: number
	flattening: number
}

const UNIT_CONVERSIONS: Record<DistanceUnit, number> = {
	m: 1,
	km: 1e-3,
	mi: 1 / 1609.344,
	nm: 1 / 1852,
}

const toRad = (deg: number): number => (deg * Math.PI) / 180

const validateCoordinates = (startCoordinate: CoordinateObject, endCoordinate: CoordinateObject): void => {
	if (startCoordinate.latitude < -90 || startCoordinate.latitude > 90 || endCoordinate.latitude < -90 || endCoordinate.latitude > 90)
		throw new RangeError('Latitude harus antara -90 dan 90')
	if (startCoordinate.longitude < -180 || startCoordinate.longitude > 180 || endCoordinate.longitude < -180 || endCoordinate.longitude > 180)
		throw new RangeError('Longitude harus antara -180 dan 180')
}

const computeReducedLatitudes = (lat1: number, lat2: number, flattening: number): ReducedLatitudes => {
	const f1 = 1 - flattening
	const reducedLat1 = Math.atan(f1 * Math.tan(toRad(lat1)))
	const reducedLat2 = Math.atan(f1 * Math.tan(toRad(lat2)))
	return {
		sinLat1: Math.sin(reducedLat1),
		cosLat1: Math.cos(reducedLat1),
		sinLat2: Math.sin(reducedLat2),
		cosLat2: Math.cos(reducedLat2),
	}
}

const iterateLongitudeDifference = ({ sinLat1, cosLat1, sinLat2, cosLat2, lonDiffRad, flattening }: IterationInput): VincentyIterationResult => {
	let longitudeDiff = lonDiffRad
	let sinLonDiff: number, cosLonDiff: number
	let angularDistance: number, sinAngular: number, sinSquaredAngular: number, cosAngular: number
	let cosSquaredAzimuth: number
	let midpointCos: number, seriesExpansion: number
	let iterations = 0
	let converged = false

	do {
		sinLonDiff = Math.sin(longitudeDiff)
		cosLonDiff = Math.cos(longitudeDiff)

		const term1 = cosLat2 * sinLonDiff
		const term2 = cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosLonDiff

		// sinAngular² = term1² + term2² is already available — avoids a redundant **2 later
		sinSquaredAngular = term1 ** 2 + term2 ** 2
		sinAngular = Math.sqrt(sinSquaredAngular)
		cosAngular = sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosLonDiff
		angularDistance = Math.atan2(sinAngular, cosAngular)

		const sinAzimuth = sinAngular === 0 ? 0 : (cosLat1 * cosLat2 * sinLonDiff) / sinAngular
		cosSquaredAzimuth = 1 - sinAzimuth ** 2
		midpointCos = cosSquaredAzimuth === 0 ? 0 : cosAngular - (2 * sinLat1 * sinLat2) / cosSquaredAzimuth

		seriesExpansion = (flattening / 16) * cosSquaredAzimuth * (4 + flattening * (4 - 3 * cosSquaredAzimuth))

		const prevLongitudeDiff = longitudeDiff
		const midpointCosSquared = midpointCos ** 2 // cached: used twice below
		longitudeDiff =
			lonDiffRad +
			(1 - seriesExpansion) * flattening * sinAzimuth * (angularDistance + seriesExpansion * sinAngular * (midpointCos + seriesExpansion * cosAngular * (-1 + 2 * midpointCosSquared)))

		if (Math.abs(longitudeDiff - prevLongitudeDiff) <= 1e-12) {
			converged = true
			break
		}
	} while (++iterations < 100)

	// Vincenty fails to converge for near-antipodal points — surface distance is
	// still well-defined (~πb ≈ 20,003 km), but the iterative solution is degenerate.
	if (!converged) {
		throw new Error('Vincenty formula gagal konvergen: titik mendekati antipodal. ' + 'Gunakan Haversine atau metode lain untuk pasangan koordinat ini.')
	}

	return { angularDistance, sinAngular, sinSquaredAngular, cosAngular, cosSquaredAzimuth, midpointCos }
}

const computeVincentyDistance = ({
	angularDistance,
	sinAngular,
	sinSquaredAngular,
	cosAngular,
	cosSquaredAzimuth,
	midpointCos,
	uSquared,
	semiMinorAxis,
}: VincentyDistanceInput): number => {
	const ellipsoidCorrection = cosSquaredAzimuth * uSquared

	const seriesA = 1 + (ellipsoidCorrection / 16384) * (4096 + ellipsoidCorrection * (-768 + ellipsoidCorrection * (320 - 175 * ellipsoidCorrection)))

	const seriesB = (ellipsoidCorrection / 1024) * (256 + ellipsoidCorrection * (-128 + ellipsoidCorrection * (74 - 47 * ellipsoidCorrection)))

	const midpointCosSquared = midpointCos ** 2 // cached: used twice
	const angularDistanceCorrection =
		seriesB *
		sinAngular *
		(midpointCos + (seriesB / 4) * (cosAngular * (-1 + 2 * midpointCosSquared) - (seriesB / 6) * midpointCos * (-3 + 4 * sinSquaredAngular) * (-3 + 4 * midpointCosSquared)))

	return semiMinorAxis * seriesA * (angularDistance - angularDistanceCorrection)
}

/**
 * Menghitung jarak antara dua koordinat menggunakan Vincenty Formula (WGS-84).
 *
 * @throws {RangeError} Jika koordinat di luar range valid
 * @throws {Error} Jika titik mendekati antipodal (Vincenty tidak konvergen)
 */
const getDistance = (startCoordinate: CoordinateObject, endCoordinate: CoordinateObject, unit: DistanceUnit = 'm'): number => {
	validateCoordinates(startCoordinate, endCoordinate)

	if (startCoordinate.latitude === endCoordinate.latitude && startCoordinate.longitude === endCoordinate.longitude) return 0

	const { semiMinorAxis, flattening, uSquared } = WGS84
	const lonDiffRad = toRad(endCoordinate.longitude) - toRad(startCoordinate.longitude)

	const reducedLatitudes = computeReducedLatitudes(startCoordinate.latitude, endCoordinate.latitude, flattening)
	const vincentyParams = iterateLongitudeDifference({ ...reducedLatitudes, lonDiffRad, flattening })
	const distanceInMeters = computeVincentyDistance({ ...vincentyParams, uSquared, semiMinorAxis })

	return distanceInMeters * UNIT_CONVERSIONS[unit]
}

export default getDistance
