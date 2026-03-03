import isRecord from '../validator/is-record'

const hasKey = <K extends string>(v: unknown, key: K): v is Record<K, unknown> => {
	return isRecord(v) && key in v
}

export default hasKey
