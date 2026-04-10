import { describe, it, expect } from 'vitest'
import linearInterpolation from './linear-interpolation'
import interpolateHeading from './interpolate-heading'
import calculateHeading from './calculate-heading'
import encodePolyline from './encode-polyline'
import decodePolyline from './decode-polyline'
import getDistance from './get-distance'
import type { Coordinate, CoordinateObject } from './types'

describe('Map Module', () => {
	describe('linearInterpolation', () => {
		it('should interpolate between two numbers', () => {
			expect(linearInterpolation(0, 10, 0.5)).toBe(5)
			expect(linearInterpolation(0, 10, 0)).toBe(0)
			expect(linearInterpolation(0, 10, 1)).toBe(10)
			expect(linearInterpolation(10, 20, 0.25)).toBe(12.5)
		})
	})

	describe('interpolateHeading', () => {
		it('should interpolate heading correctly', () => {
			expect(interpolateHeading(0, 90, 0.5)).toBe(45)
		})

		it('should handle wrapping around 360 degrees', () => {
			// 350 -> 10. Shortest path is +20 degrees. Midpoint is 360 (or 0).
			const val = interpolateHeading(350, 10, 0.5)
			// Result is 350 + (20/2) = 360.
			expect(val).toBe(360)
		})

		it('should handle wrapping backwards', () => {
			// 10 -> 350. Shortest path is -20 degrees.
			const val = interpolateHeading(10, 350, 0.5)
			// Result 10 + (-20/2) = 0.
			expect(val).toBe(0)
		})
	})

	describe('calculateHeading', () => {
		it('should calculate heading North', () => {
			// (0,0) -> (1,0) [latitude increased] => North
			const prev = { latitude: 0, longitude: 0 }
			const curr = { latitude: 0.001, longitude: 0 }

			// Should be 0
			expect(calculateHeading({ previousCoordinate: prev, currentCoordinate: curr })).toBeCloseTo(0)
		})

		it('should calculate heading East', () => {
			// (0,0) -> (0,1) [longitude increased] => East
			const prev = { latitude: 0, longitude: 0 }
			const curr = { latitude: 0, longitude: 0.001 }

			// Should be 90
			expect(calculateHeading({ previousCoordinate: prev, currentCoordinate: curr })).toBeCloseTo(90)
		})

		it('should return lastHeading if distance is too small (deadzone)', () => {
			const prev = { latitude: 0, longitude: 0 }
			const curr = { latitude: 0, longitude: 0 } // 0 distance

			const result = calculateHeading({
				previousCoordinate: prev,
				currentCoordinate: curr,
				lastHeadingDegrees: 123,
				minDistanceMeters: 5,
			})

			expect(result).toBe(123)
		})

		it('should return 0 if coordinates are missing', () => {
			expect(calculateHeading({ previousCoordinate: null, currentCoordinate: null })).toBe(0)
		})

		it('should return 0 if within deadzone and no lastHeading provided', () => {
			// Very small movement < default 3m
			const prev = { latitude: 0, longitude: 0 }
			const curr = { latitude: 0.000001, longitude: 0 } // ~0.1m, within default 3m deadzone

			const result = calculateHeading({
				previousCoordinate: prev,
				currentCoordinate: curr,
			})

			expect(result).toBe(0) // No lastHeadingDegrees provided, defaults to 0
		})

		it('should return 0 if coordinates are exactly same and no lastHeading provided', () => {
			const coord = { latitude: -6.2, longitude: 106.8 }
			expect(
				calculateHeading({
					previousCoordinate: coord,
					currentCoordinate: coord,
				}),
			).toBe(0)
		})

		it('should handle negative bearing normalization', () => {
			// (0,0) -> (-0.001, -0.001) should be South-West (~225deg)
			// atan2 will return a negative value for this direction
			const prev = { latitude: 0, longitude: 0 }
			const curr = { latitude: -0.001, longitude: -0.001 }

			const result = calculateHeading({ previousCoordinate: prev, currentCoordinate: curr })
			expect(result).toBeGreaterThan(180)
			expect(result).toBeLessThan(270)
		})
	})

	describe('Polyline', () => {
		it('should encode and decode correctly (Round Trip)', () => {
			const points: Coordinate[] = [
				[38.5, -120.2],
				[40.7, -120.95],
				[43.252, -126.453],
			]

			const encoded = encodePolyline(points)
			// Verify against expected standard output if needed, but round trip is best check
			// Typical google polyline example string: "_p~iF~ps|U_ulLnnqC_mqNvxq`@"

			const decoded = decodePolyline(encoded)

			// Check closeness (floating point errors)
			expect(decoded.length).toBe(points.length)

			for (let i = 0; i < points.length; i++) {
				expect(decoded[i][0]).toBeCloseTo(points[i][0])
				expect(decoded[i][1]).toBeCloseTo(points[i][1])
			}
		})

		it('should decode polyline with negative deltas correctly', () => {
			// Points going from positive to negative (crossing prime meridian/equator)
			const points: Coordinate[] = [
				[10.0, 10.0],
				[5.0, -5.0], // Negative delta
				[-10.0, -20.0], // More negative delta
			]

			const encoded = encodePolyline(points)
			const decoded = decodePolyline(encoded)

			expect(decoded.length).toBe(points.length)
			for (let i = 0; i < points.length; i++) {
				expect(decoded[i][0]).toBeCloseTo(points[i][0])
				expect(decoded[i][1]).toBeCloseTo(points[i][1])
			}
		})
	})

	describe('getDistance', () => {
		it('should calculate distance correctly in meters (default)', () => {
			const start = { latitude: 0, longitude: 0 }
			const end = { latitude: 0, longitude: 1 }
			const distance = getDistance(start, end)
			// 1 degree longitude at equator is approximately 111,319 meters
			expect(distance).toBeGreaterThan(111000)
			expect(distance).toBeLessThan(112000)
		})

		it('should return 0 for identical coordinates', () => {
			const coord = { latitude: -6.2, longitude: 106.8 }
			expect(getDistance(coord, coord)).toBe(0)
		})

		it('should throw an error for invalid latitudes', () => {
			const start = { latitude: -91, longitude: 0 }
			const end = { latitude: 0, longitude: 0 }
			expect(() => getDistance(start, end)).toThrow(RangeError)
		})

		it('should throw an error for invalid longitudes', () => {
			const start = { latitude: 0, longitude: -181 }
			const end = { latitude: 0, longitude: 0 }
			expect(() => getDistance(start, end)).toThrow(RangeError)
		})

		it('should throw an error when Vincenty formula does not converge (near-antipodal points)', () => {
			const start = { latitude: 0, longitude: 0 }
			const end = { latitude: 0.5, longitude: 179.5 }
			expect(() => getDistance(start, end)).toThrow('Vincenty formula gagal konvergen')
		})

		it('should return 0 when evaluating the exact same poles with different longitudes (tests sinAngular === 0 branch)', () => {
			const start = { latitude: 90, longitude: 0 }
			const end = { latitude: 90, longitude: 120 }
			expect(getDistance(start, end)).toBeCloseTo(0)
		})

		it('should return correct conversions for other units', () => {
			const start = { latitude: -6.2, longitude: 106.8 }
			const end = { latitude: -6.3, longitude: 106.9 }
			const m = getDistance(start, end, 'm')
			const km = getDistance(start, end, 'km')
			const mi = getDistance(start, end, 'mi')
			const nm = getDistance(start, end, 'nm')

			expect(km).toBeCloseTo(m / 1000)
			expect(mi).toBeCloseTo(m / 1609.344)
			expect(nm).toBeCloseTo(m / 1852)
		})
	})
})
