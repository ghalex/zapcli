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

  // Get top X momentum assets
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
    const newPositions = topSymbols.filter(s => this.getPositions().find(p => p.symbol === s) === undefined)
    const positionsToClose = this.getPositions().filter(p => !topSymbols.includes(p.symbol))

    let freeCash = this.getCash()

    // Close positions
    if (positionsToClose.length > 0) {
      const value = this.sum(this.closePositions(positionsToClose).map(o => o.value))
      freeCash += value
    }

    // Open new positions
    newPositions.forEach(symbol => {
      const amountPerPosition = Math.floor(freeCash / newPositions.length)
      this.buyAmount(this.asset(symbol), amountPerPosition, { round: true })
    })

    this.print("Top symbols:", topSymbols)
  } else {
    this.print('QQQ is below EMA, not buying closing all')
    this.closePositions()
  }

  this.print("Orders:", this.getOrders())
}

return { symbols: [...symbols, "QQQ"], window, settings, run }