import { Command } from 'commander'
import loadConfig from '../config'
import storage from '../storage'
import * as api from '../api'

const program = new Command('view')

export default () => {
  program
    .description('view configuration object')
    .argument('name', 'object to view ex. config, storage')
    .option('-s, --symbol <symbol>', 'symbol to view cache data')
    .option('-w, --window <window>', 'window size')
    .option('-c, --configDir <configDir>', 'config directory')
    .action(async (name: string, opts) => {

      switch (name) {
        case 'config':
          const config = await loadConfig(opts.configDir)
          console.dir(config, { depth: null, colors: true })
          break

        case 'storage':
          console.dir(storage.all, { depth: null, colors: true })
          break

        case 'data':
          const config2 = await loadConfig(opts.configDir)
          const data = api.cache(config2).getAll(opts.symbol, opts.window ?? 1440)

          console.table(data)
          break


        default:
          console.log('Invalid object to view. Please use config or storage.')
          break;
      }
    })

  return program
}