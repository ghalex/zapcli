import dayjs from 'dayjs'
import { floor } from '../utils'
import { helpers } from '@zapcli/core'

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

  changeCash(val: number) {
    this.eventHandler?.onCash(this.cash, val)
    this.cash = val
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
    const positionsValue = this.getOpenPositions().reduce((acc, p) => acc + p.stats.value, 0)
    return floor(this.getCash() + positionsValue, 2)
  }

  getInvested() {
    return floor(this.getOpenPositions().reduce((acc, p) => acc + (p.units * p.openPrice), 0), 2)
  }

  getPL() {
    return floor(this.getValue() - this.cashStart, 2)
  }

  getPositions() {
    return this.positions.map(p => {
      const today = this.bars[p.symbol]?.[0]
      const closePrice = p.closePrice ?? today?.close ?? 0
      const pl = floor((closePrice - p.openPrice) * p.units, 2) * (p.side === 'long' ? 1 : -1)
      return {
        ...p,
        stats: {
          pl,
          value: p.openPrice * p.units + pl,
          currentPrice: closePrice,
        }
      }
    })
  }

  getOpenPositions() {
    return this.getPositions().filter(p => !p.closeDate)
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
    const fillPrice = order.limitPrice ?? order.price ?? bar.close
    const fillCost = fillPrice * order.units
    const fillCommision = this.comission * fillCost
    const p = this.getOpenPositions().find((p: any) => p.symbol === order.symbol)

    if (!p) {
      return this.getCash() >= (fillCost + fillCommision)
    } else {
      if (this.sameSide(p, order)) {
        return this.getCash() >= (fillCost + fillCommision)
      } else {
        const diffAmmount = (order.units - p.units) * bar.close

        if (diffAmmount > 0) {
          return this.getCash() >= diffAmmount + (diffAmmount * this.comission)
        }
      }
    }

    return true
  }

  fillOrder(order: any, bars: any) {
    const bar = bars[0]
    const fillPrice = order.limitPrice ?? order.price ?? bar.close
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
      const resultPositions = this.executeOrder(data)

      this.positions = this.positions.filter(p => p.closeDate).concat(resultPositions)

      return data
    } else {
      data = {
        ...order,
        error: 'Insufficient funds',
        status: 'rejected'
      }

      console.warn('cannot fill order', data)

      this.eventHandler?.onOrder(data)
      return data
    }
  }

  fillOrders(orders: any) {
    return orders.map((order: any) => this.fillOrder(order, this.bars[order.symbol]))
  }

  executeOrder(order: any) {
    const resultPositions = this.getOpenPositions().map(p => ({ ...p }))
    const p = resultPositions.find((p: any) => p.symbol === order.symbol)
    const today = this.bars[order.symbol][0]

    if (p) {
      if (this.sameSide(p, order)) {
        p.openPrice = (p.openPrice + order.fillPrice) / 2
        p.units += order.fillUnits

        this.changeCash(this.getCash() - (order.fillCost + order.fillCommision))
      } else {
        if (floor(p.units, 6) > floor(order.fillUnits, 6)) {
          // Close part of the position
          p.units -= order.fillUnits

          const closedPart = helpers.position.closePosition(p, order)
          resultPositions.push(closedPart)

          this.changeCash(this.getCash() + (helpers.position.value(closedPart, today) - order.fillCommision))
          this.eventHandler?.onPosition(p)
        } else {
          // Close the position
          p.closeDate = order.fillDate
          p.closePrice = order.fillPrice
          p.closeBar = order.fillBar

          this.changeCash(this.getCash() + (helpers.position.value(p, today) - order.fillCommision))

          // Open a new position with the remaining units
          const diffAmmount = floor((order.fillUnits - p.units) * order.fillPrice, 2)
          if (diffAmmount > 2) {
            const newPosition = { ...helpers.position.openPosition(order), units: order.fillUnits - p.units }

            resultPositions.push(newPosition)
            this.changeCash(this.getCash() - (diffAmmount + (diffAmmount * this.comission)))
            this.eventHandler?.onPosition({ ...newPosition, isNew: true })
          }

        }
      }

      this.eventHandler?.onPosition(p)
    } else {
      const newPosition = helpers.position.openPosition(order)
      resultPositions.push(newPosition)

      this.changeCash(this.getCash() - (order.fillCost + order.fillCommision))
      this.eventHandler?.onPosition({ ...newPosition, isNew: true })
    }

    return resultPositions
  }
}

export default Broker