import type { Order, Position, Bar, OrderOptions } from '../types'
import helpers from '../helpers'
import position from '@/helpers/position'

const zpTrade = (env) => {
  const { bars } = env

  const data = {
    cash: 0,
    orders: [] as Order[],
    positions: [] as Position[]
  }

  const getCash = () => data.cash
  const getOrders = () => data.orders.concat()
  const getPositions = () => data.positions.concat()
  const getTotalCapital = () => {
    if (data.positions.length === 0) return data.cash

    return data.cash + data.positions.reduce((acc, p) => {
      const bar = bars[p.symbol]?.[0] ?? { close: p.openPrice }
      return acc + p.units * bar.close
    }, 0)
  }

  const getPosition = (symbol: string) => {
    const p = data.positions.find(p => p.symbol === symbol)
    return p ?? null
  }

  const getOrder = (symbol: string) => {
    const o = data.orders.find(p => p.symbol === symbol)
    return o ?? null
  }

  const setCash = (value: number) => data.cash = value
  const setOrders = (orders: Order[]) => data.orders = [...orders]
  const setPositions = (positions: Position[]) => data.positions = [...positions]

  const balanceOne = (order: Order, position?: Position) => {
    const minDiff = 0.1000

    if (!position) {
      return order
    } else {
      const symbol = order.symbol
      const posDirection = position?.side === 'long' ? 1 : -1
      const orderDirection = order.action === 'buy' ? 1 : -1
      const diff = (orderDirection * order.units) - (position.units * posDirection)
      const diffAmount = diff * order.price

      if (Math.abs(diffAmount) > minDiff) {
        const action = diff > 0 ? 'buy' : 'sell'
        const [diffOrder] = helpers.order.createOrdersUnits([symbol], { [symbol]: 1 }, Math.abs(diff), action, bars)
        diffOrder.isClose = true

        return diffOrder
      }

      return order
    }
  }

  const balance = (settings: any = {}) => {
    const resultOrders: Order[] = []
    const minDiff = settings.minAmount ?? 0.1000
    const positions = settings.positions ?? data.positions
    const orders = settings.orders ?? data.orders

    if (orders.length === 0) {
      return resultOrders
    }

    // close all positions that I don't need
    for (const pos of positions) {
      if (!orders.some(o => o.symbol === pos.symbol)) {
        const [order] = helpers.position.generateClosePositions([pos], bars)
        order.isClose = true
        resultOrders.push(order)
      }
    }

    for (const order of orders) {
      const symbol = order.symbol
      const pos = positions.find(p => p.symbol === symbol)
      const posDirection = pos?.side === 'long' ? 1 : -1
      const orderDirection = order.action === 'buy' ? 1 : -1

      if (!pos) {
        resultOrders.push(order)
      } else {
        const diff = (orderDirection * order.units) - (pos.units * posDirection)
        const diffAmount = diff * order.price

        if (Math.abs(diffAmount) > minDiff) {
          const action = diff > 0 ? 'buy' : 'sell'
          const [diffOrder] = helpers.order.createOrdersUnits([symbol], { [symbol]: 1 }, Math.abs(diff), action, bars)
          diffOrder.isClose = true

          resultOrders.push(diffOrder)
        }
      }
    }

    data.orders = resultOrders
    return resultOrders
  }

  const hasPosition = (symbol: string, side: string) => {
    const p = data.positions.find(p => p.symbol === symbol)

    if (p) {
      if (side && p.side !== side) return false
      return true
    }

    return false
  }

  const closePositions = (value: Position[]) => {
    const positionsToClose = value ?? data.positions

    if (positionsToClose.length === 0) { return [] }

    const newOrders = helpers.position.generateClosePositions(positionsToClose, bars)
    data.orders = helpers.order.mergeOrders([...data.orders, ...newOrders])

    return data.orders
  }

  const isAsset = (asset: Bar | string): asset is Bar => {
    return (asset as Bar).symbol !== undefined
  }

  const order = (action: 'buy' | 'sell', asset: Bar, qty: number, options: OrderOptions = {}) => {
    if (qty < 0) throw new Error(`${action} {${asset.symbol}}: Quantity cannot be negative`)
    if (!isAsset(asset)) throw new Error(`"asset" must be a Bar object, received ${typeof asset}`)

    const [order] = helpers.order.createOrdersUnits([asset.symbol], { [asset.symbol]: 1 }, qty, action, bars, options.round)

    if (options.target) {
      const newOrder = balanceOne(order, data.positions.find(p => p.symbol === order.symbol))
      data.orders = helpers.order.mergeOrders([...data.orders, newOrder])
      return newOrder
    } else {
      data.orders = helpers.order.mergeOrders([...data.orders, order])
      return order
    }
  }

  const buy = (asset: Bar, qty: number, options: OrderOptions = {}) => {
    return order('buy', asset, qty, options)
  }

  const buyAmount = (asset: Bar, amount: number, options: OrderOptions = {}) => {
    const qty = options.round ? Math.floor(amount / asset.close) : amount / asset.close
    return buy(asset, qty, options)
  }

  const sell = (asset: Bar, qty: number, options = {}) => {
    return order('sell', asset, qty, options)
  }

  const sellAmount = (asset: Bar, amount: number, options: any = {}) => {
    const qty = options.round ? Math.floor(amount / asset.close) : amount / asset.close
    return sell(asset, qty, options)
  }

  return {
    getCash,
    getTotalCapital,
    getOrders,
    getPositions,
    getPosition,
    setCash,
    setOrders,
    setPositions,
    getOrder,
    balance,
    hasPosition,
    closePositions,
    order,
    buy,
    buyAmount,
    sell,
    sellAmount
  }

}

export default zpTrade