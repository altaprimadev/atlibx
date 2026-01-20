const sanitizeString = <T = string>(value: string | undefined | null, fallback: T = '' as unknown as T): string | T => {
	return Number.isFinite(value) || typeof value === 'string'
		? String(value)
				.normalize('NFC')
				// Hapus semua karakter kontrol, kecuali newline dan carriage return
				.replace(new RegExp('[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u001F\\u007F]', 'g'), '')
				// Ganti karakter non-latin dasar (misal simbol, emoji, math) dengan kosong
				.replace(new RegExp('[^\\u0000-\\u007E\\u00A0-\\u00FF\\u0100-\\u017F\\n\\r]', 'g'), '')
				// Collapse tab/spasi sebelum newline
				.replace(new RegExp('[ \\t]+\\n', 'g'), '\n')
				// Multiple newline jadi satu
				.replace(new RegExp('\\n{2,}', 'g'), '\n')
				// Collapse multiple spasi/tabs menjadi satu spasi (kecuali newline)
				.replace(new RegExp('[^\\S\\r\\n]+', 'g'), ' ')
				// Final trim
				.trim()
		: fallback
}

export default sanitizeString
