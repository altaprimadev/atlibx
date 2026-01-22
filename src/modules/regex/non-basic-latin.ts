const nonBasicLatinRegex = new RegExp('[^\\u0000-\\u007E\\u00A0-\\u00FF\\u0100-\\u017F\\n\\r]', 'g')

export default nonBasicLatinRegex
