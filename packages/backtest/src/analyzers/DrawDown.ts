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
    longestDrawDownDuration: 0,
    drawDowns: [] as any[]
  }

  private value = 0
  private maxValue = 0
  private len = 0

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


    this.data.maxMoneyDown = Math.max(this.data.maxMoneyDown, item.moneyDown)
    this.data.maxDrawDown = Math.max(this.data.maxDrawDown, item.drawDown)

    this.data.longestDrawDownDuration = Math.max(this.data.longestDrawDownDuration, this.len)
    this.data.drawDowns.push(item)
  }

  end(): void {

    // calculate start end of max drawdown
    const itemIdx = this.data.drawDowns.findIndex(i => i.moneyDown === this.data.maxMoneyDown)

    if (itemIdx > 0) {
      let left = itemIdx
      let right = itemIdx

      while (left > 0) {
        if (this.data.drawDowns[left].len === 0) {
          break
        }
        left--
      }

      while (right < this.data.drawDowns.length - 1) {
        if (this.data.drawDowns[right].len === 0) {
          break
        }
        right++
      }

      this.data.maxDrawDownStart = this.data.drawDowns[left]?.date
      this.data.maxDrawDownEnd = this.data.drawDowns[right]?.date
      this.data.maxDrawDownDuration = right - left
    }

    // round to 2 decimal places
    this.data.maxDrawDown = round(this.data.maxDrawDown * 100, 2)
  }

  toConsole(): void {
    const { drawDowns, ...rest } = this.data
    console.table({
      ...rest,
      maxDrawDown: `${rest.maxDrawDown}%`
    })
  }
}

export default DrawDownAnalyzer