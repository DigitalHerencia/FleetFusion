export type DateInput = Date | string | number;

export function toDate(value: DateInput): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date value.');
  return date;
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'en-US',
): string {
  return new Intl.DateTimeFormat(locale, options).format(toDate(value));
}

export function formatDateTime(value: DateInput, locale = 'en-US'): string {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' }, locale);
}

export function startOfDay(value: DateInput): Date {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: DateInput): Date {
  const date = toDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(value: DateInput, days: number): Date {
  if (!Number.isFinite(days)) throw new TypeError('The number of days must be finite.');
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function differenceInCalendarDays(later: DateInput, earlier: DateInput): number {
  const left = startOfDay(later).getTime();
  const right = startOfDay(earlier).getTime();
  return Math.round((left - right) / 86_400_000);
}
