import { defineConfig } from 'tsup'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		crypto: 'src/modules/crypto/index.ts',
		map: 'src/modules/map/index.ts',
		string: 'src/modules/string/index.ts',
		array: 'src/modules/array/index.ts',
		common: 'src/modules/common/index.ts',
		ensure: 'src/modules/ensure/index.ts',
		object: 'src/modules/object/index.ts',
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
