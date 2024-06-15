import clc from 'cli-color'
import fse from 'fs-extra'
import { Command } from 'commander'
import prompts from 'prompts'
import ora from 'ora'
import shell from 'shelljs'
import fs from 'node:fs'
import path from 'node:path'
import voca from 'voca'

const program = new Command('create')

const createProject = async (name: string, projectDir: string) => {
  const spinner = ora(`Creating project ${clc.bold.cyanBright(name)} in ${clc.underline(path.join(process.cwd(), projectDir))}`).start()
  const res = shell.exec(`git clone https://github.com/zapant-com/zplang-hello.git ${projectDir}`, { silent: true })
  if (res.code === 0) {
    shell.rm('-rf', projectDir + '/.git')

    spinner.succeed()
    console.log(`${clc.green('✔ Success: ')} Project ${clc.bold.cyanBright(name)} created successfully`)

    return true
  } else {
    spinner.fail()
    console.log(`${clc.red('✖ Error: ')} Project ${name} could not be created`)

    console.log(res)
    return false
  }
}

const createEmptyProject = async (name: string, projectDir: string, filesIndex?: number) => {
  const files = [
    {
      name: 'package.json',
      content: `
{
  "name": "${name}",
  "version": "1.0.0",
  "description": "zapcli project",
  "type": "module",
  "scripts": {
    "execute": "zapcli execute ./automation.zp",
    "backtest": "zapcli backtest ./automation.zp",
    "version": "zapcli -v"
  },
  "license": "ISC",
  "dependencies": {}
}
      `
    },
    {
      name: 'zp.config.js',
      content: `
const config = {
  dataDir: "./data",
  reportsDir: "./reports",
  backtestsDir: "./backtests",
  dataProvider: "zapant",
  execute: {
    date: undefined, // this is the date execute will run
    inputs: {
      assets: [],
      initialCapital: 10000,
      openPositions: []
    },
  },
  backtest: {
    startDate: "2024-05-01",
    endDate: "2024-05-20"
  }
}

export default config;
      `
    },
    {
      name: 'automation.zp',
      content: `
(def symbols [
  "AAPL",
  "MSFT"
])

(loop symbol in symbols
  (buy {symbol} 1)
)
      `
    },
  ]

  const spinner = ora(`Creating project ${clc.bold.cyanBright(name)} in ${clc.underline(path.join(process.cwd(), projectDir))}`).start()
  await fse.ensureDir(projectDir)

  files.slice(0, filesIndex).forEach(async (file) => {
    const filePath = path.join(projectDir, file.name);
    await fse.outputFile(filePath, voca.trim(file.content));
  })

  spinner.succeed()
  console.log(`${clc.green('✔ Success: ')} Project ${clc.bold.cyanBright(name)} created successfully`)

  return true
}

const installDependencies = async (projectDir:string, pkName: string) => {
  shell.cd(projectDir)
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
    .argument('[name]', 'project name')
    .option('-t, --template <template>', 'template to use for creating the project')
    .option('-pk, --pkManager <pkManager>', 'package manager')
    .option('-d, --dir <dir>', 'dir to create project')
    .option('--no-install', 'don\'t install dependencies')
    .action(async (projectName, opts) => {
        const { name } = projectName ? { name: projectName } : await prompts({ type: 'text', name: 'name', message: 'Enter project name', initial: projectName })
        const projectDir = opts.dir ?? name

        if (fs.existsSync(projectDir) && projectDir !== '.') {
          console.log(`${clc.red('✖ Error: ')} Path ${projectDir} already exists and is not an empty directory`)
          return
        }

        const { template } = opts.template ? {template: opts.template} : await prompts({
          type: 'select',
          name: 'template',
          message: `Select a template?`,
          choices: [
            { title: 'empty', value: 'empty' },
            { title: 'simple', value: 'simple' },
            { title: 'with-samples', value: 'with-samples' }
          ]
        })

        const { dep } = opts.install === false ? {dep: false} :  await prompts({
          type: 'toggle',
          name: 'dep',
          message: `Would you like to install dependencies?`,
          initial: true,
          active: 'yes',
          inactive: 'no'
        })

        let packageManager = null
        if (dep) {
          const { pkName } = opts.pkManager ? { pkName: opts.pkManager } : await prompts({
            type: 'select',
            name: 'pkName',
            message: `Select a package manager?`,
            choices: [
              { title: 'npm', value: 'npm' },
              { title: 'yarn', value: 'yarn' },
              { title: 'pnpm', value: 'pnpm' }
            ]
          })

          packageManager = pkName
        }

        let res: boolean | null = null
        switch (template) {
          case 'empty':
            res = await createEmptyProject(name, projectDir, 1)
            break;

          case 'simple':
            res = await createEmptyProject(name, projectDir)
            break;

          case 'with-samples':
            res = await createProject(name, projectDir)
            break

          default:
            console.log(`${clc.red('✖ Error: ')} Template name not valid`)
            return
        }

        if (!res) {
          return
        }

        if (packageManager) {
          await installDependencies(projectDir, packageManager)
        }

    })

  return program
}