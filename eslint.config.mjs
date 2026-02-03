import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.test.ts'],
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-empty-object-type': 'off',
			'no-control-regex': 'off',
			'no-misleading-character-class': 'off',
		},
	},
]
