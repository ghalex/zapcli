const assets = ["ETH/USD", "SOL/USD"]
const window = 60
const settings = {}

function run() {

  const order = this.buy(this.asset('ETH/USD'), 1, { limitPrice: 3000 })
  this.print(order)
}

return { assets, window, run }