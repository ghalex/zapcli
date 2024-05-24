const path = require('path')
const esbuild = require('rollup-plugin-esbuild').default
const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')

const name = 'zptrade-cli'

module.exports = [
  {
    input: 'src/index.ts',
    external: [
      'figlet',
      'commander',
      'configstore',
      'ora',
      'zlib',
      'prompts',
      'shelljs',
      'ramda',
      'axios',
      'cli-color',
      'node:fs',
      'node:path',
      'node:os',
      'node:zlib',
      'zplang',
      'zptrade',
      'zptrade-backtest',
      'dayjs',
      'voca',
      '@zapant/calendar'
    ],
    plugins: [
      esbuild(),
      json(),
      commonjs()
    ],
    output: [
      {
        file: path.resolve(__dirname, `dist/${name}.es.mjs`),
        format: 'es'
      }
    ]
  }
]