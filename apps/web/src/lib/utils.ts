import { safeOfficialUrl, containsReservedSource } from "./urls";
import { displayDate, humanize } from "./format";
import { cn } from "./classes";

export { cn, safeOfficialUrl, containsReservedSource, displayDate, humanize };

export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "Not specified";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
