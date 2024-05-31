import type { Bar, Bars, IndicatorOptions } from '../types'
import * as r from 'ramda'
import array from '../helpers/array'

const cmr = (bars: Bars) =>
  (len: number, symbol: string, { roll, offset, prop }: IndicatorOptions = {}): any => {
    const minLen = len + (roll ?? 0) + (offset ?? 0)
    const data: number[] = Array.isArray(symbol) ? symbol : r.pluck(prop ?? 'close', bars[symbol] as Bar[])

    if (data.length < minLen) {
      throw new Error(`cmr: data.length must be bigger then ${minLen}`)
    }

    const res = array.rolling(
      { window: len, partial: false },
      (arr: any[]) => {
        const vals = arr as number[]
        return (vals[0] - vals[vals.length - 1]) / vals[vals.length - 1]
      },
      r.take(len + (roll ?? 0), data.slice(offset ?? 0))
    )
      .filter((val: any) => val)

    return roll ? res : res[0]
  }

export default cmr
