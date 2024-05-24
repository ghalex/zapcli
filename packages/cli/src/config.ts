import Configstore from 'configstore'
import os from 'node:os'
import path from 'node:path'

const homedir = os.homedir()
const currdir = process.cwd()

const loadConfig = async (dir?: string) => {

  try {
    const configDir = dir ? path.resolve(currdir, dir) : currdir

    console.log('Loading config file from: ', configDir + '/zp.config.js')
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
    console.error('Error loading config file. Please make sure you have a zp.config.js file in the root of your project.')
    console.log(e)
    return {
      dataDir: "./data",
      apiUrl: "http://zapant.com/api",
      backtest: {
        analyzers: []
      }
    }
  }
}


export default loadConfig