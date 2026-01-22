export type FlattenData = Record<string, any>
export type Flatten = <T extends FlattenData, K extends keyof T>(header: readonly K[], data: readonly T[]) => { h: readonly K[] } & Record<number, any[]>
export type Unflatten = <K extends PropertyKey>(payload: any) => Array<Record<K, unknown>>
