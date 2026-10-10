"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SourceLink } from "@/components/ui";
import type { Guidance } from "@/lib/api/contracts";

const statusLabels: Record<string, { label: string; tone: "success" | "danger" | "warning" }> = {
  present: { label: "Reported present", tone: "success" },
  missing: { label: "Missing", tone: "danger" },
  unknown: { label: "Unknown", tone: "warning" },
  may_be_required: { label: "May be required", tone: "warning" },
};

export interface DocumentChecklistProps {
  guidance: Guidance;
}

export function DocumentChecklist({ guidance }: DocumentChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const total = guidance.documents.length;
  const progressPercent = total ? Math.round((checked.size / total) * 100) : 0;

  return (
    <GlassCard variant="standard" glow="emerald" className="panel checklist p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200/70">
        <div>
          <p className="eyebrow text-xs font-bold uppercase tracking-wider text-emerald-800">
            Get your documents together
          </p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Your personal checklist
          </h2>
        </div>
        <Badge tone={checked.size === total && total > 0 ? "success" : "neutral"}>
          {checked.size} / {total} marked ready
        </Badge>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        “I have it” is your personal note to prepare. It does not certify a document or indicate official government verification. These notes stay in this page only.
      </p>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Readiness progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div
          className="readiness-track w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 p-0.5"
          role="progressbar"
          aria-label="Documents marked ready by you"
          aria-valuemin={0}
          aria-valuemax={total || 1}
          aria-valuenow={checked.size}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {total ? (
        <ul className="space-y-3.5 pt-2" role="list">
          {guidance.documents.map((doc, index) => {
            const isReady = checked.has(index);
            const source = guidance.sources.find((s) => s.id === doc.source_id);
            const meta = statusLabels[doc.status] ?? statusLabels.unknown;

            return (
              <li
                key={`${doc.source_id}-${index}`}
                className={`p-4 rounded-2xl border transition-all duration-200 backdrop-blur-md ${
                  isReady
                    ? "bg-emerald-50/80 border-emerald-300/80 shadow-xs"
                    : "bg-white/80 border-slate-200/70 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <label className="checklist-label flex items-start gap-3.5 cursor-pointer select-none flex-1">
                    <input
                      type="checkbox"
                      checked={isReady}
                      onChange={(e) =>
                        setChecked((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(index);
                          else next.delete(index);
                          return next;
                        })
                      }
                      className="w-5 h-5 rounded-md mt-0.5 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <strong className="text-sm sm:text-base font-bold text-slate-900 block leading-snug">
                        {doc.name}
                      </strong>
                      <span className="small muted text-xs text-slate-500 font-medium">
                        {isReady ? "Marked ready by you" : "Click to mark ready"}
                      </span>
                    </div>
                  </label>

                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>

                <div className="document-note pl-8.5 mt-2 space-y-1.5 text-xs text-slate-600">
                  {doc.note && <p className="italic text-slate-700">{doc.note}</p>}
                  {source ? (
                    <SourceLink url={source.official_url}>
                      {source.title}
                    </SourceLink>
                  ) : (
                    <p className="source-unavailable text-slate-400">
                      Confirm requirement with responsible authority.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty p-6 text-center rounded-2xl bg-slate-50 text-slate-500 text-sm">
          Document requirements are unavailable. Check the current official requirements.
        </p>
      )}
    </GlassCard>
  );
}
