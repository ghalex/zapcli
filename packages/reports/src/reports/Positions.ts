import TableBuilder from 'table-builder'
import { formatNumber } from '../utils'
import BaseReport from './Report'

class PositionsReport extends BaseReport {
  name = 'returns'

  render(data: any[]): HTMLElement[] {
    const plotData = data.map((d) => {
      return {
        ...d,
        openPrice: formatNumber(d.openPrice),
        closePrice: formatNumber(d.closePrice)
      }
    })

    const headers = {
      symbol: 'Symbol',
      openDate: 'Open Date',
      openPrice: 'Open Price',
      openBar: 'Open Bar',
      closeDate: 'Close Date',
      closePrice: 'Close Price',
      closeBar: 'Close Bar',
      units: 'Units',
      side: 'Side'
    }

    const table = new TableBuilder({ 'class': 'styled-table' })
      .setHeaders(headers) // see above json headers section
      .setData(plotData) // see above json data section
      .render()

    const element = document.createElement('div')
    element.className = 'table-container col-span-2'
    element.innerHTML = table


    const style = document.createElement('style')
    style.innerHTML = `
      .styled-table {
        border-collapse: collapse;
        margin: 0;
        font-size: 0.9em;
        font-family: sans-serif;
        min-width: 400px;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
      }

      .styled-table thead tr {
        background-color: #475569;
        color: #ffffff;
        text-align: left;
      }

      .styled-table th,
      .styled-table td {
        padding: 12px 15px;
      }

      .styled-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
      }

      .styled-table tbody tr.active-row {
        font-weight: bold;
        color: #94a3b8;
      }

      .styled-table .symbol-td {
        font-weight: bold;
      }
    `

    document.head.append(style)

    return [element]
  }

}

export default PositionsReport