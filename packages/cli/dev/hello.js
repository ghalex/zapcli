const assets = ["AAPL", "MSFT"]
const window = 1
const settings = {}

function run() {

  for (const symbol of assets) {
    this.buy(this.asset(symbol), 1)
  }

  this.print("price AAPL", this.asset("AAPL").close)
  this.print("cash:", this.getCash())
  this.print("total capital:", this.getTotalCapital())
  this.print("positions:", this.getPositions())

}

return { assets, window, run }