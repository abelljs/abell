module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ['google', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'prettier/prettier': ['error'],
    'comma-dangle': 0,
    'no-trailing-spaces': 0,
    'arrow-parens': 0,
    'guard-for-in': 0,
    'operator-linebreak': [
      'error',
      'after',
      {
        overrides: { '?': 'ignore', ':': 'ignore', '+': 'ignore' }
      }
    ],
    indent: [
      'error',
      2,
      {
        CallExpression: { arguments: 'first' },
        ignoredNodes: [
          'CallExpression > CallExpression',
          'CallExpression > MemberExpression'
        ],
        SwitchCase: 1
      }
    ],
    'max-len': ['error', { code: 80, ignoreComments: true }]
  }
};
