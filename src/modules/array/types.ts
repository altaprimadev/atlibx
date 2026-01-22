export type FlattenData = Record<string, any>
export type FlattenResultStrict<K extends PropertyKey> = { h: readonly K[] | string[] } & Record<number, any[]>
export type FlattenResult = { h: readonly string[] } & Record<number, any[]>
export type Flatten = <T extends FlattenData, K extends keyof T>(header: readonly K[], data: readonly T[]) => FlattenResultStrict<K>
export type Unflatten = <K extends PropertyKey>(payload: any) => Array<Record<K, unknown>>
