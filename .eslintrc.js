module.exports = {
  env: {
    es2021: true,
    node: true,
    'jest/globals': true
  },
  extends: 'standard-with-typescript',
  plugins: ['jest'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './packages/backtest/tsconfig.json',
      './packages/cli/tsconfig.json',
      './packages/reports/tsconfig.json',
      './packages/trade/tsconfig.json'
    ],
    tsconfigRootDir: __dirname
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/dot-notation': 'off'
  }
}
