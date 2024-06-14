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

  //if (this.barIndex % 5 === 0) {
  //  this.closePositions()
  //} else {
    //this.asset("MSFT")
    //this.print("SMA:", this.sma(10, "AAPL"))

    for (const symbol of assets) {
      this.buy(this.asset(symbol), 1)
    }

    this.print(this.getOrders())
  //}

    return {
      name: "Test"
    }

}

return { assets, window, run }