import type { Bar, Bars, IndicatorOptions } from '../types'
import { take } from 'ramda'
import array from '../helpers/array'
import * as ss from 'simple-statistics'
import * as r from 'ramda'

const momentumOne = (data: number[]) => {
  const values = data
    .reverse()
    .map((val: number, idx: number) => {
      return [idx, Math.log(val)]
    })

  const { m, b } = ss.linearRegression(values)

  // slope annualize
  const slope = (Math.pow((1 + m), 252) - 1)
  return slope * Math.pow(b, 2)
}

const momentum = (bars: Bars) =>
  (len: number, symbol: string | number[], { roll, offset, prop }: IndicatorOptions = {}): any => {
    const minLen = len + (roll ?? 0) + (offset ?? 0)
    const data: number[] = Array.isArray(symbol) ? symbol : r.pluck(prop ?? 'close', bars[symbol] as Bar[])

    if (data.length < minLen) {
      throw new Error(`momentum: data.length ${data.length} must be bigger then ${minLen}`)
    }

    const res = array.rolling(
      { window: len, partial: false },
      (arr: any[]) => {
        return momentumOne((arr as number[]).concat())
      },
      take(len + (roll ?? 0), data.slice(offset ?? 0))
    )
    .filter((val: any) => val)

    return roll ? res : res[0]
  }

export default momentum
