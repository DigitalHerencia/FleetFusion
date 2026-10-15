export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function isPast(date: Date, now = new Date()) {
  return date.getTime() < now.getTime();
}

export function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale = "en",
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
