import * as r from 'ramda'
import { Bars, IndicatorOptions, type Bar } from '../types'
import highest from './highest'
import lowest from './lowest'

const donchian = (bars: Bars) =>
  (len: number = 5, symbol: string | number[], op: IndicatorOptions = {}): any => {
    const h = highest (bars) (len, symbol, {...op, prop: 'high'})
    const l = lowest (bars) (len, symbol, {...op, prop: 'low'})

    return [h, l]
  }

export default donchian
