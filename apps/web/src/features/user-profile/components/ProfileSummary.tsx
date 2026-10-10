"use client";

import React from "react";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { fields } from "@/features/profile/types";
import { factLabel } from "@/features/profile/model";
import { useMessages } from "@/i18n/client";

export function ProfileSummary() {
  const m = useMessages();
  const t = m.profileSummary;
  const p = useProfile();

  return (
    <GlassCard variant="standard" glow="emerald" className="p-6">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            {t.eyebrow}
          </span>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {t.title}
          </h3>
        </div>
        <Badge tone={p.confirmed ? "success" : "warning"}>
          {p.confirmed ? m.common.confirmedByYou : t.draft}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3.5 my-4">
        {fields.slice(0, 6).map((f) => {
          const displayVal = factLabel(f.key, p.draft.facts[f.key], m);

          return (
            <div key={f.key} className="space-y-0.5">
              <dt className="text-xs text-slate-500 font-medium">{m.fields[f.key]}</dt>
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
            <span>{t.edit}</span>
          </Button>
        </Link>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 text-center">
        {t.note}
      </p>
    </GlassCard>
  );
}
