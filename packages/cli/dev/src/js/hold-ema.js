/**
 * @typedef {import('../types').Env} Env
 */

const symbols = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "SNOW", "PYPL", "NFLX", "META", "NVDA"]
const window = 100
const settings = {}

/**
 * @this {Env}
 */
function run() {
  for (let symbol of symbols) {
    const ema30 = this.ema(50, symbol)
    const close = this.asset(symbol).close

    if (close > ema30) {
      if (!this.hasPosition(symbol)) {
        this.buyAmount(this.asset(symbol), 1000)
      }
    } else {
      if (this.hasPosition(symbol)) {
        this.closePositions([this.getPosition(symbol)])
      }
    }
  }
}

return { symbols, window, settings, run }