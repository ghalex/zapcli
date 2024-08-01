import assert from '../helpers/assert'
import { pluck, head, take, tail, sum } from 'ramda'

const zpCore = (env) => {
  const { stdout } = env

  return {
    pluck,
    head,
    take,
    tail,
    sum,
    crossover: (bars, value) => {
      assert(bars.length === 2, 'crossover requires 2 bars')

      const first = bars[0]
      const second = bars[1]

      return first.close > value && Math.min(second.close, first.open) < value
    },
    crossunder: (bars, value) => {
      assert(bars.length === 2, 'crossunder requires 2 bars')

      const first = bars[0]
      const second = bars[1]

      return first.close < value && Math.max(second.close, first.open) > value
    },
    print: (...args) => {
      const str = args.map(x => typeof x === 'string' ? x : JSON.stringify(x, null, 2)).join(' ')
      stdout.push(str)
      return str
    }
  }
}

export default zpCore
