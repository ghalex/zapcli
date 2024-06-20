import type { IndicatorOptions, Bar, Bars } from '../types'
import * as r from 'ramda'
import trueRange from './trueRange'
import array from '../helpers/array'

const atr = (bars: Bars) =>
  (len: number = 5, symbol: string, { roll, offset }: IndicatorOptions = {}): number | number[] => {
    const minLen = len + (roll ?? 0) + (offset ?? 0)
    const data: Bar[] = Array.isArray(symbol) ? symbol : bars[symbol] as Bar[]

    if (data.length < minLen) {
      throw new Error(`atr: data.length must be bigger then ${minLen}`)
    }

    const res = array.rolling(
      { window: len, partial: false },
      (arr: any[]) => {
        const tr = trueRange(arr as Bar[])

        return r.mean(tr)
      },
      r.take(len + (roll ?? 0), data.slice(offset ?? 0))
    )
      .filter((val: any) => val)

    return roll ? res : res[0]
  }

export default atr
