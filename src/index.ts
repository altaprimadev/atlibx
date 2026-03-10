// common
export { sleep } from './modules/common'

// string
export { sanitizeString, kebabLower, snakeLower } from './modules/string'

// map
export { decodePolyline, encodePolyline, calculateHeading, linearInterpolation, interpolateHeading } from './modules/map'
export type { Coordinate, CoordinateObject } from './modules/map'

// array
export { flatten, unflatten } from './modules/array'
export type { Flatten, Unflatten, FlattenData, FlattenResult, FlattenResultStrict } from './modules/array'

// ensure
export { ensureFiniteNumber } from './modules/ensure'

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
export { throttle, debounce } from './modules/function'
export type { ThrottleOptions, ThrottledFunction, DebounceOptions, DebouncedFunction } from './modules/function/types'
