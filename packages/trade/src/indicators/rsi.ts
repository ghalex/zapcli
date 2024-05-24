import * as r from 'ramda'
import array from '../helpers/array'
import { Bar, Bars, type IndicatorOptions } from '../types'

const changes = (arr: number[]): number[] => {
  return arr.map((val: any, idx: number) => {
    if (idx === 0) {
      return 0
    } else {
      return arr[idx - 1] - val
    }
  }).slice(1)
}

const rma = (length: number, data: number[]) => {
  const result: number[] = []
  let sum = 0

  for (let i = 0; i < length; i++) {
    sum += data[i]
  }

  let average = sum / length
  result.push(average)

  for (let i = length + 1; i < data.length; i++) {
    average = (average * (length - 1) + data[i]) / length
    result.push(average)
  }

  return result.reverse()
}

const rsi = (len: number, data: number[]) => {
  if (data.length < len * 2) {
    throw new Error(`rsi: bars.length ${data.length} must be bigger than ${len * 2}`)
  }

  const c = changes(data)

  const max = c.map(val => Math.max(val, 0))
  const min = c.map(val => -1 * Math.min(val, 0))

  const up = rma(len, max.reverse())
  const down = rma(len, min.reverse())

  const rsiValues: number[] = []

  for (let i = 0; i < up.length; i++) {
    const upValue = up[i]
    const downValue = down[i]
    if (downValue === 0) {
      rsiValues.push(100)
    } else if (upValue === 0) {
      rsiValues.push(0)
    } else {
      rsiValues.push(100 - (100 / (1 + upValue / downValue)))
    }
  }

  return rsiValues[0]
}

const rsiCalc = (bars: Bars) =>
  (len: number, symbol: string | number[], { roll, offset, prop }: IndicatorOptions = {}): any => {
    const window = len * 2
    const minDataLength = window + (roll ?? 0) + (offset ?? 0)
    const data: number[] = Array.isArray(symbol) ? symbol : r.pluck(prop ?? 'close', bars[symbol] as Bar[])

    if (data.length < minDataLength) {
      throw new Error(`rsi: data.length ${data.length} must be bigger then ${minDataLength}`)
    }

    const res = array.rolling(
      { window, partial: false },
      (arr: any[]) => {
        return rsi(len, arr)
      },
      r.take(window + (roll ?? 0), data.slice(offset ?? 0))
    )
    .filter((val: any) => val)

    return roll ? res : res[0]
    }

export default rsiCalc
