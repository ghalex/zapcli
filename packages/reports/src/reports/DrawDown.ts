import { formatNumber } from '../utils'
import * as Plot from '@observablehq/plot'
import BaseReport from './Report'

class DrawDownReport extends BaseReport {
  name = 'drawdown'

  createText(tLeft: string, tRight: string, pos: any) {
    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text1.setAttribute("x", pos.x.toString());
    text1.setAttribute("y", pos.y.toString());
    text1.setAttribute("fill", "black");
    text1.setAttribute("font-size", "14px");
    text1.setAttribute('text-anchor', 'start');

    const tspan1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan1.textContent = tLeft;

    const tspan2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan2.textContent = tRight;
    tspan2.setAttribute("font-weight", "bold");

    text1.appendChild(tspan1);
    text1.appendChild(tspan2);

    return text1
  }

  render(data: any): HTMLElement[] {

    const plotDDData = data['drawDowns'].map((d) => {
      return {
        ...d,
        date: new Date(d.date),
        dateFormattted: d.date
      }
    })

    const filterEqual = d => d.dateFormattted === data.maxDrawDownStart || d.date === data.maxDrawDownEnd
    const filterMaxDrawDown = d => new Date(d.date).getTime() >= new Date(data.maxDrawDownStart).getTime() && new Date(d.date).getTime() <= new Date(data.maxDrawDownEnd).getTime()

    const plot1 = Plot.plot({
      inset: 0,
      marginLeft: 60,
      height: 300,
      title: "DrawDown",
      x: { grid: false, label: "Date" },
      y: { grid: true, tickFormat: val => formatNumber(val), insetTop: 15, label: "Cash & Value" },
      marks: [
        Plot.frame(),
        Plot.lineY(plotDDData, { x: "date", y: "max", stroke: 'red', strokeWidth: 1, filter: filterMaxDrawDown }),
        Plot.areaY(plotDDData, {
          x: "date",
          y1: (d) => d.max,
          y2: (d) => d.max - d.moneyDown,
          fill: "red", // Color of the area
          opacity: 0.2, // Transparency of the area,
          filter: filterMaxDrawDown
        }),
        Plot.dot(plotDDData, { x: "date", y: d => d.max - d.moneyDown, fill: 'red', fillOpacity: 0.5, stroke: 'red', symbol: "cross", filter: p => p.moneyDown === data.maxMoneyDown }),
        // Plot.lineY(plotDDData, { x: "date", y: "max", stroke: 'orange', strokeWidth: 1, filter: (x) => !filterMaxDrawDown(x) })
        // Plot.areaY(plotDDData, {
        //   x: "date",
        //   y1: (d) => d.max,
        //   y2: (d) => d.max - d.moneyDown,
        //   fill: "orange", // Color of the area
        //   opacity: 0.3, // Transparency of the area,
        //   filter: (x) => !filterMaxDrawDown(x)
        // }),
        Plot.lineY(plotDDData, { x: "date", y: d => d.max - d.moneyDown, tip: true }),
        Plot.dot(plotDDData, { x: "date", y: "max", fill: 'gray', stroke: 'red', filter: filterEqual }),
        // Plot.text(annotations, { x: "date", y: "y", text: "text", textAnchor: "start", lineAnchor: 'bottom', frameAnchor: 'bottom', fontSize: 12, fontWeight: "bold", fill: "red" })
      ]
    })

    const svg = plot1.querySelector("svg");
    const frame = plot1.querySelector("svg > rect[aria-label=frame]");
    const left = parseFloat(frame?.getAttribute("x") || "0") + 10;
    const top = parseFloat(frame?.getAttribute("y") || "0") + 20;

    const text1 = this.createText('Max DD: ', ` ${data.maxDrawDown}%`, { x: left, y: top });
    const text2 = this.createText('Max DD Cash: ', ` $${data.maxMoneyDown.toFixed(2)}`, { x: left, y: top + 20 });

    svg?.appendChild(text1);
    svg?.appendChild(text2);

    return [plot1 as HTMLElement]
  }

}

export default DrawDownReport