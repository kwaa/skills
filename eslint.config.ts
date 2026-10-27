import { defineConfig } from '@moeru/eslint-config'

export default defineConfig()
  .append({
    ignores: ['skills/**', 'docs/research/**'],
  })
  .append({
    files: ['scripts/test.ts'],
    rules: {
      // Fixed commands use the caller's Corepack-managed pnpm and system tar.
      'sonarjs/no-os-command-from-path': 'off',
    },
  })
