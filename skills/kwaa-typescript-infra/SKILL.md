---
name: kwaa-typescript-infra
description: kwaa's opinionated infrastructure conventions for TypeScript libraries and monorepos. Use when configuring pnpm workspaces, TypeScript, ESLint, Vitest, package builds and exports, optional Oxlint or Turborepo acceleration, versioning, or npm publishing.
---

# TypeScript infrastructure

## General

- Inspect and preserve existing repository conventions before applying these preferences.
- Prefer ESM, strict TypeScript, shared root configuration, and small package-level scripts.
- Keep library, Node.js, application, documentation, and generated-code concerns separate.
- Do not add tooling without a concrete task or quality gate that uses it.
- Use `kwaa-typescript-taste` for source-level TypeScript design and style.

---

## pnpm workspace

- Pin pnpm with the root `packageManager` field.
- Keep the workspace root private and set `"type": "module"`.
- Define package groups explicitly in `pnpm-workspace.yaml`.
- Use `workspace:` for internal dependencies.
- Enable `trustPolicy: no-downgrade` when supported.
- Keep `onlyBuiltDependencies` minimal.

### Catalogs

Use named catalogs in `pnpm-workspace.yaml`:

| Catalog | Purpose |
| --- | --- |
| `prod` | Production dependencies |
| `inlined` | Dependencies inlined by the bundler |
| `dev` | Linting, building, and testing tools |
| `frontend` | Frontend libraries |

Avoid the default catalog. Adjust names and add focused catalogs for project-specific compatibility matrices.

### Checking npm package versions

Use `fast-npm-meta` instead of fetching the full registry metadata:

```bash
pnpm dlx fast-npm-meta version vite
pnpm dlx fast-npm-meta version "react@^19.2"
pnpm dlx fast-npm-meta version vite react react-dom
pnpm dlx fast-npm-meta version vite --json
pnpm dlx fast-npm-meta full vite
```

Prefer this over `npm view <pkg> version` when only package versions or dist-tags are needed.

---

## TypeScript

Prefer `@moeru/tsconfig` for portable library code:

```json
{
  "extends": "@moeru/tsconfig",
  "include": ["packages/**/src", "packages/**/test"]
}
```

Use its Node.js preset for configs and scripts:

```json
{
  "extends": "@moeru/tsconfig/tsconfig.node.json",
  "include": ["**/*.config.ts", "**/scripts/**/*.ts"]
}
```

Keep the root config solution-style:

```json
{
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "files": []
}
```

- Keep strictness enabled; fix types instead of weakening compiler options.
- Keep Node.js APIs out of portable library modules.

---

## Linting

Prefer `@moeru/eslint-config` with a small flat config:

```ts
import { defineConfig } from '@moeru/eslint-config'

export default defineConfig()
  .append({
    ignores: ['src/generated/**/*.ts'],
  })
```

- Use focused overrides and ignore generated files explicitly.
- Provide `pnpm lint` and support `pnpm lint --fix`.
- Add Oxlint only when lint speed is a demonstrated concern. Keep ESLint as the source of truth and avoid duplicated rule configuration.
- Use `.editorconfig` with UTF-8, LF, two spaces, final newlines, and trimmed trailing whitespace.

---

## Testing

- Use Vitest with shared root configuration.
- Keep package tests in `test/` unless the repository already colocates them.
- Use `describe` and `it`.
- Use snapshots for complex stable outputs, generated schemas, protocol events, and binary fixtures.
- Prefer deterministic fixtures or explicit local-service setup over developer-machine state.
- Limit workspace concurrency when tests share constrained resources.

---

## Packages and publishing

- Publish pure ESM unless compatibility requirements demand otherwise.
- Keep packages focused; use aggregate packages only as convenience entry points.
- Set `"sideEffects": false` only when accurate.
- Export source during workspace development and built files when publishing:

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
- Prefer pkgroll or tsdown for low-configuration ESM library builds.
- Inspect packed contents and export resolution before publishing.

---

## Optional acceleration

- Add Turborepo only when dependency-aware caching benefits the workspace.
- Keep `turbo.json` small and declare build outputs such as `dist/**`.
- Let package scripts own tasks and Turbo only orchestrate them.
- Treat Oxlint similarly: add it for measurable lint performance benefits, not by default.

---

## Versioning

- Use one workspace version for packages released as a coordinated suite; otherwise preserve independent versions.
- Prefer an explicit version-bump tool over manual package edits.
- Build all publishable packages before release.
- Use npm provenance when the release environment supports trusted publishing.

## Final checks

Run lint, build, and relevant tests. Verify package exports, dependency classes, packed contents, and that published consumers resolve built JavaScript and declarations.
