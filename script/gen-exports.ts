// scripts/gen-exports.ts
import { readdirSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'

type ExportTarget = {
	types: string
	import: string
	default: string
}

type ExportMap = Record<string, ExportTarget>

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile()
	} catch {
		return false
	}
}

function unique<T>(arr: T[]): T[] {
	return Array.from(new Set(arr))
}

/**
 * Generate package.json "exports" map based on dist directory content.
 * - index -> "."
 * - other entries -> "./<name>"
 * - requires dist/<name>.js and dist/<name>.d.ts to exist (otherwise skipped)
 */
export function generateExports(distDir = 'dist'): { exports: ExportMap } {
	const absDist = join(process.cwd(), distDir)
	const files = readdirSync(absDist)

	// collect base names from .js files only (your desired output uses .js)
	const jsBases = files.filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -'.js'.length))

	const bases = unique(jsBases).sort((a, b) => a.localeCompare(b))

	const exportsMap: ExportMap = {}

	for (const base of bases) {
		const jsPath = join(absDist, `${base}.js`)
		const dtsPath = join(absDist, `${base}.d.ts`)

		if (!isFile(jsPath)) continue
		if (!isFile(dtsPath)) continue

		const key = base === 'index' ? '.' : `./${base}`

		// Use POSIX paths for package.json (always forward slashes)
		const jsRel = posix.join('.', distDir, `${base}.js`)
		const dtsRel = posix.join('.', distDir, `${base}.d.ts`)

		exportsMap[key] = {
			types: `./${dtsRel}`,
			import: `./${jsRel}`,
			default: `./${jsRel}`,
		}
	}

	return { exports: exportsMap }
}

// If run directly: print JSON to stdout
if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
	const distDir = process.argv[2] ?? 'dist'
	const out = generateExports(distDir)
	process.stdout.write(JSON.stringify(out, null, 2) + '\n')
}
