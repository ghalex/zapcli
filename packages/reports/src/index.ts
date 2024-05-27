import RetursReport from './reports/Returns'
import PositionsReport from './reports/Positions'
import TradesReport from './reports/Trades'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const renderReport = (name: string, data: any) => {
  const reportsByName: Record<string, any> = {}

  reportsByName['returns'] = new RetursReport()
  reportsByName['positions'] = new PositionsReport()
  reportsByName['trades'] = new TradesReport()

  if (!reportsByName[name]) {
    console.warn(`Report ${name} not found`)
    return []
  }

  return reportsByName[name].render(data)
}

export default renderReport