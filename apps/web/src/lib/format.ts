export function displayDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Verification date unavailable"
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(d);
}
export function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (s) => s.toUpperCase());
}
