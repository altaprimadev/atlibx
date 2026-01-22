# atlibx

![License](https://img.shields.io/npm/l/atlibx)
![Node Version](https://img.shields.io/node/v/atlibx)

**atlibx** adalah koleksi utilitas internal tanpa dependensi eksternal (zero-dependency) yang dirancang untuk performa dan penggunaan lintas service (backend & frontend).

Library ini mencakup modul untuk manipulasi array, kriptografi ringan, geo-spatial, dan pemrosesan string.

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
  { id: 2, name: 'Bob', role: 'user' }
]

// 1. Flatten: Mengubah array of object menjadi struktur terkompresi
const compressed = flatten(['id', 'name', 'role'], users)
/*
Output:
{
  h: ['id', 'name', 'role'],
  0: [1, 'Alice', 'admin'],
  1: [2, 'Bob', 'user']
}
*/

// 2. Unflatten: Mengembalikannya ke bentuk semula
const restored = unflatten(compressed)
// Output: [{ id: 1, ... }, { id: 2, ... }]
```

---

### 2. String Utilities
Kumpulan fungsi sanitasi dan format string. Menggunakan regex yang sudah dioptimasi (pre-compiled).

**Import:**
```ts
import { sanitizeString, kebabLower, snakeLower } from 'atlibx/string'
```

**Usage:**

```ts
// 1. Sanitize: Membersihkan karakter kontrol, emoji, dan spasi berlebih
const dirtyInput = "  Hello   World! \u0000 "
console.log(sanitizeString(dirtyInput))
// Output: "Hello World!"

// 2. Formatting
console.log(kebabLower("Hello World 123")) // "hello-world-123"
console.log(snakeLower("Hello World 123")) // "hello_world_123"
```

---

### 3. Map / Geo Utilities
Utilitas ringan untuk perhitungan geografis dan encoding polyline (Google Maps Polyline algorithm).

**Import:**
```ts
import { calculateHeading, encodePolyline, decodePolyline } from 'atlibx/map'
```

**Usage:**

```ts
// 1. Calculate Heading: Menghitung arah (bearing) akurat antara dua koordinat
// Otomatis handle "deadzone" jika pergerakan < 3 meter.
const heading = calculateHeading({
  previousCoordinate: { lat: -6.200, lng: 106.816 },
  currentCoordinate: { lat: -6.199, lng: 106.817 }
})

// 2. Polyline Encoding (Kompresi koordinat jalur menjadi string)
const path = [[-6.2, 106.8], [-6.3, 106.9]]
const encoded = encodePolyline(path)
// Output string aneh seperti "`~oia@..."

// 3. Polyline Decoding
const decoded = decodePolyline(encoded)
// Kembali menjadi array coordinate
```

---

### 4. Crypto Utilities (AES-GCM)
Wrapper sederhana untuk enkripsi simetris menggunakan AES-256-GCM.
> **Note:** Modul ini saat ini menggunakan `node:crypto`. Pastikan environment anda mendukungnya (Node.js >= 22).

**Import:**
```ts
import { encrypt, decrypt } from 'atlibx/crypto'
```

**Usage:**

```ts
const secret = "my-super-secret-password-at-least-32-chars"
const data = "Rahasia Negara"

// Encrypt
const { isSuccess, result } = await encrypt(data, secret)
if (isSuccess) {
  console.log("Encrypted (Base64):", result)
}

// Decrypt
const dec = await decrypt(result, secret)
console.log("Decrypted:", dec.result) // "Rahasia Negara"
```

## Requirements
*   Node.js >= 22.0.0 (sesuai `package.json` engines)
*   Support ESM (Project ini adalah ES Module native).

## License
ISC
