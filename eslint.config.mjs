import { fixupConfigRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import * as mdx from 'eslint-plugin-mdx';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  ...fixupConfigRules([...nextVitals, ...nextTypeScript]),
  ...fixupConfigRules([
    {
      ...mdx.flat,
      files: ['posts/**/*.mdx'],
      processor: mdx.createRemarkProcessor(),
      rules: {
        ...mdx.flat.rules,
        '@next/next/no-img-element': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-unused-expressions': 'off',
      },
    },
  ]),
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
  {
    ...prettierRecommended,
    rules: {
      ...prettierRecommended.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['posts/**/*.mdx'],
    rules: {
      'prettier/prettier': 'off',
    },
  },
]);
