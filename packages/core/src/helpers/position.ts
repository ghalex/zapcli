import { FilledOrder, Position } from "../types"
import { floorNumber } from "./number"

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

const value = (p: Position, today?: any) => {
  const closePrice = p.closePrice ?? today?.close ?? 0
  const pl = floorNumber((closePrice - p.openPrice) * p.units, 2) * (p.side === 'long' ? 1 : -1)

  return p.openPrice * p.units + pl
}

export default {
  isOpen,
  isClose,
  openPosition,
  closePosition,
  value
}
