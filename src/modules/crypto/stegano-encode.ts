import encodeToZeroWidthCharacter from './stegano-encode-to-zero-width-character'
import { combineShuffleString } from './utils'

const steganoEncode = (text1: string, text2: string, seed: string): string => {
	const hidden = encodeToZeroWidthCharacter(text2, seed)

	return combineShuffleString(text1, hidden)
}

export default steganoEncode
