
export const floor = function (n: number, d: number) {
  const r = Math.pow(10, d)
  return Math.floor((n + Number.EPSILON) * r) / r
}

export const round = function (n: number, d: number) {
  const r = Math.pow(10, d)
  return Math.round((n + Number.EPSILON) * r) / r
}

export const currencyFormat = (value: number) => {
  const f = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

  if (isNaN(value)) {
    return f.format(0)
  }

  return f.format(value)
}