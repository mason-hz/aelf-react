module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'eslint-plugin-tsdoc'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'eslint-config-prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'tsdoc/syntax': 'warn',
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/ban-ts-comment': 0,
  },
  env: {
    browser: true,
    node: true,
  },
};
