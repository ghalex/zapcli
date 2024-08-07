import * as path from 'node:path'
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
  // {
  //   symbol: 'ETH/USD',
  //   openDate: 1678579200000,
  //   openPrice: 1591.57,
  //   openBar: 71,
  //   closeDate: null,
  //   closePrice: null,
  //   closeBar: null,
  //   units: 2.0,
  //   side: 'long',
  //   stats: { pl: 123.42, value: 3154.49, currentPrice: 1656.38 }
  // },
  // {
  //   symbol: 'BTC/USD',
  //   openDate: 1678665600000,
  //   openPrice: 24208.3,
  //   openBar: 72,
  //   closeDate: null,
  //   closePrice: null,
  //   closeBar: null,
  //   units: 0.132164,
  //   side: 'long',
  //   stats: { pl: 21.71, value: 3221.18, currentPrice: 24372.6 }
  // },
  {
    symbol: 'LINK/USD',
    openDate: 1678579200000,
    openPrice: 15.00,
    openBar: 73,
    closeDate: null,
    closePrice: null,
    closeBar: null,
    units: 100.0,
    side: 'long',
    stats: { pl: -10.22, value: 1500, currentPrice: 15 }
  }
]

const config = {
  dataDir: "./dev/data",
  reportsDir: "./dev/reports",
  backtestsDir: "./dev/backtests",
  dataProvider: "zapant", // async (params) => [{...}]
  execute: {
    date: "2024-07-10",
    // errors: "./dev/errors.txt",
    inputs: {
      symbols: [],
      initialCapital: 10000,
      cash: 10000,
      openPositions: [
        // ...samplePositions
      ] // samplePositions
    },
  },
  backtest: {
    startDate: "2023-01-01",
    endDate: "2024-07-10",
    analyzers: [
      new analyzers.RetursAnalyzer(),
      new analyzers.DrawDownAnalyzer(),
      new analyzers.TradesAnalyzer(),
      new analyzers.PositionsAnalyzer(),
      // new LogAnalyzer(),
    ]
  },
  report: {
  }
}

export default config;