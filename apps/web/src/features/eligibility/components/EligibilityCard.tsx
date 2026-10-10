import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SourceLink } from "@/components/ui";
import { EligibilityBadge } from "./EligibilityBadge";
import { CriteriaChecklist } from "./CriteriaChecklist";
import type { SchemeMatch } from "@/lib/api/contracts";
import { displayDate } from "@/lib/utils";

export interface EligibilityCardProps {
  match: SchemeMatch;
}

export function EligibilityCard({ match }: EligibilityCardProps) {
  const allRules = [
    ...match.matched_rules,
    ...match.failed_rules,
    ...match.unknown_rules,
    ...match.manual_review_rules,
  ];

  return (
    <GlassCard variant="standard" glow="emerald" className="p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <EligibilityBadge status={match.status} />
        <span className="text-xs text-slate-500 font-medium">
          Verified on {displayDate(match.last_verified_at)}
        </span>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          <Link href={`/schemes/${match.scheme_id}`} className="hover:text-emerald-800 transition-colors">
            {match.scheme_name}
          </Link>
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Version {match.scheme_version_id}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Evaluated Conditions ({allRules.length})
        </h4>
        <CriteriaChecklist rules={allRules} />
      </div>

      <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          {match.official_source_urls.map((url) => (
            <SourceLink key={url} url={url} />
          ))}
        </div>
        <Link
          href={`/schemes/${match.scheme_id}`}
          className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <span>View full details &amp; checklist</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </GlassCard>
  );
}
