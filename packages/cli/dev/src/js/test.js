const symbols = ["AAPL"]
const window = 1
const settings = {}

function run() {
  if (this.barIndex === 1) {
    this.sell(this.asset('AAPL'), 10)
  }
  // for (const symbol of symbols) {
  //   this.sell(this.asset(symbol), 1)
  // }

  this.print(this.getOrders())
}

return { symbols, window, settings, run }