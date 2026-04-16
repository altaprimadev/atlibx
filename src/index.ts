// common
export { sleep } from './modules/common'

// string
export { sanitizeString, kebabLower, snakeLower } from './modules/string'

// map
export { decodePolyline, encodePolyline, calculateHeading, linearInterpolation, interpolateHeading, getDistance } from './modules/map'
export type { Coordinate, CoordinateObject, DistanceUnit } from './modules/map'

// array
export { flatten, unflatten, ensureArray } from './modules/array'
export type { Flatten, Unflatten, FlattenData, FlattenResult, FlattenResultStrict } from './modules/array'

// number
export { ensureFiniteNumber, roundToPrecision } from './modules/number'
export type { RoundToPrecisionOptions, RoundingMode } from './modules/number'

// object
export { sanitizeObject, jsonSafeParse } from './modules/object'
export type { SanitizeObjectOptions, JSONSafeParseResult } from './modules/object'

// regex
export { controlCharsRegex, multipleNewlinesRegex, multipleSpacesRegex, nonBasicLatinRegex, spacesBeforeNewlineRegex, urlWithVersionRegex, whitespaceRegex } from './modules/regex'

// crypto
export { encrypt, decrypt, steganoEncode, steganoDecode, steganoEncodeToZeroWidthCharacter, steganoDecodeFromZeroWidthCharacter } from './modules/crypto'
export type { CryptoResult } from './modules/crypto/types'

// parser
export { TeltonikaParser } from './modules/parser'
export type { TeltonikaAvlData, TeltonikaRecord } from './modules/parser'

// validator
export { isValidPasswordFormat, isRecord } from './modules/validator'

// function
export { throttle, debounce, detectAnomalies, detectAnomaliesFast } from './modules/function'
export type { ThrottleOptions, ThrottledFunction, DebounceOptions, DebouncedFunction, KeyValueData, AnomalyResult, DetectionSummary } from './modules/function/types'
