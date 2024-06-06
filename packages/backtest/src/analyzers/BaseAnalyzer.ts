
abstract class BaseAnalyzer {
  name = 'base'
  data: any = {}
  _strategy: any | null = null

  public init(): boolean {
    return true
  }

  setStrategy(strategy) {
    this._strategy = strategy
  }

  get strategy() {
    if (!this._strategy) throw new Error('Analyzer not added to strategy')

    return this._strategy
  }

  public onOrder(order) { }
  public onPosition(position) { }
  public onCash(oldCash, newCash) { }

  start() { }
  end() { }

  prenext() { }
  next() { }

  toConsole() {
    console.dir(this.data, { depth: null, colors: true })
  }
}

export default BaseAnalyzer