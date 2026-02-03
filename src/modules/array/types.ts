export type FlattenData = Record<string, unknown>
export type FlattenResultStrict<K extends PropertyKey> = { h: readonly K[] | string[] } & Record<number, unknown[]>
export type FlattenResult = { h: readonly string[] } & Record<number, unknown[]>
export type Flatten = <T extends FlattenData, K extends PropertyKey>(header: readonly K[], data: readonly T[]) => FlattenResultStrict<K>
export type Unflatten = <K extends PropertyKey>(payload: FlattenResultStrict<K> | FlattenResult) => Array<Record<K, unknown>>
