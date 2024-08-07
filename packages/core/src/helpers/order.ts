import { Bars, Order, OrderAction, Position } from "../types"
import { floorNumber } from "./number"
import dayjs from "dayjs"

const getToday = (symbol: string, bars: Bars) => {
  const arr = bars[symbol] ?? []
  const today = arr[0]

  return today
}

/**
 * Create orders based on the weights and units
 * @param symbols 
 * @param weights 
 * @param units 
 * @param action 
 * @param round 
 * @returns 
 */
const createOrdersUnits = (symbols: string[], weights: Record<string, number>, units: number, action: OrderAction, bars: Bars, options?: any) => {
  const res: Order[] = []
  const { round, limitPrice } = options ?? {}

  for (const symbol of symbols) {
    const today = bars[symbol][0]
    const datetime = dayjs(today?.date).isSame(dayjs(), 'day') ? Date.now() : today.date

    const order: Order = {
      symbol: today.symbol,
      date: datetime,
      dateFormatted: dayjs(datetime).toISOString(),
      price: today.close,
      limitPrice,
      units: round ? Math.floor(weights[symbol] * units) : floorNumber(weights[symbol] * units, 6),
      action,
      status: 'created'
    }

    res.push({ ...order, value: order.units * order.price })
  }


  return res
}

/**
 * Create orders based on the weights and amount
 * @param symbols 
 * @param weights 
 * @param amount 
 * @param action 
 * @param round 
 * @returns 
 */
const createOrdersAmount = (symbols: string[], weights: Record<string, number>, amount: number, action: OrderAction, bars: Bars, options?: any) => {
  const res: Order[] = []
  const { round, limitPrice } = options ?? {}

  for (const symbol of symbols) {
    const today = bars[symbol][0]
    const cash = amount * Math.abs(weights[symbol])
    const price = today.close
    const units = round ? Math.floor(cash / price) : floorNumber(cash / price, 6)
    const datetime = dayjs(today?.date).isSame(dayjs(), 'day') ? Date.now() : today.date

    const order: Order = {
      symbol: today.symbol,
      date: datetime,
      dateFormatted: dayjs(datetime).toISOString(),
      price,
      limitPrice,
      units,
      action,
      status: 'created'
    }

    res.push({ ...order, value: order.units * order.price })
  }

  return res
}

const mergeOrders = (orders: Order[]): Order[] => {
  const map = new Map<string, Order>()

  for (const order of orders) {
    const existing = map.get(order.symbol)

    if (existing) {
      existing.units += order.units * (order.action === 'buy' ? 1 : -1)
    } else {
      map.set(order.symbol, { ...order, units: order.units * (order.action === 'buy' ? 1 : -1) })
    }
  }

  return Array.from(map.values()).map(order => {
    return {
      ...order,
      units: Math.abs(order.units),
      action: order.units > 0 ? 'buy' : 'sell'
    }
  }).filter(order => order.units > 0) as Order[]
}

const sameSide = (order, position) => {
  return (position.side === 'long' && order.action === 'buy') || (position.side === 'short' && order.action === 'sell')
}


const generateCloseOrders = (openPositions: Position[], bars: Bars, closePrices?: number[]) => {
  const res: Order[] = []

  openPositions.forEach((position, index) => {
    const today = getToday(position.symbol, bars)
    const closePrice = closePrices?.[index] ?? today.close
    const action = position.side === 'long' ? 'sell' : 'buy'

    if (today) {
      const datetime = dayjs(today.date).isSame(dayjs(), 'day') ? Date.now() : today.date
      const order: Order = {
        symbol: today.symbol,
        date: datetime,
        dateFormatted: dayjs(datetime).toISOString(),
        price: closePrice,
        units: position.units ?? 0,
        isClose: true,
        limitPrice: closePrices?.[index],
        value: closePrice * (position.units ?? 0),
        action,
        status: 'created',
      }
      res.push(order)
    }
  })

  return res
}

export default {
  createOrdersUnits,
  createOrdersAmount,
  generateCloseOrders,
  sameSide,
  mergeOrders
}