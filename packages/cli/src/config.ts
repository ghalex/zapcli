import clc from 'cli-color'
import Configstore from 'configstore'
import os from 'node:os'
import path from 'node:path'

const homedir = os.homedir()
const currdir = process.cwd()

const defaultConfig = {
  dataDir: "./data",
  reportsDir: "./reports",
  backtestsDir: "./backtests",
  dataProvider: "zapant",
  execute: {
  },
  backtest: {
    analyzers: []
  },
  report: {
  }
}

const loadConfig = async (dir?: string) => {
  const configDir = dir ? path.resolve(currdir, dir) : currdir

  try {
    const config = await import(configDir + '/zp.config.js')

    const mainConfig = {
      dataDir: "./example/data",
      apiUrl: "http://zapant.com/api",
      backtest: {
        analyzers: []
      },
      ...config.default
    }

    return mainConfig
  } catch (e) {
    console.log(clc.red(`✖ Error loading config file from path:`) + clc.underline(`${configDir}/zp.config.js`))
    console.log(clc.red('✖ Make sure you have a zp.config.js file in the root of your project.'))
    return defaultConfig
  }
}


export default loadConfig