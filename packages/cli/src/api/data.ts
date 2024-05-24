import clc from 'cli-color'
import Axios, { type AxiosInstance } from 'axios'
import ora from 'ora'
import prompts from 'prompts'
import cache from './cache'
import storage from '../storage'
import dayjs from 'dayjs'

export default (config) => {
  const axios: AxiosInstance = Axios.create({
    baseURL: config.apiUrl ?? 'https://zapant.com/api',
    timeout: 80000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  /**
   * Download bars
   * @param symbols 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const download = async (symbols: string[], window: number, resolution?: number, end?: string) => {
    const dataDir = config.dataDir
    const spinner = ora(`Downloading data for [ ${clc.bold.green(symbols.join(', '))} ]`).start()

    if (!storage.get('accessToken')) {
      spinner.fail()
      throw new Error('You must be logged in to download data. Please run `zplang login` command.')
    }

    try {
      const { data } = await axios.get('/bars', {
        params: {
          symbols: symbols.join(','),
          window,
          resolution: resolution ?? 1440,
          end: end && resolution?.toString() === '1440' ? dayjs(end).endOf('D').toISOString() : end
        },
        headers: {
          Authorization: `Bearer ${storage.get('accessToken')}`
        }
      })

      spinner.succeed()
      console.log(`${clc.green('✔ Success:')} Data was downloaded successfully`)

      for (const symbol of symbols) {
        if (data[symbol] && data[symbol].length > 0) {
          await cache(config).save(symbol, resolution ?? 1440, data[symbol])
        }
      }

      console.log(`${clc.green('✔ Success:')} All data was saved successfully in ${clc.underline.bold(dataDir)} directory`)
      
      return data

    } catch (e: any) {
      spinner.fail()

      if (e.response) {
        if(e.response.status === 401) {
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

  /**
   * Get data from cache or download
   * from provider
   * @param symbol 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const downloadBars = async (symbols: string[], maxWindow: number, resolution?: number, end?: string) => {
    let bars = {}
    const missing: string[] = []

    for (const s of symbols) {
      const cachedData = await cache(config).get(s, maxWindow, resolution, end)
      
      if (cachedData.length === 0) {
        missing.push(s)
      } else {
        bars[s] = cachedData
      }
    }

    if (missing.length > 0) {
      console.log(`You need to download data for the following symbols: [ ${clc.bold.green(missing.join(', '))} ]`)

      const response = await prompts({
        type: 'toggle',
        name: 'value',
        message: 'Do you want to download the missing data?',
        initial: true,
        active: 'yes',
        inactive: 'no'
      })

      if (response.value) {
        const data = await download(missing, maxWindow, resolution, end)
        bars = { ...bars, ...data }
      }
    }

    return bars
  }

  return { download, downloadBars }
}
