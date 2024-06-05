import { Bars, FilledOrder, Order, Position } from "../types"
import dayjs from "dayjs"

const getToday = (symbol: string, bars: Bars) => {
  const arr = bars[symbol] ?? []
  const today = arr[0]

  return today
}

const isOpen = (position: Position) => {
  return position.closeDate === null || position.closeDate === undefined
}

const isClose = (position: Position) => {
  return position.closeDate !== null && position.closeDate !== undefined
}

const openPosition = (order: FilledOrder): Position => {
  const data: any = {
    symbol: order.symbol,
    openDate: order.fillDate,
    openPrice: order.fillPrice,
    openBar: order.fillBar,
    closeDate: null,
    closePrice: null,
    closeBar: null,
    units: order.fillUnits,
    side: order.action === 'buy' ? 'long' : 'short' as 'long' | 'short'
  }

  return data
}

const closePosition = (position: Position, order: FilledOrder): Position => {
  const data: any = {
    symbol: position.symbol,
    openDate: position.openDate,
    openPrice: position.openPrice,
    openBar: position.openBar,
    closeDate: order.fillDate,
    closePrice: order.fillPrice,
    closeBar: order.fillBar,
    units: order.units,
    side: position.side
  }

  return data
}

const generateClosePositions = (openPositions: Position[], bars: Bars) => {
  const res: Order[] = []

  for (const position of openPositions) {
    const today = getToday(position.symbol, bars)
    const action = position.side === 'long' ? 'sell' : 'buy'

    if (today) {
      const datetime = dayjs(today.date).isSame(dayjs(), 'day') ? Date.now() : today.date
      const order: Order = {
        symbol: today.symbol,
        date: datetime,
        dateFormatted: dayjs(datetime).toISOString(),
        price: today.close,
        units: position.units ?? 0,
        isClose: true,
        value: today.close * (position.units ?? 0),
        action,
        status: 'created',
      }

      res.push(order)
    }
  }

  return res
}

export default {
  isOpen,
  isClose,
  openPosition,
  closePosition,
  generateClosePositions
}
