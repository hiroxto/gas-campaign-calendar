module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    'googleappsscript/googleappsscript': true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
    'promise',
    'googleappsscript',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-new': 'off',
    indent: ['error', 2],
    'quote-props': ['error', 'as-needed'],
    'promise/catch-or-return': ['error', { allowThen: true, terminationMethod: ['catch', 'asCallback', 'finally'] }],
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-use-before-define': 'off',
  },
};
