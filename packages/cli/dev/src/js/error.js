const assets = ["ETH/USD"]
const window = 1
const settings = {}

function run() {

    for (const symbol of assets) {
      this.buy(this.asset(symbol), 1)
    }

    thi.print(this.getOrders())

    return {
      name: "Test"
    }

}

return { assets, window, run }