export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(
  amount: number | string,
  currency: string,
  locale = "en",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export function assertSameCurrency(left: string, right: string) {
  if (left !== right) {
    throw new Error(
      `Currency mismatch: ${left} cannot be combined with ${right}.`,
    );
  }
}
