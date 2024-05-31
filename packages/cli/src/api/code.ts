import { Env, evalCode } from 'zplang'
import { uniq } from 'ramda'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createJsEnv } from '@zapcli/core'

export default () => {
  /**
   * Run Code
   * @param code 
   * @param bars 
   * @returns 
   */
  const runZpCode = (code: string, bars, inputs: any = {}) => {
    const start = performance.now()

    const zpEnv = new Env({ bars })
    zpEnv.bind('inputs', inputs)
    zpEnv.bind('barIndex', 1)
    zpEnv.bind('date', new Date(Object.values(bars)?.[0]?.[0].date))

    zpEnv.call('setCash', inputs.initialCapital ?? 10_000)
    zpEnv.call('setPositions', inputs.openPositions ?? [])

    const result = evalCode(zpEnv, code)
    const stop = performance.now()
    const inSeconds = (stop - start) / 1000

    return {
      orders: zpEnv.call('getOrders'),
      result,
      stdout: zpEnv.stdout,
      time: inSeconds
    }
  }

  const runJsCode = (code: string, bars, inputs: any = {}) => {
    const start = performance.now()
    const env: any = createJsEnv(bars)

    env.inputs = inputs
    env.barIndex = 1
    env.date = new Date(Object.values(bars)?.[0]?.[0].date)

    env.setCash(inputs.initialCapital ?? 10_000)
    env.setPositions(inputs.openPositions ?? [])

    const execFunc = new Function(code)
    const { run } = execFunc()

    // run code here
    const result = run.call(env)


    const stop = performance.now()
    const inSeconds = (stop - start) / 1000

    return {
      orders: [],
      result: {},
      stdout: env.stdout.join('\n'),
      time: inSeconds
    }
  }

  const runCode = (code: string, lang: string, bars: any, inputs: any = {}) => {
    switch (lang) {
      case 'js':
        return runJsCode(code, bars, inputs)

      case 'zp':
        return runZpCode(code, bars, inputs)

      default:
        throw new Error('Invalid file extension. It should be .js or .zp')
    }
  }

  /**
   * Get Symbols
   * @param code 
   * @param openPositions 
   * @returns 
   */
  const getZpSymbols = (code: string, openPositions: any = [], inputs: any = {}) => {
    const metaEnv = new Env({ isMeta: true })
    metaEnv.bind('barIndex', 1)
    metaEnv.bind('date', new Date())
    metaEnv.bind('inputs', inputs)
    metaEnv.call('setCash', inputs.initialCapital ?? 10_000)

    // Set positions
    metaEnv.call('setPositions', [...openPositions])

    evalCode(metaEnv, code)

    const settings = metaEnv.getPragma()
    const allOpenPositions = [...openPositions, ...(settings.openPositions ?? [])] as any
    const assets: Record<string, number> = metaEnv.getAssets()
    const maxAssets = [...Object.values(assets)]
    const symbols = uniq([...Object.keys(assets), ...allOpenPositions.map(p => p.symbol)])
    const maxWindow = maxAssets.length > 0 ? Math.max(...maxAssets) : 1

    return { symbols, maxWindow, settings }
  }

  function getJsSymbols(code: string, openPositions: any = [], inputs: any = {}) {
    const execFunc = new Function(code)
    const res = execFunc()
    const symbols = uniq([
      ...uniq([...res.assets, ...inputs.assets]),
      ...openPositions.map(p => p.symbol),
      ...(inputs.openPositions?.map(p => p.symbol) ?? [])
    ])

    return { symbols, maxWindow: res.window ?? 1, settings: res.settings ?? {} }
  }

  const getSymbols = (code: string, lang: string, openPositions: any, inputs: any = {}) => {
    switch (lang) {
      case 'js':
        return getJsSymbols(code, openPositions, inputs)

      case 'zp':
        return getZpSymbols(code, openPositions, inputs)

      default:
        throw new Error('Invalid file extension. It should be .js or .zp')
    }
  }

  /**
   * Read Code
   * @param fileName 
   * @returns 
   */
  const readCode = (fileName: string) => {
    const filePath = path.join(process.cwd(), fileName)

    if (!fs.existsSync(filePath)) {
      throw new Error(`File "${fileName}" does not exist`)
    }

    return fs.readFileSync(filePath, 'utf8')
  }

  return { runCode, getSymbols, readCode }
}