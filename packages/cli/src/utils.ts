
export const floor = function (n: number, d: number) {
  const r = Math.pow(10, d)
  return Math.floor((n + Number.EPSILON) * r) / r
}