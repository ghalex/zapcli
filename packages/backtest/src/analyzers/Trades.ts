import { round } from '../utils'
import BaseAnalyzer from './BaseAnalyzer'

class TreadesAnalyzer extends BaseAnalyzer {
  name = 'trades'
  data = {
    nbOfTrades: 0,
    nbOfWinningTrades: 0,
    nbOfLosingTrades: 0,
    avgWinningTrade: 0,
    avgLosingTrade: 0,
    winRate: 0,
    bestTrade: null as any,
    worstTrade: null as any,
    maxTradeDuration: 0, // in seconds
    avgTradeDuration: 0, // in seconds
  }

  end() {
    const positions = this.strategy.broker.getPositions()
    let totalWin = 0
    let totalLoss = 0
    let totalTradesDuration = 0

    for (const position of positions) {
      this.data.nbOfTrades += 1
      const profit = (position.closePrice - position.openPrice) * position.units

     // Calculate nr of winning and losing trades
      if (profit > 0) {
        this.data.nbOfWinningTrades++
        totalWin += profit
      } else {
        this.data.nbOfLosingTrades++
        totalLoss += Math.abs(profit)
      }

      // Calculate best and worst trade
      if(!this.data.bestTrade || profit > this.data.bestTrade) {
        this.data.bestTrade = profit
      }
      if(!this.data.worstTrade || profit < this.data.worstTrade) {
        this.data.worstTrade = profit
      }

      // Calculate trade duration
      const tradeDuration = (position.closeDate - position.openDate) / 1000 // Convert to seconds
      totalTradesDuration += tradeDuration
      if(tradeDuration > this.data.maxTradeDuration) {
        this.data.maxTradeDuration = tradeDuration
      }
    }

    // Calculate average win and loss
    if(totalWin) {
      this.data.avgWinningTrade = round(totalWin / this.data.nbOfWinningTrades, 2)
    }
    if(totalLoss) {
      this.data.avgLosingTrade = round(totalLoss / this.data.nbOfLosingTrades, 2)
    }

    this.data.winRate = round(this.data.nbOfWinningTrades / this.data.nbOfTrades, 2)
    this.data.avgTradeDuration = round(totalTradesDuration / this.data.nbOfTrades, 2)
  }
}

export default TreadesAnalyzer