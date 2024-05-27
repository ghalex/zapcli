import { floor } from '../utils'
import { helpers } from 'zptrade'

class Broker {
  cash: number = 10_000
  cashStart: number = 10_000
  comission: number = 0
  orders: any[] = []
  positions: any[] = []
  bars: any = {}
  barIndex: number = 0
  eventHandler: any = null

  constructor(cash?: number, comission?: number) {
    this.cash = this.cashStart = cash ?? 10_000
    this.comission = comission ?? 0
  }

  setCash(val: number) {
    this.cash = this.cashStart = val
  }

  setCommision(val: number) {
    this.comission = val
  }

  setBars(data: any) {
    this.bars = data
  }

  setBarIndex(index) {
    this.barIndex = index
  }

  setEventHandler(evtHandler: any) {
    this.eventHandler = evtHandler
  }

  getCash() {
    return floor(this.cash, 2)
  }

  getCashStart() {
    return floor(this.cashStart, 2)
  }

  getValue() {
    return floor(this.cash + this.getOpenPositions().reduce((acc, p) => acc + (p.units * this.bars[p.symbol][0].close), 0), 2)
  }

  getInvested() {
    return floor(this.getOpenPositions().reduce((acc, p) => acc + (p.units * p.openPrice), 0), 2)
  }

  getPL() {
    return floor(this.getValue() - this.cashStart, 2)
  }

  getPositions() {
    return this.positions
  }

  getOpenPositions() {
    return this.positions.filter(p => !p.closeDate)
  }

  closeAllPositions() {
    for (const position of this.getOpenPositions()) {
      const bars = this.bars[position.symbol]
      const order = {
        symbol: position.symbol,
        date: bars[0].date,
        price: bars[0].close,
        action: position.side === 'long' ? 'sell' : 'buy',
        units: position.units,
        status: 'created'
      }

      this.fillOrder(order, bars)
    }
  }

  sameSide(position, order) {
    return (position.side === 'long' && order.action === 'buy') || (position.side === 'short' && order.action === 'sell')
  }

  canFill(order: any, bar: any) {
    const fillCost = bar.close * order.units
    const fillCommision = this.comission * fillCost
    const p = this.getOpenPositions().find((p: any) => p.symbol === order.symbol)

    if (!p) {
      return this.cash >= (fillCost + fillCommision)
    } else {
      if (this.sameSide(p, order)) {
        return this.cash >= (fillCost + fillCommision)
      } else {
        const diffAmmount = (order.units - p.units) * bar.close

        if (diffAmmount > 0) {
          return this.cash >= diffAmmount + (diffAmmount * this.comission)
        }
      }
    }

    return true
  }

  fillOrder(order: any, bars: any) {
    const bar = bars[0]
    const fillPrice = bar.close
    const fillDate = bar.date
    const fillUnits = order.units
    const fillCost = fillPrice * fillUnits
    const fillCommision = this.comission * fillCost

    let data = {
      ...order,
      fillPrice,
      fillDate,
      fillUnits,
      fillCost,
      fillCommision,
      fillBar: this.barIndex,
      error: null,
      status: 'filled'
    }

    if (this.canFill(order, bar)) {

      this.eventHandler?.onOrder(data)
      this.executeOrder(data)

      return data
    } else {
      data = {
        ...order,
        error: 'Insufficient funds',
        status: 'rejected'
      }

      this.eventHandler?.onOrder(data)
      return data
    }
  }

  fillOrders(orders: any) {
    return orders.map((order: any) => this.fillOrder(order, this.bars[order.symbol]))
  }

  executeOrder(order: any) {
    const p = this.getOpenPositions().find((p: any) => p.symbol === order.symbol)

    if (p) {
      if (this.sameSide(p, order)) {
        p.openPrice = (p.openPrice + order.fillPrice) / 2
        p.units += order.fillUnits

        this.cash -= order.fillCost + order.fillCommision
      } else {
        if (floor(p.units, 6) > floor(order.fillUnits, 6)) {
          // Close part of the position
          p.units -= order.fillUnits
          this.cash += order.fillCost - order.fillCommision
          this.positions.push(helpers.position.closePosition(p, order))

        } else {
          // Close the position
          p.closeDate = order.fillDate
          p.closePrice = order.fillPrice
          p.closeBar = order.fillBar

          this.cash += order.fillCost - order.fillCommision

          const diffAmmount = floor((order.fillUnits - p.units) * order.fillPrice, 2)

          if (diffAmmount > 2) {
            const newPosition = { ...helpers.position.openPosition(order), units: order.fillUnits - p.units }

            this.positions.push(newPosition)
            this.cash -= diffAmmount + (diffAmmount * this.comission)
            this.eventHandler?.onPosition({ ...newPosition, isNew: true })
          }

        }
      }

      this.eventHandler?.onPosition(p)
    } else {
      const newPosition = helpers.position.openPosition(order)
      this.positions.push(newPosition)
      this.cash -= order.fillCost + order.fillCommision

      this.eventHandler?.onPosition({ ...newPosition, isNew: true })
    }

    return this.positions
  }
}

export default Broker