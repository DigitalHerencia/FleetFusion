export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, maximumLength: number) {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

export function safeHref(value: string | undefined | null) {
  if (!value) return "#";
  if (value.startsWith("#")) return value;
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  ) {
    return value;
  }

  try {
    const protocol = new URL(value).protocol;
    return ["https:", "http:", "mailto:", "tel:"].includes(protocol)
      ? value
      : "#";
  } catch {
    return "#";
  }
}

export function sanitizeCssValue(value: string) {
  return value.replace(/[;{}<>]/g, "").trim();
}
