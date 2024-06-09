import * as fs from 'node:fs'
import * as path from 'node:path'
import pug from 'pug'

const template = String.raw`
doctype html
html
  head
    title Report
    script(src="https://cdn.tailwindcss.com")
    style.
      body {
          background-color: #fbfcfe;
      }
      figure {
          margin: 0;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #e1e1e2;
          border-radius: 8px;
      }
      figure h2 {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 4px;
      }
  body
    div.p-8.bg-white.shadow
      h1.text-4xl.mb-1 Backtest Report
      select#file-select.bg-gray-200.p-1.mb-2
          each file in files
            option(value=file) #{file}

      p.text-sm
        b.mr-1 Date generated:
        span#date
      p.text-sm
        b.mr-1 File:
        span#file
      p.text-sm
        b.mr-1 Start Cash:
        span#cash1
      p.text-sm
        b.mr-1 End Cash:
        span#cash2
        
    hr
    div#container.grid.grid-cols-2.p-4.gap-4.container.mx-auto
    
    script(type="importmap").
      {
          "imports": {
              "@observablehq/plot": "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm",
              "@zapcli/reports": "https://cdn.jsdelivr.net/npm/@zapcli/reports/dist/zapcli-reports.es.js"
          }
      }
    script(type="module").
      import * as Plot from "@observablehq/plot"
      import renderReport from "@zapcli/reports"

      const dataDir = !{JSON.stringify(dataDir)}
      const dataFiles = !{JSON.stringify(files)};
      const container = document.querySelector("#container")
      const fileSelect = document.querySelector("#file-select")

      fileSelect.addEventListener("change", () => {
        const selectedFile = fileSelect.value
        loadFile(selectedFile)
      })

      function loadFile(file) {
        fetch(dataDir + '/' + file)
          .then(response => response.json())
          .then(data => {
              renderFile(data)
          })
          .catch(error => console.error(error))
      }

      function renderFile(data) {
        container.innerHTML = ""
        const plots = Object.keys(data.analyzers).map(name => renderReport(name, data.analyzers[name])).flat()
        plots.forEach(plot => {
          plot.classList.add(..."shadow bg-white".split(" "))
          container.append(plot)
        })

        document.getElementById('file').textContent = data.file;
        document.getElementById('cash1').textContent = data.startCash;
        document.getElementById('cash2').textContent = data.endCash;
        document.getElementById('date').textContent = data.dateGenerated
      }

      loadFile(dataFiles[0])
`

export default (config: any) => {

  const reportsDir = config.reportsDir ?? "reports"

  function getJsonFiles(directory) {
    // Read all files in the directory
    const files = fs.readdirSync(directory);

    // Filter out the files that are not .json
    return files.filter(file => path.extname(file).toLowerCase() === '.json');
  }

  const generateReport = (name: string) => {
    const renderFn = pug.compile(template, { pretty: true })
    const files = getJsonFiles(path.join(process.cwd(), reportsDir, 'data'))
    const html = renderFn({ files, dataDir: './data' })

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const filePath = path.join(process.cwd(), reportsDir, name)
    fs.writeFileSync(filePath, html)

    return filePath
  }

  return { generateReport }
}