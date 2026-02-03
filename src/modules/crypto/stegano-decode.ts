import decodeFromZeroWidthCharacter from './stegano-decode-from-zero-width-character'
import { splitZeroWidthCharacters } from './utils'

const steganoDecode = (text: string, seed: string): { originalText: string; hiddenText: string } => {
	const { hiddenText, originalText } = splitZeroWidthCharacters(text)
	const decodedHidden = decodeFromZeroWidthCharacter(hiddenText, seed)

	return { originalText, hiddenText: decodedHidden }
}

export default steganoDecode
