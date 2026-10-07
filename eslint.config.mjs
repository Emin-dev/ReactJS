import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from '@eslint-react/eslint-plugin';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['.next/**', '.test-build/**', 'playwright-report/**', 'test-results/**', 'browser-baseline/**', 'next-env.d.ts']),
  { files: ['browser/**/*.cjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  { files: ['**/*.{js,cjs,mjs}'], extends: [js.configs.recommended], languageOptions: { globals: globals.node } },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...ts.configs.recommended, react.configs.recommended, hooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  prettier,
]);
