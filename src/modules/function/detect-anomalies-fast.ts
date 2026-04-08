import type { DetectionSummary, KeyValueData } from './types'

type FastDetectionResult = Pick<DetectionSummary, 'mean' | 'stdDev' | 'min' | 'max' | 'minNormal' | 'maxNormal' | 'minAnomaly' | 'maxAnomaly'> & { anomalies: KeyValueData[] }

const detectAnomaliesFast = (data: KeyValueData[], threshold: number = 2): FastDetectionResult => {
	const n = data.length
	if (n === 0) return { anomalies: [], mean: 0, stdDev: 0, min: 0, max: 0 }

	let mean = 0
	let m2 = 0
	let min = data[0].value
	let max = data[0].value

	for (let i = 0; i < n; i++) {
		const v = data[i].value
		const delta = v - mean
		mean += delta / (i + 1)
		m2 += delta * (v - mean)
		if (v < min) min = v
		if (v > max) max = v
	}

	const stdDev = Math.sqrt(m2 / n)
	const upper = mean + threshold * stdDev
	const lower = mean - threshold * stdDev
	const anomalies: KeyValueData[] = []
	let minAnomaly: number | undefined
	let maxAnomaly: number | undefined
	let minNormal: number | undefined
	let maxNormal: number | undefined

	for (let i = 0; i < n; i++) {
		const v = data[i].value
		if (v > upper || v < lower) {
			anomalies.push(data[i])
			if (minAnomaly === undefined || v < minAnomaly) minAnomaly = v
			if (maxAnomaly === undefined || v > maxAnomaly) maxAnomaly = v
		} else {
			if (minNormal === undefined || v < minNormal) minNormal = v
			if (maxNormal === undefined || v > maxNormal) maxNormal = v
		}
	}

	return {
		anomalies,
		mean,
		stdDev,
		min,
		max,
		minNormal,
		maxNormal,
		minAnomaly,
		maxAnomaly,
	}
}

export default detectAnomaliesFast
