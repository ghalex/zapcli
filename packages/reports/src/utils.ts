
export const round = function (n: number, d: number) {
  const r = Math.pow(10, d)
  return Math.round((n + Number.EPSILON) * r) / r
}

export const formatNumber = (val) => {
  if (val >= 1000) {
    const formattedValue = (val / 1000).toFixed(1);
    return `$${formattedValue}k`;
  } else {

    const op = {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 3
    }

    return val.toLocaleString('en-US', op)
  }
}