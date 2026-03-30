import type { AnomalyResult, DetectionSummary, KeyValueData } from './types'

const detectAnomalies = (data: KeyValueData[], threshold: number = 2): DetectionSummary => {
	const n = data.length

	if (n === 0) {
		return {
			mean: 0,
			stdDev: 0,
			threshold,
			upperBound: 0,
			lowerBound: 0,
			totalData: 0,
			totalAnomalies: 0,
			totalNormal: 0,
			results: [],
			anomalies: [],
			normals: [],
		}
	}

	let mean = 0
	let m2 = 0

	for (let i = 0; i < n; i++) {
		const v = data[i].value
		const delta = v - mean
		mean += delta / (i + 1)
		m2 += delta * (v - mean)
	}

	const stdDev = Math.sqrt(m2 / n)
	const upperBound = mean + threshold * stdDev
	const lowerBound = mean - threshold * stdDev
	const invStdDev = stdDev === 0 ? 0 : 1 / stdDev
	const results = new Array<AnomalyResult>(n)
	const anomalies: AnomalyResult[] = []
	const normals: AnomalyResult[] = []

	for (let i = 0; i < n; i++) {
		const d = data[i]
		const v = d.value
		const diff = v - mean
		const isAnomaly = v > upperBound || v < lowerBound

		const r: AnomalyResult = {
			key: d.key,
			value: v,
			isAnomaly,
			zScore: diff * invStdDev,
			deviation: diff < 0 ? -diff : diff,
		}
		results[i] = r
		if (isAnomaly) anomalies.push(r)
		else normals.push(r)
	}

	return {
		mean,
		stdDev,
		threshold,
		upperBound,
		lowerBound,
		totalData: n,
		totalAnomalies: anomalies.length,
		totalNormal: normals.length,
		results,
		anomalies,
		normals,
	}
}

export default detectAnomalies
