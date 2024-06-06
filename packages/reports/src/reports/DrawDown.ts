import { formatNumber } from '../utils'
import * as Plot from '@observablehq/plot'
import BaseReport from './Report'

class DrawDownReport extends BaseReport {
  name = 'drawdown'

  render(data: any[]): HTMLElement[] {

    const ddData = data['drawdown']
    const plotDDData = ddData['drawDowns'].map((d) => {
      return {
        ...d,
        date: new Date(d.date),
        dateFormattted: d.date
      }
    })

    const plot1 = Plot.plot({
      inset: 0,
      marginLeft: 60,
      height: 300,
      title: "Cash & Value",
      x: { grid: false, label: "Date" },
      y: { grid: true, tickFormat: val => formatNumber(val), insetTop: 15, label: "Cash & Value" },
      marks: [
        Plot.frame(),
        Plot.lineY(plotDDData, { x: "date", y: d => d.max - d.moneyDown }),
        Plot.areaY(plotDDData, {
          x: "date",
          y1: (d) => d.max,
          y2: (d) => d.max - d.moneyDown,
          fill: "red", // Color of the area
          opacity: 0.2, // Transparency of the area,
          filter: d => new Date(d.date).getTime() >= new Date(ddData.maxDrawDownStart).getTime()
            && new Date(d.date).getTime() <= new Date(ddData.maxDrawDownEnd).getTime()
        }),
        Plot.dot(plotDDData, { x: "date", y: "max", fill: 'gray', stroke: 'red', tip: true, filter: d => d.dateFormattted === ddData.maxDrawDownStart || d.date === ddData.maxDrawDownEnd }),
        Plot.lineY(plotDDData, { x: "date", y: "max", stroke: 'red', filter: d => new Date(d.date).getTime() >= new Date(ddData.maxDrawDownStart).getTime() && new Date(d.date).getTime() < new Date(ddData.maxDrawDownEnd).getTime() })
      ]
    })

    return [plot1 as HTMLElement]
  }

}

export default DrawDownReport