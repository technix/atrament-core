import airbnb from 'eslint-stylistic-airbnb';
import globals from 'globals';

export default [
  airbnb.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // explicitly disable deprecated rules in @stylistic v6
      '@stylistic/array-bracket-newline': 'off',
      '@stylistic/array-element-newline': 'off',
      '@stylistic/array-bracket-spacing': 'off',
      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/object-property-newline': 'off',
      // new rules in @stylistic v6
      '@stylistic/list-style': ['error', {
        singleLine: { spacing: 'never' },
        overrides: {
          '[]': { singleLine: { maxItems: 2 } },
          '{}': { singleLine: { spacing: 'always', maxItems: 3 } }
        }
      }],
      // other
      '@stylistic/comma-dangle': ['error', 'never'],
      'no-param-reassign': ['error', { props: false }],
      'no-use-before-define': ['error', { functions: false, classes: false }],
      'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
