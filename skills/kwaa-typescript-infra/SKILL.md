---
name: kwaa-typescript-infra
description: kwaa's TypeScript project setup rules. Use when configuring workspaces, build and test tools, package exports, or npm publishing.
---

# TypeScript infrastructure

## General

- Read the existing configuration and follow repository conventions.
- Prefer ESM, strict TypeScript, shared root configuration, and short scripts in each package.
- Keep separate configuration for libraries, Node.js scripts, applications, documentation, and generated code.
- Add a tool only when a task or required check uses it.
- Use [kwaa-typescript-best-practices](../kwaa-typescript-best-practices/SKILL.md) for TypeScript design and style.

## pnpm workspace

- Pin pnpm with the root `packageManager` field.
- Keep the workspace root private and set `"type": "module"`.
- Define package groups explicitly in `pnpm-workspace.yaml`.
- Use `workspace:` for internal dependencies.
- If pnpm supports it, set `trustPolicy: no-downgrade`.
- List only the dependencies that need build scripts in `onlyBuiltDependencies`.

### Catalogs

Use named catalogs in `pnpm-workspace.yaml`:

| Catalog | Purpose |
| --- | --- |
| `prod` | Production dependencies |
| `inlined` | Dependencies inlined by the bundler |
| `dev` | Linting, building, and testing tools |
| `frontend` | Frontend libraries |

Avoid the default catalog. Adjust catalog names to match the project.
If dependency versions must vary for compatibility, add separate named catalogs.

### Check npm package versions

Use `fast-npm-meta` to query package versions and metadata:

```bash
pnpm dlx fast-npm-meta version vite
pnpm dlx fast-npm-meta version "react@^19.2"
pnpm dlx fast-npm-meta version vite react react-dom
pnpm dlx fast-npm-meta version vite --json
pnpm dlx fast-npm-meta full vite
```

If you only need versions or dist-tags, prefer `fast-npm-meta` over `npm view <pkg> version`.

## TypeScript

Prefer `@moeru/tsconfig` for portable library code:

```json
{
  "extends": "@moeru/tsconfig",
  "include": ["packages/**/src", "packages/**/test"]
}
```

For configuration files and scripts, use the Node.js preset:

```json
{
  "extends": "@moeru/tsconfig/tsconfig.node.json",
  "include": ["**/*.config.ts", "**/scripts/**/*.ts"]
}
```

Use the root TypeScript configuration to reference the library and Node.js configurations:

```json
{
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "files": []
}
```

- Keep strict checking enabled. Fix type errors without weakening compiler options.
- Keep Node.js APIs out of portable library modules.

## Linting

Prefer `@moeru/eslint-config` with a short flat configuration:

```ts
import { defineConfig } from '@moeru/eslint-config'

export default defineConfig()
  .append({
    ignores: ['src/generated/**/*.ts'],
  })
```

- Limit overrides to the files that need them. Ignore generated files explicitly.
- Provide `pnpm lint` and support `pnpm lint --fix`.
- If lint is too slow, consider Oxlint. Keep rule settings in ESLint and avoid duplicate configuration.
- Use `.editorconfig` with UTF-8, LF, two spaces, final newlines, and trimmed trailing whitespace.

## Testing

- Use Vitest with shared root configuration.
- Keep package tests in `test/`. If the repository puts tests beside source files, follow that layout.
- Use `describe` and `it`.
- Use snapshots for complex outputs that rarely change, generated schemas, protocol events, and binary fixtures.
- Use repeatable test data or set up local services explicitly. Avoid relying on one developer's machine state.
- If tests compete for limited resources, reduce the number of tests that run at once.

## Packages and publishing

- Publish ESM only, unless consumers need another format.
- Give each package a clear purpose. Add a package that re-exports other packages only for consumer convenience.
- Set `"sideEffects": false` only if every importable module has no import-time side effects.
- Export source files during workspace development. Export built files in the published package:

```json
{
  "exports": "./src/index.ts",
  "files": ["dist"],
  "publishConfig": {
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "./package.json": "./package.json"
    },
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
}
```

- Declare every public subpath explicitly, including `./package.json`.
- Put runtime dependencies in `dependencies`, optional host integrations in `peerDependencies`, and tooling in `devDependencies`.
- Prefer pkgroll or tsdown to build ESM libraries with little configuration.
- Before publishing, inspect the package archive and check that its exports resolve.

## Optional tools for faster builds and lint

- Add Turborepo only when caching tasks across dependent packages saves work.
- Keep `turbo.json` small and declare build outputs such as `dist/**`.
- Define tasks in package scripts. Use Turborepo to run them in dependency order.
- Add Oxlint only when measurements show that it speeds up lint.

## Versioning

- Use one version for packages released together as a suite. Otherwise, keep independent versions.
- Prefer a version update tool over manual edits to package files.
- Build all publishable packages before release.
- If the release environment supports trusted publishing, use npm provenance.

## Final checks

Run lint, the build, and relevant tests. Check package exports, dependency placement,
and archive contents. Confirm that consumers of the published package resolve
the built JavaScript and type declarations.
