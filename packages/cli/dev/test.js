const assets = ["AAPL", "MSFT"]
const window = 1
const settings = {}

function run() {

  // if (this.barIndex > 10) {
  //   this.closePositions()
  //   return
  // }
  // for (const symbol of assets) {
  //   this.buy(this.asset(symbol), 1)
  //   this.sell(this.asset(symbol), 1)
  // }


  if (this.barIndex % 5 === 0) {
    this.closePositions()
  } else {
    for (const symbol of assets) {
      this.buy(this.asset(symbol), 1)
    }
  }

  this.print('Hello World')
  this.print(this.getOrders())
}

return { assets, window, run }