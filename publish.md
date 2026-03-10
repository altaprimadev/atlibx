# Publish

1. entry new modules (if any) at `tsup.config.ts`
2. dependencies upgrade
   ```bash
   pnpm up --latest
   ```
3. build
   ```bash
   pnpm build
   ```
4. generate `exports` at `script/gen-exports.ts`
   ```bash
   pnpm tsx script/gen-exports.ts
   ```
5. git commit
   ```bash
   git checkout main && git add . && git commit -m "chore: updates"
   ```
6. up semantic version (patch, minor, major)
   ```bash
   pnpm semver:patch
   ```
7. release
   ```bash
   pnpm semver:publish
   ```
8. to branch development, rebase from main
   ```bash
   git checkout development && git rebase main
   ```
9. git push
   ```bash
   git push origin development && git checkout main
   ```
