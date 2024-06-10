import * as fs from 'node:fs'
import * as path from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import clc from 'cli-color'
import dayjs from 'dayjs'
import calendar from '@zapant/calendar'

export default (config) => {

  /**
   * Parse symbol
   * @param symbol 
   * @returns 
   */
  const parseSymbol = (symbol: string) => {
    return symbol.replace(/\//g, '_')
  }

  const getAll = (symbol: string, resolution?: number) => {
    const dataDir = config.dataDir
    const key = `${parseSymbol(symbol)}_${resolution ?? 1440}`
    const filePath = path.join(dataDir, key + '.data')

    if (!fs.existsSync(filePath)) {
      return []
    }

    try {
      const fileContents = fs.readFileSync(filePath)
      const buffer = gunzipSync(fileContents)


      const data = JSON.parse(buffer.toString('utf8'))
      return data
    } catch (err: any) {
      throw new Error(`Error reading compressed data from ${filePath}: ${err.message}`)
    }
  }
  /**
   * Get from cache
   * @param symbol 
   * @param window 
   * @param resolution 
   * @param end 
   * @returns 
   */
  const get = (symbol: string, window: number, resolution: number = 1440, end?: string) => {
    const allData = getAll(symbol, resolution)
    const date = end ? dayjs(end) : dayjs()
    const isStocks = !symbol.includes('/')
    const resolutionMap: Record<number, dayjs.OpUnitType> = {
      1440: 'day',
      240: 'hour',
      60: 'hour',
      30: 'minute',
      15: 'minute',
      5: 'minute',
    }

    let fromDate = date.endOf(resolutionMap[resolution])

    // get data from specific date
    const index = allData.findIndex(x => x.date <= fromDate.valueOf())
    const data = allData.slice(index)

    if (isStocks) {
      fromDate = dayjs(calendar.getDaysUntil(fromDate.toDate(), 1, resolution)?.[0].date)
    }

    if (data.length === 0) {
      return []
    }

    if (index === 0) {
      if (!fromDate.isSame(dayjs(data[0].date), resolutionMap[resolution])) {
        return []
      }
    }

    if (index < 0) {
      return []
    }

    if (data.length < window) {
      return [];
    }

    return data.slice(0, window)
  }

  const canCombine = (oldData: any, newData: any) => {
    // Find the date range of oldData
    const oldDataDates = oldData.map(item => item.date)
    const oldMinDate = Math.min(...oldDataDates)
    const oldMaxDate = Math.max(...oldDataDates)

    // Find the date range of newData
    const newDataDates = newData.map(item => item.date)
    const newMinDate = Math.min(...newDataDates)
    const newMaxDate = Math.max(...newDataDates)

    if (oldMaxDate < newMinDate || newMaxDate < oldMinDate) {
      return false
    }

    return true
  }

  const combineData = (oldData: any, newData: any) => {
    if (!canCombine(oldData, newData)) return newData
    const dataMap = new Map<number, any>()

    // Add all entries from oldData to the map
    oldData.forEach(item => {
      dataMap.set(item.date, { ...item })
    })

    // Add or merge entries from newData to the map
    newData.forEach(item => {
      if (!dataMap.has(item.date)) {
        dataMap.set(item.date, { ...item })
      }
    })

    return Array.from(dataMap.values()).sort((a, b) => b.date - a.date)
  }

  /**
   * Save to cache
   * @param symbol 
   * @param resolution 
   * @param end 
   * @param data 
   * @returns 
   */
  const save = async (symbol: string, resolution: number, newData: any) => {
    const dataDir = config.dataDir
    const oldData = getAll(symbol, resolution)
    const data = combineData(oldData, newData)
    const key = `${parseSymbol(symbol)}_${resolution ?? 1440}`

    const filePath = path.join(dataDir, key + '.data')
    const jsonString = JSON.stringify(data, null, 2)
    const buffer = Buffer.from(jsonString, 'utf8')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    try {
      const compressedBuffer = gzipSync(buffer)
      fs.writeFileSync(filePath, compressedBuffer)

      const size = compressedBuffer.length;
      const kiloBytes = size / 1024;
      console.log(`→ Data for ${clc.bold.green(symbol)} symbol was saved successfully ${clc.green(`(${kiloBytes.toFixed(2)} KB)`)}`);

      return filePath;
    } catch (err: any) {
      console.error(`Error writing compressed data to ${filePath}: ${err.message}`);
      throw err;
    }
  }

  return { get, getAll, save }
}