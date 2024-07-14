import clc from 'cli-color'
import Axios, { type AxiosInstance } from 'axios'
import ora from 'ora'
import prompts from 'prompts'
import cache from './cache'
import storage from '../storage'
import dayjs from 'dayjs'
import csv from 'csvtojson'

export default (config) => {
  const axios: AxiosInstance = Axios.create({
    baseURL: config.apiUrl ?? 'https://zapant.com/api',
    timeout: 80000,
    headers: {
      'Content-Type': 'application/json'
    }
  })


  const yahooAxios: AxiosInstance = Axios.create({
    baseURL: 'https://query1.finance.yahoo.com/v7/finance/download',
    timeout: 80000
  })

  /**
   * Download bars uzing zapant provider
   * @param symbols 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const downloadZapant = async (symbols: string[], window: number, resolution?: number, end?: string) => {
    if (!storage.get('accessToken')) {
      throw new Error('You must be logged in to download data. Please run `zplang login` command.')
    }

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

  /**
   * Download bars uzing Yahoo Finance provider
   * @param symbols 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const downloadYahoo = async (symbols: string[], window: number, resolution?: number, end?: string) => {
    const resolutionMap = {
      1440: '1d',
      90: '90m',
      60: '60m',
      30: '30m',
      15: '15m',
      5: '5m',
    }

    if(resolution && !resolutionMap[resolution]) {
      throw new Error(`${resolution} resolution not supported`)
    }

    const promises = symbols.map(async (symbol) => {
      const period2 = end ? dayjs(end).add(1, 'days').unix() : dayjs().unix()
      const period1 = dayjs.unix(period2).subtract(window, 'days').unix()
      const interval = resolution ? resolutionMap[resolution] : '1d'
      const url = `/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&events=history`
      const response = await yahooAxios.get(url)
      const json = await csv().fromString(response.data)
      return {
        symbol,
        bars: json.map(bar => ({
          symbol,
          open: parseFloat(bar.Open),
          high: parseFloat(bar.High),
          low: parseFloat(bar.Low),
          close: parseFloat(bar.Close),
          volume: parseFloat(bar.Volume),
          date: dayjs(bar.Date).valueOf(),
          dateFormatted: dayjs(bar.Date).toISOString()
        })).reverse()
      }
    })

    const data = await Promise.all(promises)
    const formatted = data.reduce((acc, curr) => {
      acc[curr.symbol] = curr.bars
      return acc
    }, {})
    return formatted
  }

  const download = async (provider: string, symbols: string[], window: number, resolution?: number, end?: string) => {
    switch (provider) {
      case 'zapant':
        return downloadZapant(symbols, window, resolution, end)
      case 'yahoo':
        return downloadYahoo(symbols, window, resolution, end)
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
  const downloadBars = async (symbols: string[], maxWindow: number, resolution?: number, end?: string, auto?: boolean) => {
    let bars = {}
    const dataDir = config.dataDir
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
        const provider = auto ? {value: config.dataProvider} : await prompts({
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
          const data = await download(provider.value, missing, maxWindow, resolution, end)
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
      }

    } else {
      console.log(`${clc.green('✔ Success:')} All data is already in cache`)
    }

    return bars
  }

  return { download, downloadBars }
}
