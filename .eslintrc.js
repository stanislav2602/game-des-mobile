module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-new': 'off',
    'linebreak-style': ['error', 'windows'],
    'no-alert': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-len': ['error', { code: 120 }],
  },
};