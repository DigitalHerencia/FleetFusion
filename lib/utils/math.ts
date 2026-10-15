export function clamp(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) throw new RangeError('Minimum must not be greater than maximum.');
  return Math.min(maximum, Math.max(minimum, value));
}

export function roundTo(value: number, decimalPlaces = 0): number {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 15) {
    throw new RangeError('Decimal places must be an integer between 0 and 15.');
  }
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function average(values: readonly number[]): number | null {
  return values.length === 0 ? null : sum(values) / values.length;
}

export function percentage(part: number, total: number): number {
  return total === 0 ? 0 : (part / total) * 100;
}
