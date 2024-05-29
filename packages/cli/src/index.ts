#!/usr/bin/env node
import figlet from 'figlet'
import pk from '../package.json'

import { Command } from 'commander'
import create from './commands/create'
import executeCommand from './commands/execute'
import login from './commands/login'
import download from './commands/download'
import backtest from './commands/backtest'
import view from './commands/view'

figlet("- ZapCli -", async (err, data) => {

  const logoText = err ? 'zapcli' : data + '\n'
  const program = new Command()

  program
    .name('zapcli')
    .version(pk.version)
    .usage("command [options]")
    .addHelpText('beforeAll', logoText)

  program.addCommand(login())
  program.addCommand(create())
  program.addCommand(executeCommand())
  program.addCommand(download())
  program.addCommand(backtest())
  program.addCommand(view())

  return program.parse(process.argv)

})