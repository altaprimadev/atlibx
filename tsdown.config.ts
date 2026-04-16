import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		crypto: 'src/modules/crypto/index.ts',
		map: 'src/modules/map/index.ts',
		string: 'src/modules/string/index.ts',
		array: 'src/modules/array/index.ts',
		common: 'src/modules/common/index.ts',
		number: 'src/modules/number/index.ts',
		object: 'src/modules/object/index.ts',
		parser: 'src/modules/parser/index.ts',
		regex: 'src/modules/regex/index.ts',
		validator: 'src/modules/validator/index.ts',
		function: 'src/modules/function/index.ts',
	},
	format: ['esm'],
	dts: true,
	clean: true,
	minify: true,
	treeshake: true,
	target: 'es2022',
	sourcemap: false,
	outDir: 'dist',
})
