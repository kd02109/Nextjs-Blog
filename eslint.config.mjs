import { fixupConfigRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...fixupConfigRules([...nextVitals, ...nextTypeScript]),
  globalIgnores([
    '.contentlayer/**',
    '.next/**',
    '.velite/**',
    'coverage/**',
    'database.types.ts',
    'out/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  {
    files: ['*.config.js', 'next.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
