import { Command } from 'commander'
import prompts from 'prompts'
import loadConfig from '../config'
import { auth } from '../api'
import storage from '../storage'

const program = new Command('login')

export default () => {
  program
    .description('login to zapant.com')
    .option('-u, --email <email>', 'zapant email')
    .option('-p, --password <password>', 'zapant password')
    .option('-c, --configDir <configDir>', 'config directory')
    .action(async (opts) => {
      const { email } = opts.email ? { email: opts.email } : await prompts({ type: 'text', name: 'email', message: 'Enter your email', initial: 'ex. yoda@gmail.com', validate: x => x.length > 3 })
      const { pass } = opts.password ? { pass: opts.password } : await prompts({ type: 'password', name: 'pass', message: 'Enter your password' })

      const config = await loadConfig(opts.configDir)
      const data = await auth(config).login(email, pass)

      if (data) {
        const accessToken = data.accessToken
        const user = data.user

        storage.set('accessToken', accessToken)
        storage.set('user', user)
      }
    })

  return program
}