import { formatNumber } from '../utils'
import * as Plot from '@observablehq/plot'

class BaseReport {
  name = 'report'
  options = {}

  constructor(options: any) {
    this.options = options
  }

  render(data: any[]): HTMLElement[] {
    return []
  }

}

export default BaseReport