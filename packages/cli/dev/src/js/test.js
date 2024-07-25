const symbols = ["AAPL"]
const window = 1
const settings = {}

function run() {

  const LINK = this.asset("LINK/USD")
  const [pos] = this.getPositions()

  this.print(this.today())
  // this.print(LINK)
  this.print(pos)
  this.print(new Date(pos.openDate))
  this.print(this.positionInfo(pos))

}

return { symbols, window, settings, run }