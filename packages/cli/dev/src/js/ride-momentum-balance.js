/**
 * @typedef {import('../types').Env} Env
 */

const symbols = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "SNOW", "PYPL", "NFLX", "META", "NVDA", "MA"]
const window = 100
const settings = {}

/**
 * @this {Env}
 */
function run() {
  const topX = (count = 2) => {
    return symbols
      .map(s => {
        return {
          asset: this.asset(s),
          mm: this.momentum(50, s),
          ema: this.ema(30, s)
        }
      })
      .filter(x => x.asset.close > x.ema)
      .sort((a, b) => b.mm - a.mm)
      .slice(0, count)
  }

  // Only trade if QQQ is above EMA
  const canTrade = () => {
    const QQQ = this.asset('QQQ')
    const emaQQQ = this.ema(50, 'QQQ')

    return QQQ.close > emaQQQ
    // return true
  }

  if (canTrade()) {
    const topSymbols = topX(2).map(s => s.asset.symbol)
    const amount = Math.floor(0.5 * (this.getTotalCapital() - 200))

    for (let symbol of topSymbols) {
      this.buyAmount(this.asset(symbol), amount)
    }

    // Balance the portfolio
    this.balance({ minAmount: 200 })
  } else {
    this.print('QQQ is below EMA, not buying')
    this.closePositions()
  }

  this.print(this.getOrders())
}

return { symbols: [...symbols, "QQQ", "SPY"], window, settings, run }