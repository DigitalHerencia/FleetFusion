export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return formatNumber(value, { style: 'currency', currency }, locale);
}

export function formatPercent(value: number, fractionDigits = 0, locale = 'en-US'): string {
  return formatNumber(
    value,
    {
      style: 'percent',
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    },
    locale,
  );
}

export function formatFileSize(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0)
    throw new RangeError('File size must be a non-negative number.');
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;
  return `${Number(size.toFixed(fractionDigits))} ${units[exponent]}`;
}

export function truncate(value: string, maxLength: number, suffix = '…'): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError('Maximum length must be a non-negative integer.');
  }
  if (value.length <= maxLength) return value;
  if (maxLength <= suffix.length) return suffix.slice(0, maxLength);
  return `${value.slice(0, maxLength - suffix.length)}${suffix}`;
}

export function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0]!.toUpperCase()}${value.slice(1)}`;
}
