"use client";
import React from "react";
import { Info } from "lucide-react";
import { SourceLink } from "@/components/ui";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import type { SchemeMatch } from "@/lib/api/contracts";

export interface MatchExplanationProps {
  match: SchemeMatch;
}

export function MatchExplanation({ match }: MatchExplanationProps) {
  const m = useMessages();
  const date = useDisplayDate();
  return (
    <details className="explanation text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 transition-colors">
      <summary className="font-bold text-slate-800 cursor-pointer flex items-center gap-1.5 select-none">
        <Info size={14} className="text-emerald-700" />
        <span>{m.match.why}</span>
      </summary>
      <div className="mt-3 space-y-2 leading-relaxed">
        <p>
          {m.match.whyText}
        </p>
        <p className="text-slate-500">
          {format(m.match.verifiedVersion, {
            date: date(match.last_verified_at),
            version: match.scheme_version_id,
          })}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {match.official_source_urls.map((url) => (
            <SourceLink key={url} url={url} />
          ))}
        </div>
      </div>
    </details>
  );
}
