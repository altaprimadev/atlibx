import { defineConfig } from 'tsup'

export default defineConfig({
	entry: { index: 'src/index.ts', crypto: 'src/modules/crypto/index.ts', map: 'src/modules/map/index.ts', string: 'src/modules/string/index.ts' },
	format: ['esm'],
	dts: true,
	clean: true,
	minify: true,
	treeshake: true,
	target: 'es2022',
	sourcemap: false,
	outDir: 'dist',
})
