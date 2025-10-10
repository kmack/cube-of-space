/* eslint-env node */
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

// TypeScript Parsing:
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

// React Parsing:
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Compat to load legacy "google" in flat config
import { FlatCompat } from '@eslint/eslintrc';

// IMPORTANT: let compat resolve from the project root (works on Windows paths too)
const compat = new FlatCompat({ baseDirectory: process.cwd() });

// Prune deprecated JSDoc rules from the Google preset (ESLint v9 removed them)
const googleConfigs = compat.extends('google').map((cfg) => {
  if (!cfg?.rules) return cfg;
  const rules = { ...cfg.rules };
  delete rules['valid-jsdoc'];
  delete rules['require-jsdoc'];
  return { ...cfg, rules };
});

export default [
  // Ignore junk
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      'coverage/',
      '**/*.d.ts',
      'eslint.config.*',
    ],
  },

  // Base recommended
  eslint.configs.recommended,

  // Bring in Google’s legacy config via compat
  ...googleConfigs,

  // TS support
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],
      ...(reactPlugin.configs?.recommended?.rules ?? {}),
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            'attach',
            'dispose',
            'object',
            'geometry',
            'material',
            'skeleton',
            'morphTargetDictionary',
            'morphTargetInfluences',
            'position',
            'intensity',
            'args',
            'rotation',
            'scale',
            'castShadow',
            'receiveShadow',
            'renderOrder',
            'transparent',
            'opacity',
            'depthWrite',
            'depthTest',
            'polygonOffset',
            'polygonOffsetFactor',
            'polygonOffsetUnits',
            'side',
            'toneMapped',
            'map',
            'visible',
          ],
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Put Prettier last to disable conflicting stylistic rules
  eslintConfigPrettier,
];
