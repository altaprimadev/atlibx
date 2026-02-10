# atlibx

![License](https://img.shields.io/npm/l/atlibx) ![Node Version](https://img.shields.io/node/v/atlibx) ![Coverage](https://img.shields.io/badge/coverage-99.7%25-brightgreen)

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
	previousCoordinate: { lat: -6.2, lng: 106.81 },
	currentCoordinate: { lat: -6.19, lng: 106.82 },
})

// 2. Polyline Encoding (Google Polyline Algorithm)
const encoded = encodePolyline([
	[lat1, lng1],
	[lat2, lng2],
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

## Requirements

- Node.js >= 22.0.0
- ES Module Support

## License

ISC
