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
      '@stylistic/comma-dangle': ['error', 'never'],
      'no-param-reassign': ['error', { props: false }],
      'no-use-before-define': ['error', { functions: false, classes: false }],
      'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
