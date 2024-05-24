import RetursReport from './reports/Returns'
import PositionsReport from './reports/Positions'

const renderReport = (name: string, data: any) => {
  const reportsByName: Record<string, any> = {}

  reportsByName['returns'] = new RetursReport()
  reportsByName['positions'] = new PositionsReport()

  if (!reportsByName[name]) {
    console.warn(`Report ${name} not found`)
    return []
  }

  return reportsByName[name].render(data)
}

export default renderReport