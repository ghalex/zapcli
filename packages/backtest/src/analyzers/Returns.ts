import dayjs from 'dayjs'
import BaseAnalyzer from './BaseAnalyzer'

class RetursAnalyzer extends BaseAnalyzer {
  name = 'returns'
  data = [] as any[]

  next() {
    const date = dayjs(this.strategy.currentDate).format('YYYY-MM-DD')

    const item: any = { date }
    item.value = this.strategy.broker.getValue()
    item.cash = this.strategy.broker.getCash()
    item.pl = this.strategy.broker.getPL()

    this.data.push(item)
  }

  toConsole() {
    console.table(this.data)
  }

}

export default RetursAnalyzer