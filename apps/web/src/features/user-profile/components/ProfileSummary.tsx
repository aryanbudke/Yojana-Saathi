"use client";

import React from "react";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { fields, states } from "@/features/profile/types";

export function ProfileSummary() {
  const p = useProfile();

  return (
    <GlassCard variant="standard" glow="emerald" className="p-6">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Active session
          </span>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Your Profile
          </h3>
        </div>
        <Badge tone={p.confirmed ? "success" : "warning"}>
          {p.confirmed ? "Confirmed by you" : "Draft"}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3.5 my-4">
        {fields.slice(0, 6).map((f) => {
          const value = p.draft.facts[f.key];
          let displayVal = "Unknown";
          if (value !== null && value !== undefined) {
            if (f.key === "state_code") {
              displayVal =
                states.find(([code]) => code === value)?.[1] ?? String(value);
            } else {
              displayVal = String(value);
            }
          }

          return (
            <div key={f.key} className="space-y-0.5">
              <dt className="text-xs text-slate-500 font-medium">{f.label}</dt>
              <dd className="text-sm font-bold text-slate-900 truncate">
                {displayVal}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
        <Link href="/profile" className="w-full">
          <Button variant="secondary" size="sm" className="w-full text-xs">
            <Edit2 size={13} />
            <span>Edit details</span>
          </Button>
        </Link>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 text-center">
        Stored in tab memory only · Cleared on close
      </p>
    </GlassCard>
  );
}
