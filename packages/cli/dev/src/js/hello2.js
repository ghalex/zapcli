const symbols = ["ETH/USD", "BTC/USD", "SOL/USD"]
const window = 60
const settings = {}

function run() {

  for (const symbol of symbols) {
    const ema30 = this.ema(30, symbol)
    const amount = this.getCash() / symbols.length

    if (!this.hasPosition(symbol) && this.crossover(this.assets(symbol, 2), ema30)) {
      //this.buyAmount(this.asset(symbol), amount, { limitPrice: ema30 })
      this.buyAmount(this.asset(symbol), amount, { limitPrice: ema30 })
    }

    const pos = this.getPosition(symbol)
    if (pos && this.crossunder(this.assets(symbol, 2), ema30)) {
      this.closePositions([pos], [ema30])
    }
  }

  this.print(this.getOrders())
}

return { symbols, window, settings, run }