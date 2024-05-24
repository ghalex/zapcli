import * as indicators from '../indicators'

const zpIndicators = (env) => {
  const { bars } = env

  return {
    atr: indicators.atr(bars),
    cmr: indicators.cmr(bars),
    donchian: indicators.donchian(bars),
    ema: indicators.ema(bars),
    highest: indicators.highest(bars),
    lowest: indicators.lowest(bars),
    momentum: indicators.momentum(bars),
    rsi: indicators.rsi(bars),
    sma: indicators.sma(bars),
    std: indicators.std(bars)
  }
}


export default zpIndicators
