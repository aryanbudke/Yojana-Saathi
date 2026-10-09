export { AppHeader } from "@/components/AppHeader";
import { ExternalLink, Info, LoaderCircle } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { safeOfficialUrl } from "@/lib/urls";
export { safeOfficialUrl } from "@/lib/urls";

export function Button({
  children,
  className = "",
  variant = "primary",
  busy = false,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  busy?: boolean;
}) {
  return (
    <button
      className={`button ${variant} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy}
      {...props}
    >
      {busy && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`input textarea ${props.className ?? ""}`}
    />
  );
}
export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass ${className}`}>{children}</section>;
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function InlineAlert({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`alert ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      <Info size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="skeleton" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
    </div>
  );
}
export function SourceLink({
  url,
  children = "Official source",
}: {
  url: string;
  children?: ReactNode;
}) {
  const safe = safeOfficialUrl(url);
  return safe ? (
    <a
      className="source-link"
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLink size={14} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <span className="source-unavailable">
      Source link unavailable
      {url.includes(".invalid") ? " · synthetic fixture" : ""}
    </span>
  );
}
export function Disclaimer() {
  return (
    <p className="disclaimer">
      An independent project. This is preliminary guidance; the government
      portal makes final decisions. We do not submit or approve applications.
    </p>
  );
}

export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <div className="empty-content">{children}</div>
    </div>
  );
}
