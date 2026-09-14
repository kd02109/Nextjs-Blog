import { fixupConfigRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import * as mdx from 'eslint-plugin-mdx';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const generatedContentRestrictions = [
  {
    group: [
      '.velite',
      '.velite/**',
      '**/.velite',
      '**/.velite/**',
      'velite/generated',
      'velite/generated/**',
    ],
    message: 'Import generated content through src/lib/content.ts.',
  },
];

const supabaseRestrictions = [
  {
    group: ['@supabase/supabase-js', '@supabase/supabase-js/**'],
    message:
      'Use src/lib/supabase/browser.ts or src/server/supabase.ts instead.',
  },
];

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
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [...generatedContentRestrictions, ...supabaseRestrictions],
        },
      ],
    },
  },
  {
    files: ['src/lib/content.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: supabaseRestrictions }],
    },
  },
  {
    files: ['src/lib/supabase/browser.ts', 'src/server/supabase.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: generatedContentRestrictions },
      ],
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
