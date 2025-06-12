// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import * as parserVue from 'vue-eslint-parser';
import configTypeScript from '@vue/eslint-config-typescript';
import configPrettier from '@vue/eslint-config-prettier';

export default [{
  name: 'app/files-to-lint',
  files: ['**/*.{ts,mts,tsx,vue}'],
}, {
  name: 'app/files-to-ignore',
  ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
}, js.configs.recommended, ...pluginVue.configs['flat/essential'], ...configTypeScript(), configPrettier, {
  name: 'app/vue-rules',
  files: ['**/*.vue'],
  languageOptions: {
    parser: parserVue,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      parser: '@typescript-eslint/parser',
    },
  },
  rules: {
    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',

    // Vue-specific DRY enforcement
    'vue/no-duplicate-attributes': 'error',
    'vue/no-unused-components': 'error',
    'vue/no-unused-vars': 'error',
    'vue/require-prop-types': 'error',
    'vue/require-default-prop': 'error',

    // Enforce consistent component structure
    'vue/block-order': [
      'error',
      {
        order: ['template', 'script', 'style'],
      },
    ],

    // Enforce proper event naming
    'vue/custom-event-name-casing': ['error', 'kebab-case'],

    // Enforce prop naming
    'vue/prop-name-casing': ['error', 'camelCase'],
  },
}, {
  name: 'app/typescript-rules',
  files: ['**/*.{ts,tsx,mts}'],
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error', // Stricter than warn
    '@typescript-eslint/no-inferrable-types': 'off',

    // Enhanced TypeScript rules for professional standards
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],

    // Enforce consistent type imports
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
  },
}, {
  name: 'app/config-files',
  files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
  languageOptions: {
    globals: {
      process: 'readonly',
      require: 'readonly',
      module: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
  },
}, {
  name: 'app/structured-logging',
  rules: {
    // Enforce structured logging format
    'no-console': 'off', // Allow console in development
    'prefer-template': 'error', // Enforce template literals for logging

    // Allow structured logging markers in comments
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['[', ']'], // Allow [feature][category] markers
      },
    ],
  },
}, {
  name: 'app/dry-principles',
  rules: {
    // Enforce DRY principles
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'no-useless-return': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Complexity rules to encourage abstraction
    complexity: ['warn', { max: 10 }],
    'max-lines-per-function': ['warn', { max: 50 }],
    'max-depth': ['warn', { max: 4 }],
    'max-params': ['warn', { max: 4 }],
    'max-nested-callbacks': ['warn', { max: 3 }],

    // Encourage proper abstractions
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2],
        ignoreArrayIndexes: true,
        enforceConst: true,
      },
    ],
  },
}, {
  name: 'app/gambling-domain-specific',
  rules: {
    // Domain-specific rules for gambling terminology
    'id-length': ['error', { min: 3, max: 30 }],
    camelcase: [
      'error',
      {
        properties: 'never',
        ignoreDestructuring: false,
        allow: [
          // Allow gambling-specific abbreviations
          'kelly_criterion',
          'monte_carlo',
          'burn_cards',
          'edge_calc',
        ],
      },
    ],
  },
}, {
  name: 'app/yarn-only-policy',
  rules: {
    // Enforce yarn-only usage
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/npm\\s+(install|run|start|build|test)/]',
        message:
          'Use yarn instead of npm. Replace "npm install" with "yarn install", "npm run" with "yarn", etc.',
      },
      {
        selector: 'Literal[value="npm install"]',
        message: 'Use "yarn install" instead of "npm install".',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw=/npm\\s+(install|run|start|build|test)/]',
        message: 'Use yarn instead of npm in template literals.',
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'npm',
        message: 'Use yarn instead of npm for package management.',
      },
    ],
  },
}, {
  name: 'app/general-rules',
  rules: {
    // General JavaScript/TypeScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'only-multiline'],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],

    // Additional professional standards
    'no-unused-expressions': 'error',
    'no-unreachable': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-sparse-arrays': 'error',
    'no-unexpected-multiline': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',

    // Best practices
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'error',
    curly: 'error',
    'default-case': 'error',
    'dot-notation': 'error',
    eqeqeq: 'error',
    'guard-for-in': 'error',
    'no-alert': 'warn',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'error',
    'no-empty-pattern': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-global-assign': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-void': 'error',
    'no-warning-comments': 'warn',
    'no-with': 'error',
    radix: 'error',
    'vars-on-top': 'error',
    'wrap-iife': 'error',
    yoda: 'error',
  },
}, ...storybook.configs["flat/recommended"]];
