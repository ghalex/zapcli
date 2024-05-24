import { type Bar } from '../types'
import array from '../helpers/array'

const trueRange = (bars: Bar[]): number[] => {
  const res = array.rolling(
    { window: 2, partial: false },
    ([yesterday, today]: any) => Math.max(...[
      today.high - today.low,
      Math.abs(today.high - yesterday.close),
      Math.abs(today.low - yesterday.close)
    ]),
    [...bars].reverse()
  )
  return res.reverse().filter((val: any) => val)
}

export default trueRange
