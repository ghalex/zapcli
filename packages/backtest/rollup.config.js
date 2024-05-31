const path = require('path')
const dts = require('rollup-plugin-dts').default
const esbuild = require('rollup-plugin-esbuild').default
const pkg = require('./package.json')

const name = 'zapcli-backtest'
// const projectRoot = path.resolve(__dirname, '.')

module.exports = [
  {
    input: 'src/index.ts',
    external: [
      'ramda',
      'dayjs',
      'zplang',
      '@zapcli/core'
    ],
    plugins: [
      esbuild()
    ],
    output: [
      {
        name,
        file: path.resolve(__dirname, `dist/${name}.cjs.js`),
        format: 'cjs'
      },
      {
        file: path.resolve(__dirname, `dist/${name}.es.js`),
        format: 'es'
      }
    ]
  },
  {
    input: 'src/index.ts',
    plugins: [dts()],
    external: [],
    output: {
      file: path.resolve(__dirname, `dist/${name}.d.ts`),
      format: 'es'
    }
  }
]
