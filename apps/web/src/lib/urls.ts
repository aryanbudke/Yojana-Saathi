/** Source ownership still requires human review; this is an additional navigation boundary. */
export function safeOfficialUrl(raw: string) {
  try {
    const url = new URL(raw);
    const approved = (process.env.NEXT_PUBLIC_REVIEWED_OFFICIAL_HOSTS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      (/(^|\.)(gov\.in|nic\.in)$/.test(host) || approved.includes(host))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function containsReservedSource(value: unknown): boolean {
  if (typeof value === "string" && value.startsWith("https://")) {
    try {
      const host = new URL(value).hostname;
      return (
        /(^|\.)(invalid|test|localhost|example)$/.test(host) ||
        /^(example\.(com|org|net)|localhost)$/.test(host) ||
        host.startsWith("example.")
      );
    } catch {
      return true;
    }
  }
  if (Array.isArray(value)) return value.some(containsReservedSource);
  if (value && typeof value === "object")
    return Object.values(value).some(containsReservedSource);
  return false;
}
