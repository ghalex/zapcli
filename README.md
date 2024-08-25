<p align="center">
  <br>
  <a href="#">
    <img src="https://zapcli.com/zaplogo.png" width="100"/>
  </a>
</p>

<h1 align="center">ZapCli</h1>
<h3 align="center">The quickest way to write trading automations!</h3>
<p align="center">
  <b>ZapCli</b> is an open-source trading engine. That main focus is to simplify the process of <b>writing trading automations.</b>
</p>

<p align="center">
  <a title="Total downloads" href="https://www.npmjs.com/package/@zapcli/cli">
    <img src="https://img.shields.io/npm/dm/@zapcli/cli.svg?style=flat-square">
  </a>
  <a title="Current version" href="https://www.npmjs.com/package/@zapcli/cli">
    <img src="https://img.shields.io/npm/v/@zapcli/cli.svg?style=flat-square">
  </a>
  <a title="MIT License" href="LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ghalex/zapcli?style=flat-square">
  </a>
  <br>
  <br>
</p>


## ZapCLI

- 💡 Intuitive
- 🔌 Extensible
- 🦾 Scalable
- 📦 Extremely easy to use

## Documentation

To learn more about ZapCLI read the documentation [here](https://zapcli.com/) or [watch a video](https://www.youtube.com/watch?v=4-dnBD4YWwU)

## Get Started

```shell
npm i @zapcli/cli
zapcli create MyProject
zapcli backtest ./src/hello.zp
```

## Simple example

Buy one share of AAPL if price over EMA 30
```javascript
const assets = ["AAPL"]
const window = 30
const settings = {}

function run() {
  const AAPL = this.asset(assets[0])
  const ema = this.ema(AAPL, 30)

  if (AAPL.close > ema) {
    this.buy(AAPL, 1)
  }
}

return { assets, settings, window, run }
```

## Useful links:

- [Getting Started](https://zapcli.com/getting-started/) full guide.
- [View on Github](https://github.com/ghalex/zapcli)

## License

Copyright (c) 2021 [ZapCLI Contributors](https://github.com/ghalex/zapcli/graphs/contributors)
Licensed under the [GNU General License](https://github.com/ghalex/zapcli/blob/HEAD/LICENSE).
