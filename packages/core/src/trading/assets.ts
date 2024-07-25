import { Asset, Bar } from ".."
import { head } from 'ramda'

const zpAssets = (env) => {
  const { bars } = env

  return {
    // getBar
    asset: (symbol: string, op = {}): Bar => {
      const { prop, daysAgo } = { prop: null, daysAgo: 0, ...op }

      if (!bars[symbol]) {
        throw new Error(`Bars for asset ${symbol} was not loaded`)
      }

      if (bars[symbol].length < daysAgo) {
        throw new Error(`Only ${bars[symbol].length} bars available for asset ${symbol} require ${daysAgo}`)
      }

      return prop ? bars[symbol][daysAgo][prop] : bars[symbol][daysAgo]
    },

    // getBars
    assets: (symbol: string, window: number, op = {}): Bar[] => {
      const { prop, daysAgo } = { prop: null, daysAgo: 0, ...op }

      if (!bars[symbol]) {
        throw new Error(`Bars for asset ${symbol} was not loaded`)
      }

      if (bars[symbol].length < window + daysAgo) {
        throw new Error(`Only ${bars[symbol].length} bars available for asset ${symbol} require ${window + daysAgo}`)
      }

      const data = bars[symbol].slice(daysAgo, window + daysAgo)

      return prop ? data.map(b => b[prop]) : data
    },

    today: () => {
      const keys = Object.keys(bars)

      if (keys.length === 0) {
        throw new Error('No assets loaded to get today')
      }

      const bar = bars[keys[0]][0]
      return new Date(bar.date)
    }
  }
}


export default zpAssets
