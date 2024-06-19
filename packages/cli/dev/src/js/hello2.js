const assets = ["ETH/USD", "SOL/USD"]
const window = 60
const settings = {}

function run() {

  // Returns true if short signal
  function shortSignal (symbol) {
    const closeToday = this.asset(symbol).close
    const ema = this.ema(30, symbol)
    const lowest = this.lowest(14, symbol, {offset: 1, prop: 'close'})

    this.print(closeToday, ema, lowest)
  }

  shortSignal("ETH/USD")
}

return { assets, window, run }