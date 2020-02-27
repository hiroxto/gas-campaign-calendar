module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
  },
  env: {
    'googleappsscript/googleappsscript': true,
  },
  extends: [
    'plugin:promise/recommended',
    'standard',
  ],
  plugins: [
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
  },
};
