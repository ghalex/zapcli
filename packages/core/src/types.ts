export type BarSource = 'open' | 'high' | 'low' | 'close'

export interface Bar {
  symbol: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  date: number
  dateFormatted: string
}

export type Bars = Record<string, Bar[]>

export type OrderAction = 'buy' | 'sell'
export type OrderStatus = 'created' | 'pending' | 'filled' | 'rejected'

export interface Order {
  symbol: string
  date: number
  dateFormatted: string
  units: number
  price: number
  limitPrice?: number
  action: OrderAction
  status: OrderStatus
  leverage?: number
  error?: string
  isClose?: boolean
}

export interface FilledOrder extends Order {
  fillPrice: number
  fillDate: number
  fillUnits: number
  fillCost: number
  fillCommision: number
  fillBar?: number
  status: 'filled'
}


export type PositionSide = 'long' | 'short'
export interface Position {
  symbol: string
  openDate: number
  openPrice: number
  openBar?: number
  closeDate: number | null
  closePrice: number | null
  closeBar?: number | null
  units: number
  side: PositionSide
}

export interface OrderOptions {
  round?: boolean
  target?: boolean
}

export interface IndicatorOptions {
  roll?: number
  offset?: number
  prop?: string
}

export interface RollingConfig {
  window: number
  partial: boolean
}

