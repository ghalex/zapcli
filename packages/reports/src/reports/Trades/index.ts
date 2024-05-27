import dayjs from 'dayjs'
import { formatNumber } from '../../utils'
import dataMap from './mapping'

class TradesReport {
  name = 'trades'

  private formatValue(value: any, format: any) {
    switch (format) {
      case 'number':
        return value
      case 'currency':
        return formatNumber(value)
      case 'percentage':
        return `${value * 100}%`
      case 'duration':
        return dayjs.duration(value, 'seconds').humanize()
      default:
        return value
    }
  }

  private createTableFromObject(obj) {
    // Create a table element
    const table = document.createElement('table')

    // Iterate through the key-value pairs in the object
    for (const [key, value] of Object.entries(obj)) {
        // Create a new row for each key-value pair
        const row = document.createElement('tr')

        const label = dataMap[key].label
        const formattedValue = this.formatValue(value, dataMap[key].format)

        // Create a cell for the key
        const keyCell = document.createElement('td')
        keyCell.textContent = label
        row.appendChild(keyCell)

        // Create a cell for the value
        const valueCell = document.createElement('td') as any
        valueCell.textContent = formattedValue
        row.appendChild(valueCell)

        // Append the row to the table
        table.appendChild(row)
    }

    // Return the constructed table
    return table
}

  render(data: any[]): HTMLElement[] {
    const table = this.createTableFromObject(data)
    table.className = 'trades-table'

    const element = document.createElement('div')
    element.className = 'trades-report col-span-1'
    element.appendChild(table)

    const style = document.createElement('style')
    style.innerHTML = `
      .trades-report {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .trades-table {
        border-collapse: collapse;
        margin: 0;
        font-size: 0.9em;
        font-family: sans-serif;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
      }

      .trades-table td:first-child,
      .trades-table th:first-child {
        border-right: 1px solid #e2e8f0;
      }


      .trades-table td {
        padding: 6px 12px;
      }

      .trades-table td:nth-child(2) {
        font-size: 1.1em;
      }

      .trades-table tr:not(:last-child) {
        border-bottom: 1px solid #e2e8f0;
      }

      .trades-table td:nth-child(2) {
        text-align: right;
      }
    `

    document.head.append(style)

    return [element]
  }

}

export default TradesReport