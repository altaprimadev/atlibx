import type { DetectionSummary, KeyValueData } from './types'

const detectAnomaliesFast = (data: KeyValueData[], threshold: number = 2): Pick<DetectionSummary, 'mean' | 'stdDev'> & { anomalies: KeyValueData[] } => {
	const n = data.length
	if (n === 0) return { anomalies: [], mean: 0, stdDev: 0 }

	let mean = 0
	let m2 = 0

	for (let i = 0; i < n; i++) {
		const delta = data[i].value - mean
		mean += delta / (i + 1)
		m2 += delta * (data[i].value - mean)
	}

	const stdDev = Math.sqrt(m2 / n)
	const upper = mean + threshold * stdDev
	const lower = mean - threshold * stdDev
	const anomalies: KeyValueData[] = []

	for (let i = 0; i < n; i++) {
		const v = data[i].value
		if (v > upper || v < lower) {
			anomalies.push(data[i])
		}
	}

	return { anomalies, mean, stdDev }
}

export default detectAnomaliesFast
