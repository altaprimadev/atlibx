import controlCharsRegex from '../regex/control-chars'
import multipleNewlinesRegex from '../regex/multiple-newlines'
import multipleSpacesRegex from '../regex/multiple-spaces'
import nonBasicLatinRegex from '../regex/non-basic-latin'
import spacesBeforeNewlineRegex from '../regex/spaces-before-newline'

const sanitizeString = <T = string>(value: string | undefined | null, fallback: T = '' as unknown as T): string | T => {
	return Number.isFinite(value) || typeof value === 'string'
		? String(value)
				.normalize('NFC')
				// Hapus semua karakter kontrol, kecuali newline dan carriage return
				.replace(new RegExp(controlCharsRegex, 'g'), '')
				// Ganti karakter non-latin dasar (misal simbol, emoji, math) dengan kosong
				.replace(new RegExp(nonBasicLatinRegex, 'g'), '')
				// Collapse tab/spasi sebelum newline
				.replace(new RegExp(spacesBeforeNewlineRegex, 'g'), '\n')
				// Multiple newline jadi satu
				.replace(new RegExp(multipleNewlinesRegex, 'g'), '\n')
				// Collapse multiple spasi/tabs menjadi satu spasi (kecuali newline)
				.replace(new RegExp(multipleSpacesRegex, 'g'), ' ')
				// Final trim
				.trim()
		: fallback
}

export default sanitizeString
