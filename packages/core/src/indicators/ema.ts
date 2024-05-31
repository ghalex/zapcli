import * as r from 'ramda'
import type { Bar, Bars, IndicatorOptions } from '../types'
import array from '../helpers/array'

const emaOne = (arr: number[], firstVal: number) => {
  const len = arr.length
  const alpha = 2 / (len + 1)

  let ema = firstVal
  for (const val of arr) {
    ema = alpha * val + ((1 - alpha) * ema)
  }

  return ema
}

const ema = (bars: Bars) =>
  (len: number, symbol: string | number[], { roll, offset, prop }: IndicatorOptions = {}) => {
    const minLen = len * 2 + (roll ?? 0) + (offset ?? 0)
    const data: number[] = Array.isArray(symbol) ? symbol : r.pluck(prop ?? 'close', bars[symbol] as Bar[])

    if (data.length < minLen) {
      throw new Error(`ema: data.length must be bigger then ${minLen}`)
    }

    const rollingArray = array.rolling(
      { window: len * 2, partial: false },
      (arr: any) => {
        const emaVals = r.take(len, arr)
        const sma = arr.slice(len)

        return { data: emaVals, sma: r.mean(sma) }
      },
      r.take(len * 2 + (roll ?? 0), data.slice(offset ?? 0))
    )
    .filter((val: any) => val)

    const res: number[] = rollingArray.map(({ data, sma }: any) => emaOne(data.reverse(), sma))
    return roll ? res : res[0]
  }

export default ema
