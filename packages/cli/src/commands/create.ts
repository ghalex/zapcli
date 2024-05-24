import clc from 'cli-color'

import { Command } from 'commander'
import prompts from 'prompts'
import ora from 'ora'
import shell from 'shelljs'
import fs from 'node:fs'

const program = new Command('create')

const createProject = async (name: string) => {
  if (fs.existsSync(name)) {
    console.log(`${clc.red('✖ Error: ')} Path ${name} already exists and is not an empty directory`)
    return false
  }

  const spinner = ora(`Creating project ${clc.bold.cyanBright(name)}`).start()
  const res = shell.exec(`git clone https://github.com/zapant-com/zplang-hello.git ${name}`, { silent: true })
  if (res.code === 0) {
    shell.rm('-rf', name + '/.git')

    spinner.succeed()
    console.log(`${clc.green('✔ Success: ')} Project ${clc.bold.cyanBright(name)} created successfully`)

    return true
  } else {
    spinner.fail()
    console.log(`${clc.red('✖ Error: ')} Project ${name} could not be created`)

    return false
  }
}

const installDependencies = async (projectName:string, pkName: string) => {
  shell.cd(projectName)
  const spinner = ora(`Installing dependencies`).start()
  const res = shell.exec(`${pkName} install`, { silent: true })

  if (res.code === 0) {
    spinner.succeed()
    console.log(`${clc.green('✔ Success: ')} Dependencies installed successfully`)
  } else {
    spinner.fail()
    console.log(`${clc.red('✖ Error: ')} Dependencies could not be installed`)
  }
}

export default () => {
  program
    .usage('<name> [options]')
    .description('create a new project')
    .argument('name', 'project name')
    .action(async (projectName, opts) => {
        // const { name } = await prompts({ type: 'text', name: 'name', message: 'Enter project name', initial: projectName })

        const { confirm } = await prompts({
          type: 'toggle',
          name: 'confirm',
          message: `Are you sure you want to create project (${projectName})?`,
          initial: true,
          active: 'yes',
          inactive: 'no'
        })

        if (confirm) {
          const data = await createProject(projectName)
          if (!data) return

          const { mustInstallDependencies } = await prompts({
            type: 'toggle',
            name: 'mustInstallDependencies',
            message: `Would you like to install dependencies?`,
            initial: true,
            active: 'yes',
            inactive: 'no'
          })

          if (mustInstallDependencies) {
            const { pkName } = await prompts({
              type: 'select',
              name: 'pkName',
              message: `Select a package manager?`,
              choices: [
                { title: 'npm', value: 'npm' },
                { title: 'yarn', value: 'yarn' },
                { title: 'pnpm', value: 'pnpm' }
              ]
            })

            await installDependencies(projectName, pkName)
          }
        }

    })

  return program
}