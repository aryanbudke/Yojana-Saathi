export function displayDate(
  value: string,
  intlLocale = "en-IN",
  unavailable = "Verification date unavailable",
) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? unavailable
    : new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(d);
}
export function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (s) => s.toUpperCase());
}
/** Translated label for an API code, falling back to a readable version of the code. */
export function labelFor(labels: Record<string, string>, value: string) {
  return labels[value] ?? humanize(value);
}
