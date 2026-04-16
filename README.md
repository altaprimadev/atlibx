# atlibx

![License](https://img.shields.io/npm/l/atlibx) ![Node Version](https://img.shields.io/node/v/atlibx) ![Coverage](https://img.shields.io/badge/coverage-98.4%25-brightgreen)

**atlibx** is a high-performance, zero-dependency utility library designed for Node.js environments. It provides a robust set of tools for data compression, cryptography, geographic calculations, and function optimization, ensuring cross-service compatibility and minimal bundle overhead.

## Key Features

- **Zero External Dependencies**: Lightweight and secure architecture.
- **High Performance**: Optimized using native Node.js APIs and efficient algorithms.
- **Type Safe**: First-class TypeScript support with comprehensive definitions.
- **Modern Standards**: Built exclusively for ES Modules (Node.js >= 22.0.0).

---

## Installation

Install via your preferred package manager:

### npm

```bash
npm install atlibx
```

### pnpm

```bash
pnpm add atlibx
```

### yarn

```bash
yarn add atlibx
```

---

## Modules

### 1. Array Utilities

Specialized tools for JSON array compression and structural flattening, designed to significantly reduce API payload sizes without losing data integrity.

**Import:**

```ts
import { flatten, unflatten } from 'atlibx/array'
```

**Usage:**

```ts
const users = [
	{ id: 1, name: 'Alice', role: 'admin' },
	{ id: 2, name: 'Bob', role: 'user' },
]

// 1. Flatten: Compress an array of objects into a compact key-indexed structure
const compressed = flatten(['id', 'name', 'role'], users)

// 2. Unflatten: Restore the compressed structure to its original array of objects
const restored = unflatten(compressed)
```

---

### 2. Crypto Utilities (AES-GCM & Steganography)

A secure wrapper for AES-256-GCM symmetric encryption and innovative zero-width character steganography for hiding data within text.

**Import:**

```ts
import { encrypt, decrypt, steganoEncode, steganoDecode } from 'atlibx/crypto'
```

**Usage (AES Encryption):**

```ts
const secret = 'my-super-secret-password-at-least-32-chars'
const { result: encrypted } = await encrypt('My Secret Message', secret)
const { result: decrypted } = await decrypt(encrypted, secret)
```

**Usage (Steganography):**

```ts
// Embedding hidden text within a public string using invisible zero-width characters
const visible = 'This is a normal tweet.'
const hidden = 'Secret password'
const combined = steganoEncode(visible, hidden, 'seed-key')

const decoded = steganoDecode(combined, 'seed-key')
console.log(decoded.hiddenText) // Output: "Secret password"
```

---

### 3. Map / Geo Utilities

Comprehensive geographic utilities including bearing calculation, precise distance measurement using the Vincenty formula, and Google Polyline encoding.

**Import:**

```ts
import { calculateHeading, encodePolyline, decodePolyline, interpolateHeading, getDistance } from 'atlibx/map'
```

**Usage:**

```ts
// 1. Calculate Heading (Bearing)
const heading = calculateHeading({
	previousCoordinate: { latitude: -6.2, longitude: 106.81 },
	currentCoordinate: { latitude: -6.19, longitude: 106.82 },
})

// 2. Polyline Encoding (Google Polyline Algorithm)
const encoded = encodePolyline([
	[latitude1, longitude1],
	[latitude2, longitude2],
])

// 3. Precise Distance Calculation (Vincenty Formula)
const distance = getDistance(
	{ latitude: -6.2, longitude: 106.81 },
	{ latitude: -6.19, longitude: 106.82 },
	'm', // Supported units: 'm', 'km', 'mi', 'nm' (default: 'm')
)
```

---

### 4. String Utilities

High-performance string sanitization and case transformation utilities for clean data handling.

**Import:**

```ts
import { sanitizeString, kebabLower, snakeLower } from 'atlibx/string'
```

**Usage:**

```ts
sanitizeString('  Hello   World! \u0000 ') // Output: "Hello World!"
kebabLower('Hello World') // Output: "hello-world"
```

---

### 5. Parser Utilities (Teltonika)

Highly optimized Buffer-based parser for Teltonika IoT protocols (Codec 8 & 8 Extended).

**Import:**

```ts
import { TeltonikaParser } from 'atlibx/parser'
```

---

### 6. Object Utilities

Utilities for object sanitization and safe JSON parsing.

**Import:**

```ts
import { sanitizeObject, jsonSafeParse } from 'atlibx/object'
```

**Usage:**

```ts
sanitizeObject({ name: '  John  ', age: '25' }) // Output: { name: 'John', age: 25 }
```

---

### 7. Number Utilities

Robust data type enforcement and precision rounding.

**Import:**

```ts
import { ensureFiniteNumber, roundToPrecision } from 'atlibx/number'
```

**Usage:**

```ts
ensureFiniteNumber('123.45', 0) // Output: 123.45
roundToPrecision(1.235, { maxFractionDigits: 2, roundingMode: 'halfEven' }) // Output: 1.24
```

---

### 8. Regex Constants

Pre-compiled and optimized regular expressions for common tasks like whitespace removal and control character detection.

**Import:**

```ts
import { whitespaceRegex, controlCharsRegex, urlWithVersionRegex } from 'atlibx/regex'
```

---

### 9. Common Utilities

General-purpose development utilities, including asynchronous delay handlers.

**Import:**

```ts
import { sleep } from 'atlibx/common'
```

**Usage:**

```ts
await sleep(1000) // Suspend execution for 1000ms
```

---

### 10. Validator Utilities

Lightweight validation tools for verifying common data formats and structures.

**Import:**

```ts
import { isValidPasswordFormat, isRecord } from 'atlibx/validator'
```

**Usage:**

```ts
isRecord({ key: 'value' }) // Output: true
```

---

### 11. Function Utilities

Advanced execution control patterns (throttle/debounce) and statistical anomaly detection algorithms.

**Import:**

```ts
import { throttle, debounce, detectAnomalies, detectAnomaliesFast } from 'atlibx/function'
```

**Usage (Execution Control):**

```ts
// Throttle: Limits function execution frequency
const logThrottle = throttle((message: string) => console.log(message), 1000)

// Debounce: Postpones execution until the quiet period expires
const logDebounce = debounce((message: string) => console.log(message), 500)
```

**Usage (Anomaly Detection):**

```ts
const data = [
	{ key: 'sensor-1', value: 10 },
	{ key: 'sensor-2', value: 12 },
	{ key: 'sensor-3', value: 11 },
	{ key: 'sensor-4', value: 500 }, // Outlier identified via Z-score
]

// Detailed statistical detection (Z-score, StdDev, Bounds)
const result = detectAnomalies(data, 2) // Threshold default = 2 (2σ)
```

---

## Technical Specifications

- **Runtime**: Node.js >= 22.0.0
- **Module System**: ES Modules (ESM)
- **Dependencies**: 0 external dependencies

## License

This project is licensed under the **ISC License**.
