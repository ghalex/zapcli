import RetursReport from './reports/Returns'
import PositionsReport from './reports/Positions'
import TradesReport from './reports/Trades'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import DrawDownReport from './reports/DrawDown'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const renderReport = (name: string, data: any, options: any) => {
  const reportsByName: Record<string, any> = {}

  reportsByName['returns'] = new RetursReport(options)
  reportsByName['positions'] = new PositionsReport(options)
  reportsByName['trades'] = new TradesReport(options)
  reportsByName['drawdown'] = new DrawDownReport(options)

  if (!reportsByName[name]) {
    console.warn(`Report ${name} not found`)
    return []
  }

  return reportsByName[name].render(data)
}

export default renderReport