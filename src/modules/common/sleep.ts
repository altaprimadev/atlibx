const sleep = async (timeout: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(undefined)
		}, timeout)
	})
}

export default sleep
