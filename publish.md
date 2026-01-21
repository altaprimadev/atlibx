# Publish
1. entry new modules (if any) at `tsup.config.ts`
2. build	
	```bash
	pnpm build
	```
3. generate `exports` at `script/gen-exports.ts`
	```bash
	pnpm ts-node script/gen-exports.ts
	```
4. copy `exports` print result to `package.json`
5. up semantic version 
	```bash
	pnpm semver:patch
	```
6. publish
	```bash
	pnpm semver:publish
	```
