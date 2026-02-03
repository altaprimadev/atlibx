const interpolateHeading = (start: number, end: number, t: number) => {
	const delta = ((end - start + 540) % 360) - 180

	return start + delta * t
}

export default interpolateHeading
