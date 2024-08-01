import dayjs from 'dayjs'
import BaseAnalyzer from './BaseAnalyzer'
import { currencyFormat } from '../utils'

class PositionsAnalyzer extends BaseAnalyzer {
  name = 'positions'
  data = [] as any[]

  end() {
    this.data = this.strategy.broker.getPositions().
      sort((a, b) => a.closeDate - b.closeDate).
      map((p) => {
        return {
          ...p,
          openDate: dayjs(p.openDate).format('YYYY-MM-DD'),
          closeDate: p.closeDate ? dayjs(p.closeDate).format('YYYY-MM-DD') : null
        }
      }).map((p) => {
        const { stats, ...rest } = p
        return {
          ...rest,
          pl: parseFloat(stats.pl.toFixed(2)),
          value: parseFloat(stats.value.toFixed(2))
        }
      })

  }

  toConsole(): void {
    if (this.data.length === 0) {
      console.log('No positions generated.')
      return
    }

    console.table(this.data.map((p) => {
      return {
        ...p,
        pl: currencyFormat(p.pl),
        value: currencyFormat(p.value)
      }
    }))
  }
}

export default PositionsAnalyzer