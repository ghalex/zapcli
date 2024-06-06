import dayjs from 'dayjs'
import BaseAnalyzer from './BaseAnalyzer'
import { round } from '../utils'

class DrawDownAnalyzer extends BaseAnalyzer {
  name = 'drawdown'
  data = {
    maxDrawDown: 0,
    maxMoneyDown: 0,
    maxDrawDownDuration: 0,
    maxDrawDownStart: '',
    maxDrawDownEnd: '',
    drawDowns: [] as any[]
  }

  private value = 0
  private maxValue = 0
  private len = 0
  private startDate = ''
  private endDate = ''


  public init(): boolean {
    return true
  }

  next() {
    const date = dayjs(this.strategy.currentDate).format('YYYY-MM-DD')
    const lastItem = this.data.drawDowns.length > 1 ? this.data.drawDowns[this.data.drawDowns.length - 1] : null
    const item: any = { date }

    this.value = this.strategy.broker.getValue()
    this.maxValue = Math.max(this.maxValue, this.value)

    item.max = this.maxValue
    item.moneyDown = this.maxValue - this.value
    item.drawDown = item.moneyDown / this.maxValue

    this.len = item.drawDown > 0 ? this.len + 1 : 0

    item.len = this.len

    // calculate when the drawdown started
    if (item.drawDown > 0 && lastItem && lastItem.drawDown === 0) {
      this.startDate = date
    }

    this.data.maxMoneyDown = Math.max(this.data.maxMoneyDown, item.moneyDown)
    this.data.maxDrawDown = Math.max(this.data.maxDrawDown, item.drawDown)

    if (this.len > this.data.maxDrawDownDuration) {
      this.data.maxDrawDownStart = this.startDate
    }

    this.data.maxDrawDownDuration = Math.max(this.data.maxDrawDownDuration, this.len)
    this.data.drawDowns.push(item)
  }

  end(): void {
    const date = dayjs(this.strategy.currentDate).format('YYYY-MM-DD')
    const itemIdx = this.data.drawDowns.findIndex(i => i.len === this.data.maxDrawDownDuration)

    if (itemIdx > -1) {
      let idx = Math.min(itemIdx + 1, this.data.drawDowns.length - 1)
      this.data.maxDrawDownEnd = this.data.drawDowns[idx].date
    }

    this.data.maxDrawDown = round(this.data.maxDrawDown * 100, 2)
  }

  toConsole(): void {
    // if (this.data.length === 0) {
    //   console.log('No positions generated.')
    //   return
    // }

    const { drawDowns, ...rest } = this.data
    console.table({
      ...rest,
      maxDrawDown: `${rest.maxDrawDown}%`
    })
  }
}

export default DrawDownAnalyzer