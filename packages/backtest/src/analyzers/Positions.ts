import dayjs from 'dayjs'
import BaseAnalyzer from './BaseAnalyzer'

class PositionsAnalyzer extends BaseAnalyzer {
  name = 'positions'
  data = [] as any[]

  end() {
    this.data = this.strategy.broker.getPositions().
      sort((a, b) => a.closeDate - b.closeDate).
      map((p) => {
        return {
          ...p,
          openDate: dayjs(p.openDate).format('YYYY-MM-DDTHH:mm'),
          closeDate: p.closeDate ? dayjs(p.closeDate).format('YYYY-MM-DDTHH:mm') : null
        }
      })

  }

  toConsole(): void {
    if (this.data.length === 0) {
      console.log('No positions generated.')
      return
    }

    console.table(this.data.map((p) => {
      const { stats, ...rest } = p
      return {
        ...rest,
        pl: stats.pl.toFixed(2)
      }
    }))
  }
}

export default PositionsAnalyzer