import { formatNumber } from '../utils'
import * as Plot from '@observablehq/plot'
import BaseReport from './Report'

class RetursReport extends BaseReport {
  name = 'returns'

  render(data: any[]): HTMLElement[] {
    const plotData = data.map((d) => {
      return {
        ...d,
        date: new Date(d.date),
      }
    })

    const dataSize = plotData.map(d => d.value).length
    const filterPoints = d => d.date.getDate() === 1 //dataSize > 45 ? d.date.getDate() % Math.round(dataSize / 50) === 0 : true

    const plot1 = Plot.plot({
      inset: 0,
      marginLeft: 60,
      height: 300,
      title: "Cash & Value",
      x: { grid: false, label: "Date" },
      y: { grid: true, tickFormat: val => formatNumber(val), insetTop: 15, label: "Cash & Value" },
      marks: [
        Plot.frame(),
        Plot.dot(plotData, { x: "date", y: "value", fill: 'green', r: 3, stroke: 'green', tip: true, filter: filterPoints }),
        Plot.lineY(plotData, { x: "date", y: "value" }),
        Plot.dot(plotData, { x: "date", y: "cash", fill: 'gray', stroke: 'red', tip: true, filter: filterPoints }),
        Plot.lineY(plotData, { x: "date", y: "cash", stroke: 'red' })
      ]
    }) as HTMLElement

    const plot2 = Plot.plot({
      insetTop: 15,
      marginLeft: 60,
      height: 300,
      title: "P&L",
      x: { grid: false, label: "Date" },
      y: { grid: true, tickFormat: val => formatNumber(val), label: "P&L" },
      marks: [
        Plot.frame(),
        Plot.dot(plotData, { x: "date", y: "pl", fill: 'gray', stroke: 'black', tip: true, filter: filterPoints }),
        Plot.lineY(plotData, { x: "date", y: "pl" })
      ]
    }) as HTMLElement

    return [plot1, plot2]
  }

}

export default RetursReport