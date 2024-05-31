import * as r from 'ramda'
import type { Bar, Bars, IndicatorOptions } from '../types'
import array from '../helpers/array'

const sma = (bars: Bars) =>
  (len: number, symbol: string | number[], { roll, offset, prop }: IndicatorOptions = {}): any => {
    const minLen = len + (roll ?? 0) + (offset ?? 0)
    const data: number[] = Array.isArray(symbol) ? symbol : r.pluck(prop ?? 'close', bars[symbol] as Bar[])

    if (data.length < minLen) {
      throw new Error(`sma: data.length ${data.length} must be bigger then ${minLen}`)
    }

    const res = array.rolling(
      { window: len, partial: false },
      (arr: any) => {
        return r.mean(arr)
      },
      r.take(len + (roll ?? 0), data.slice(offset ?? 0))
    )
      .filter((val: any) => val)

    return roll ? res : res[0]
  }

export default sma
