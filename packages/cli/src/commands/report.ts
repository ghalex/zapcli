import { Command } from 'commander'
import loadConfig from '../config'
import storage from '../storage'
import * as api from '../api'
import clc from 'cli-color'

const program = new Command('report')

export default () => {
  program
    .description('generate a html report file')
    .option('-n, --name <name>', 'report name, defaults to report.html')
    // .option('-d, --data <data>', 'data directory')
    .option('-c, --configDir <configDir>', 'config directory')
    .action(async (opts) => {
      try {

        const config = await loadConfig(opts.configDir)
        opts.name = opts.name ?? config.report?.name ?? 'report.html'
        // opts.data = opts.data ?? config.report?.dataDir ?? 'reports/data'

        console.log(clc.cyanBright(`→ Generating report: `) + clc.underline(opts.name))
        const report = api.report(config).generateReport(opts.name)

        console.log(clc.greenBright(`✔ Report generated: `) + clc.underline(report) + '\n')

      } catch (e: any) {
        console.error(clc.redBright(`✖ Error: ${e.message}`))
      }
    })

  return program
}