import { analyzers } from '@zapcli/backtest'
import dayjs from 'dayjs'

class LogAnalyzer extends analyzers.BaseAnalyzer {
  name = "logAnalyzer"
  data = []

  onOrder(order) {
    //console.log(order)
  }

  prenext() {
    const date = dayjs(this.strategy.currentDate).format('YYYY-MM-DD')
    const dates = ['2023-03-15']

    // if (this.strategy.broker.getOpenPositions().find(p => p.side === "short")) {
    //   console.log('short position found', date)
    // }

    if (dates.includes(date)) {
      console.log(date, this.strategy.broker.getValue(), this.strategy.broker.getCash())
      console.log('positions', this.strategy.broker.getOpenPositions())
    }
  }

  next({ executedOrders }) {
    const date = dayjs(this.strategy.currentDate).format('YYYY-MM-DD')
    const dates = ['2023-03-15']


    if (dates.includes(date)) {
      console.log(date, this.strategy.broker.getValue(), this.strategy.broker.getCash())
      console.log('orders', executedOrders)
      console.log('positions after orders', this.strategy.broker.getOpenPositions())
    }

    // 
  }

  onCash(oldCash, newCash) {
    this.data.push({ date: this.strategy.currentDate, cash: newCash.toFixed(2) })

  }

  toConsole() {
    // console.table(this.data)
  }
}

const samplePositions = [
  {
    symbol: 'ETH/USD',
    openDate: 1678579200000,
    openPrice: 1591.57,
    openBar: 71,
    closeDate: null,
    closePrice: null,
    closeBar: null,
    units: 1.9044539999999999,
    side: 'long',
    stats: { pl: 123.42, value: 3154.49, currentPrice: 1656.38 }
  },
  {
    symbol: 'BTC/USD',
    openDate: 1678665600000,
    openPrice: 24208.3,
    openBar: 72,
    closeDate: null,
    closePrice: null,
    closeBar: null,
    units: 0.132164,
    side: 'long',
    stats: { pl: 21.71, value: 3221.18, currentPrice: 24372.6 }
  },
  {
    symbol: 'LINK/USD',
    openDate: 1678752000000,
    openPrice: 6.98836,
    openBar: 73,
    closeDate: null,
    closePrice: null,
    closeBar: null,
    units: 462.148806,
    side: 'long',
    stats: { pl: -194.48, value: 3035.18, currentPrice: 6.56755 }
  }
]

const config = {
  dataDir: "./dev/data",
  apiUrl: "http://zapant.com/api",
  execute: {
    date: "2024-05-15",
    inputs: {
      assets: [],
      initialCapital: 10000,
      openPositions: samplePositions
    },
  },
  backtest: {
    startDate: "2023-01-01",
    endDate: "2024-06-01",
    saveResult: "./dev/report/data.json",
    market: "crypto",
    inputs: {
      assets: []
    },
    analyzers: [
      new analyzers.RetursAnalyzer(),
      // new analyzers.PositionsAnalyzer(),
      // new LogAnalyzer(),
      // new analyzers.TradesAnalyzer()
    ]
  }
}

export default config;