import { analyzers } from 'zptrade-backtest'



const config = {
  dataDir: "./dev/data",
  apiUrl: "http://zapant.com/api",
  execute: {
    date: "2024-05-20",
    inputs: {
      assets: ["AAPL", "MSFT"],
      initialCapital: 10000,
      openPositions: [{
        symbol: 'AAPL',
        openDate: 1682366400000,
        openPrice: 200.00,
        closeDate: null,
        closePrice: null,
        units: 5,
        side: 'long',
        accountType: 'paper'
      }]
    },
  },
  backtest: {
    startDate: "2024-05-01",
    endDate: "2024-05-20",
    saveResult: "./dev/report/data.json",
    market: "stocks",
    inputs: {
      assets: []
    },
    analyzers: [
      new analyzers.RetursAnalyzer(),
      new analyzers.PositionsAnalyzer()
      // new analyzers.TradesAnalyzer()
    ]
  }
}

export default config;