const path = require('path')
const dts = require('rollup-plugin-dts').default
const esbuild = require('rollup-plugin-esbuild').default
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const name = 'zapcli-reports'

module.exports = [
  {
    input: 'src/index.ts',
    external: [
      '@observablehq/plot'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
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
    external: [
      '@observablehq/plot'
    ],
    output: {
      file: path.resolve(__dirname, `dist/${name}.d.ts`),
      format: 'es'
    }
  }
]
