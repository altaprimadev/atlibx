const ensureArray = <T>(value: T | undefined | null): T extends unknown[] ? T : Exclude<T, undefined | null>[] => {
	return (value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]) as T extends unknown[] ? T : Exclude<T, undefined | null>[]
}

export default ensureArray
