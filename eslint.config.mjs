/* eslint-env node */
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

// TypeScript Parsing:
import tsPlugin from '@typescript-eslint/eslint-plugin';

// React Parsing:
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Security & Accessibility:
import security from 'eslint-plugin-security';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierPlugin from 'eslint-plugin-prettier';

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

  // Bring in Google's legacy config via compat (JS files only)
  ...googleConfigs.map((cfg) => ({
    ...cfg,
    files: ['**/*.{js,mjs,cjs}'],
  })),

  // --- Project-wide plugins/rules (mirrors back-end style) ---
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      prettier: prettierPlugin,
      security: security,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // Import sorting
      'import/order': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Import validation and dependency management
      'import/no-unresolved': 'error',
      'import/no-cycle': ['error', { maxDepth: 2 }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'warn',
      'import/no-deprecated': 'warn',

      // Security rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // Run Prettier via ESLint
      'prettier/prettier': 'error',

      // Turn off stylistic conflicts
      'max-len': 'off',
      'require-jsdoc': 'off',
    },
  },

  // Config files (JS)
  {
    files: ['**/*.config.{js,mjs}', 'vite.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Allow console in config files
      'no-console': 'off',
      // Google style can be strict for configs
      'max-len': 'off',
    },
  },

  // TypeScript flat config presets (must be spread as array, not into rules)
  ...tsPlugin.configs['flat/recommended-type-checked'].map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  // TypeScript + React customizations
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Disable base rules that are covered by TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // Console policy for application code
      'no-console': ['warn', { allow: ['debug', 'info', 'warn', 'error'] }],

      // TypeScript specific overrides for React Three Fiber
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],

      // Relaxed rules for Three.js integration
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Helpful but not overwhelming
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off', // Too noisy with Three.js

      // Strengthen async handling for production
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'warn',

      // Naming conventions for consistency
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // React rules
      ...(reactPlugin.configs?.recommended?.rules ?? {}),
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/jsx-uses-vars': 'error',

      // React Three Fiber specific - expanded props list
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            // Three.js Object3D properties
            'args',
            'attach',
            'attachArray',
            'attachObject',
            'dispose',
            'object',
            'geometry',
            'material',
            'skeleton',
            'position',
            'rotation',
            'scale',
            'visible',
            'castShadow',
            'receiveShadow',
            // Light properties
            'intensity',
            'color',
            'distance',
            'decay',
            'angle',
            'penumbra',
            // Animation properties
            'morphTargetDictionary',
            'morphTargetInfluences',
            // Camera properties
            'fov',
            'aspect',
            'near',
            'far',
            'zoom',
            // Material properties
            'transparent',
            'opacity',
            'alphaTest',
            'side',
            'depthWrite',
            'depthTest',
            'map',
            'toneMapped',
            // Mesh properties
            'frustumCulled',
            'renderOrder',
            'userData',
            // R3F specific
            'primitive',
            'ref',
          ],
        },
      ],

      // React Hooks - Use recommended config as per React Compiler migration guide
      ...reactHooks.configs.recommended.rules,

      // React Refresh (HMR safety)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Accessibility rules (WCAG compliance)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'warn',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'warn',
    },
  },

  // Put Prettier last to disable conflicting stylistic rules
  eslintConfigPrettier,
];
