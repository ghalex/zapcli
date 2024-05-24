import clc from 'cli-color'
import { Command } from 'commander'
import { data, cache } from '../api'
import loadConfig from '../config'

const program = new Command('download')

// -d parameter ()
export default () => {
  program
    .description('download data from zapant.com')
    .option('-s, --symbols <symbols>', 'comma separated list of symbols')
    .option('-w, --window <window>', 'window size')
    .option('-r, --resolution [resolution]', 'resolution', '1440')
    .option('-d, --date [date]', 'download data until the specified date (YYYY-MM-DD)', undefined)
    .option('-c, --configDir <configDir>', 'config directory')
    .action(async (opts) => {
      try {
        const config = await loadConfig(opts.configDir)
        const { window, resolution } = opts
        const symbols = opts.symbols.split(',')
        const end = opts.end ? new Date(opts.end).toISOString() : undefined

        await data(config).download(symbols, window, resolution, end)
        // const d = cache(config).get("TSLA", 5, 1440, "2024-05-14")
        // console.log(d)
      } catch (e: any) {
        console.error(clc.red(`Error: ${e.message}`))
        return process.exit(0)
      }

    })

  return program
}