"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Button } from "@/components/ui";
import { useSavedSchemes } from "../hooks/useSavedSchemes";
import { displayDate, humanize } from "@/lib/utils";

export function SavedSchemesList() {
  const { saved, loaded, removeScheme } = useSavedSchemes();

  if (!loaded) return null;

  if (saved.length === 0) {
    return (
      <EmptyState title="No saved schemes yet">
        <p>
          As you explore schemes in discovery or recommendations, you can save
          them here to revisit anytime during your session.
        </p>
        <Link className="button primary inline-flex items-center gap-2" href="/discover">
          <span>Explore schemes</span>
          <ArrowUpRight size={16} />
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <span className="text-sm font-semibold text-slate-700">
          {saved.length} scheme{saved.length === 1 ? "" : "s"} bookmarked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {saved.map((scheme) => (
          <GlassCard
            key={scheme.id}
            variant="standard"
            glow="emerald"
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge tone="neutral">{humanize(scheme.category)}</Badge>
                <Badge tone={scheme.status === "active" ? "success" : "warning"}>
                  {scheme.status === "active" ? "Active" : "Closed"}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug hover:text-emerald-800 transition-colors">
                <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
              </h3>

              <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {scheme.summary}
              </p>

              <p className="text-xs text-slate-500 mt-3">
                Bookmarked on {displayDate(scheme.savedAt)}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 text-xs">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => removeScheme(scheme.id)}
                className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </Button>

              <Link
                href={`/schemes/${scheme.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>View details</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
