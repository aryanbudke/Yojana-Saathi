import React from "react";
import Link from "next/link";
import { ArrowUpRight, Landmark, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SourceLink } from "@/components/ui";
import type { SchemeSummary } from "@/lib/api/contracts";
import { displayDate, humanize } from "@/lib/utils";
import { discoveryCategories } from "../types";

export interface SchemeCardProps {
  scheme: SchemeSummary;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const categoryMeta = discoveryCategories.find(
    (c) => c.value === scheme.category,
  );
  const Icon = categoryMeta?.icon ?? Landmark;
  const glow = categoryMeta?.glow ?? "emerald";

  return (
    <GlassCard
      variant="standard"
      glow={glow}
      interactive
      className="p-6 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-100/90 text-emerald-800 flex items-center justify-center border border-slate-200/50">
              <Icon size={16} aria-hidden="true" />
            </span>
            <Badge tone="neutral">{humanize(scheme.category)}</Badge>
          </div>
          <Badge tone={scheme.status === "active" ? "success" : "warning"}>
            {scheme.status === "active"
              ? "Active"
              : scheme.status === "closed"
                ? "Closed"
                : "Window Unknown"}
          </Badge>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug hover:text-emerald-800 transition-colors">
          <Link href={`/schemes/${scheme.id}`} className="inline-flex items-center gap-1.5">
            <span>{scheme.name}</span>
          </Link>
        </h3>

        <p className="text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
          {scheme.summary}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Landmark size={13} className="text-emerald-700" />
            {humanize(scheme.government_level)} scheme
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-emerald-700" />
            Verified {displayDate(scheme.last_verified_at)}
          </span>
        </div>

        {scheme.review_status !== "verified" && (
          <div className="mt-3">
            <Badge tone="warning">
              Manual verification needed · {humanize(scheme.review_status)}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 flex-wrap text-xs">
        <SourceLink url={scheme.official_sources[0].official_url} />
        <Link
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 hover:text-emerald-950 transition-colors shadow-2xs"
          href={`/schemes/${scheme.id}`}
        >
          <span>View details</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </GlassCard>
  );
}
