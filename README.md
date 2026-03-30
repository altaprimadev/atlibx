# atlibx

![License](https://img.shields.io/npm/l/atlibx) ![Node Version](https://img.shields.io/node/v/atlibx) ![Coverage](https://img.shields.io/badge/coverage-96.8%25-brightgreen)

**atlibx** adalah koleksi utilitas internal tanpa dependensi eksternal (zero-dependency) yang dirancang untuk performa dan penggunaan lintas service (backend & frontend).

Library ini mencakup modul untuk manipulasi array, kriptografi, geo-spatial, pemrosesan string, dan banyak lagi.

## Installation

```bash
npm install atlibx
# atau
pnpm add atlibx
# atau
yarn add atlibx
```

## Modules

### 1. Array Utilities

Modul untuk kompresi data JSON array of objects. Sangat berguna untuk mengurangi payload size API response.

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

// 1. Flatten: Mengubah array of object menjadi struktur terkompresi
const compressed = flatten(['id', 'name', 'role'], users)

// 2. Unflatten: Mengembalikannya ke bentuk semula
const restored = unflatten(compressed)
```

---

### 2. Crypto Utilities (AES-GCM & Steganography)

Wrapper untuk enkripsi simetris AES-256-GCM dan utilitas steganografi berbasis _Zero-Width Characters_.

**Import:**

```ts
import { encrypt, decrypt, steganoEncode, steganoDecode } from 'atlibx/crypto'
```

**Usage (AES):**

```ts
const secret = 'my-super-secret-password-at-least-32-chars'
const { result: encrypted } = await encrypt('My Secret Message', secret)
const { result: decrypted } = await decrypt(encrypted, secret)
```

**Usage (Steganography):**

```ts
// Menyembunyikan teks rahasia di dalam teks publik secara invisible
const visible = 'This is a normal tweet.'
const hidden = 'Secret password'
const combined = steganoEncode(visible, hidden, 'seed-key')

const decoded = steganoDecode(combined, 'seed-key')
console.log(decoded.hiddenText) // "Secret password"
```

---

### 3. Map / Geo Utilities

Utilitas geografis untuk perhitungan arah dan encoding polyline.

**Import:**

```ts
import { calculateHeading, encodePolyline, decodePolyline, interpolateHeading } from 'atlibx/map'
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
```

---

### 4. String Utilities

Kumpulan fungsi sanitasi string berperforma tinggi.

**Import:**

```ts
import { sanitizeString, kebabLower, snakeLower } from 'atlibx/string'
```

**Usage:**

```ts
sanitizeString('  Hello   World! \u0000 ') // "Hello World!"
kebabLower('Hello World') // "hello-world"
```

---

### 5. Parser Utilities (Teltonika)

Parser protokol Teltonika (Codec 8 & 8 Extended) yang dioptimasi menggunakan Buffer.

**Import:**

```ts
import { TeltonikaParser } from 'atlibx/parser'
```

---

### 6. Object & Ensure Utilities

Sanitasi objek dan validasi tipe data dasar.

**Import:**

```ts
import { sanitizeObject, jsonSafeParse } from 'atlibx/object'
import { ensureFiniteNumber } from 'atlibx/ensure'
```

**Usage:**

```ts
sanitizeObject({ name: '  John  ', age: '25' }) // { name: 'John', age: 25 }
ensureFiniteNumber('123.45', 0) // 123.45
```

---

### 7. Regex Constants

Kumpulan regex yang sudah dikompilasi untuk berbagai kebutuhan pembersihan data.

**Import:**

```ts
import { whitespaceRegex, controlCharsRegex, urlWithVersionRegex } from 'atlibx/regex'
```

---

### 8. Common Utilities

Utilitas umum lainnya.

**Import:**

```ts
import { sleep } from 'atlibx/common'
```

**Usage:**

```ts
await sleep(1000) // Delay 1 second
```

---

### 9. Validator Utilities

Utilitas untuk validasi format data tipe tertentu.

**Import:**

```ts
import { isValidPasswordFormat, isRecord } from 'atlibx/validator'
```

**Usage:**

```ts
isRecord({ key: 'value' }) // true
```

---

### 10. Function Utilities

Utilitas terkait eksekusi fungsi (_function execution_) dan deteksi anomali berbasis statistik.

**Import:**

```ts
import { throttle, debounce, detectAnomalies, detectAnomaliesFast } from 'atlibx/function'
```

**Usage:**

```ts
// 1. Throttle: Membatasi eksekusi fungsi maksimal sekali per milidetik tertentu.
const logThrottle = throttle((message: string) => {
	console.log(message)
}, 1000)

logThrottle('Hello') // Tereksekusi langsung
logThrottle('World') // Diabaikan
// 1 detik kemudian, logThrottle('World') atau argumen terakhir akan tereksekusi jika opsi trailing true (default)

logThrottle.cancel() // Membatalkan throttle
logThrottle.flush() // Mengeksekusi segera panggilan yang tertunda

// 2. Debounce: Menunda eksekusi fungsi sampai periode tenang (tanpa pemanggilan) berlalu.
const logDebounce = debounce((message: string) => {
	console.log(message)
}, 500)

logDebounce('Type 1') // Tertunda
logDebounce('Type 2') // Tertunda, me-reset timer
// 500 milidetik setelah pemanggilan terakhir, logDebounce('Type 2') tereksekusi

logDebounce.cancel() // Membatalkan debounce
logDebounce.flush() // Mengeksekusi segera panggilan yang tertunda

// 3. detectAnomalies: Deteksi anomali lengkap dengan z-score, deviation, dan summary statistik.
const data = [
	{ key: 'sensor-1', value: 10 },
	{ key: 'sensor-2', value: 12 },
	{ key: 'sensor-3', value: 11 },
	{ key: 'sensor-4', value: 500 }, // outlier
]
const result = detectAnomalies(data, 2) // threshold default = 2 (2σ)
// result.mean, result.stdDev, result.upperBound, result.lowerBound
// result.anomalies  → AnomalyResult[] (key, value, isAnomaly, zScore, deviation)
// result.normals    → AnomalyResult[]
// result.totalAnomalies, result.totalNormal

// 4. detectAnomaliesFast: Versi ringan, hanya mengembalikan daftar anomali tanpa z-score/deviation.
const fast = detectAnomaliesFast(data, 2)
// fast.mean, fast.stdDev
// fast.anomalies → KeyValueData[] (key, value)
```

## Requirements

- Node.js >= 22.0.0
- ES Module Support

## License

ISC
