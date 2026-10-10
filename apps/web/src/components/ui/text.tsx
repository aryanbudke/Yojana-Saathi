"use client";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/client";
import { safeOfficialUrl } from "@/lib/urls";

export function SourceLink({
  url,
  children,
}: {
  url: string;
  children?: ReactNode;
}) {
  const m = useMessages();
  const safe = safeOfficialUrl(url);
  return safe ? (
    <a
      className="source-link inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-medium transition-colors"
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children ?? m.common.officialSource}
      <ExternalLink size={14} aria-hidden="true" />
      <span className="sr-only">{m.common.opensInNewTab}</span>
    </a>
  ) : (
    <span className="source-unavailable text-xs text-slate-500">
      {m.common.sourceUnavailable}
      {url.includes(".invalid") ? m.common.syntheticFixture : ""}
    </span>
  );
}

export function Disclaimer() {
  const m = useMessages();
  return (
    <p className="disclaimer text-xs text-slate-500 leading-relaxed">
      {m.disclaimer}
    </p>
  );
}
