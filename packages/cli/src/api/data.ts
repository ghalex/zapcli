import clc from 'cli-color'
import Axios, { type AxiosInstance } from 'axios'
import ora from 'ora'
import prompts from 'prompts'
import cache from './cache'
import storage from '../storage'
import dayjs from 'dayjs'

interface DataDownloadOptions {
  resolution?: number
  end?: string
  auto?: boolean
}

export default (config) => {
  const axios: AxiosInstance = Axios.create({
    baseURL: config.apiUrl ?? 'https://zapant.com/api',
    timeout: 80000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  /**
   * Download bars uzing zapant provider
   * @param symbols 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const downloadZapant = async (symbols: string[], window: number, options: DataDownloadOptions) => {
    if (!storage.get('accessToken')) {
      throw new Error('You must be logged in to download data. Please run `zplang login` command.')
    }

    const { resolution, end } = options

    try {
      const params = {
        symbols: symbols.join(','),
        window,
        resolution: resolution ?? 1440,
        end: end && resolution?.toString() === '1440' ? dayjs(end).endOf('D').toISOString() : end
      }

      const { data } = await axios.get('/bars', {
        params,
        headers: {
          Authorization: `Bearer ${storage.get('accessToken')}`
        }
      })

      // console.log(`${clc.green('✔ Success:')} Data was downloaded successfully`)
      return data

    } catch (e: any) {
      if (e.response) {
        if (e.response.status === 401) {
          throw new Error('You must be logged in to download data. Please run `zplang login` command.')
        }

        throw new Error(e.response.data.message)
      } else if (e.request) {
        throw new Error('Request error')
      } else {
        throw new Error(e.message)
      }
    }
  }

  const download = async (provider: string, symbols: string[], window: number, options: DataDownloadOptions) => {
    switch (provider) {
      case 'zapant':
        return downloadZapant(symbols, window, options)
      case 'yahoo':
        throw new Error('Yahoo provider is not implemented yet')
      default:
        throw new Error('Invalid provider')
    }
  }

  /**
   * Get data from cache or download
   * from provider
   * @param symbol 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const downloadBars = async (symbols: string[], maxWindow: number, options: DataDownloadOptions) => {
    let bars = {}
    const dataDir = config.dataDir
    const { resolution, end, auto } = options
    let missing: string[] = []

    // if end is undefined always fetch latest price
    if (end) {
      for (const s of symbols) {
        const cachedData = await cache(config).get(s, maxWindow, resolution, end)

        if (cachedData.length === 0) {
          missing.push(s)
        } else {
          bars[s] = cachedData
        }
      }
    } else {
      missing = [...symbols]
    }

    if (missing.length > 0) {
      console.log(`You need to download data (${maxWindow} bars) for the following symbols: [ ${clc.bold.green(missing.join(', '))} ] `)

      const response = auto ? { value: true } : await prompts({
        type: 'toggle',
        name: 'value',
        message: 'Do you want to download the missing data?',
        initial: true,
        active: 'yes',
        inactive: 'no'
      })

      if (response.value) {
        const provider = auto ? { value: config.dataProvider } : await prompts({
          type: 'select',
          name: 'value',
          message: 'Select data provider',
          choices: [
            { title: 'Zapant', value: 'zapant' },
            { title: 'Yahoo', value: 'yahoo' }
          ]
        })

        const spinner = ora(`Downloading data for [ ${clc.bold.green(missing.join(', '))} ]`)
        spinner.start()

        try {
          const data = await download(provider.value, missing, maxWindow, { resolution, end })
          spinner.succeed()

          // Save data to cache
          for (const symbol of symbols) {
            if (data[symbol] && data[symbol].length > 0) {
              await cache(config).save(symbol, resolution ?? 1440, data[symbol])
            }
          }

          console.log(`${clc.green('✔ Success:')} All data was saved successfully in ${clc.underline.bold(dataDir)} directory`)

          bars = { ...bars, ...data }
        } catch (e: any) {
          spinner.fail()
          console.error(clc.red(`✖ Error: ${e.message}`))
        }
      } else {
        console.log(`${clc.green('✔ Success:')} Data was not downloaded`)
        throw new Error('Data is missing')
      }

    } else {
      console.log(`${clc.green('✔ Success:')} All data is already in cache`)
    }

    return bars
  }

  return { download, downloadBars }
}
