const controlCharsRegex = new RegExp('[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u001F\\u007F]', 'g')

export default controlCharsRegex
