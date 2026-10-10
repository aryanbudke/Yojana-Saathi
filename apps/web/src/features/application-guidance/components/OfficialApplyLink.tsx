import React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { InlineAlert } from "@/components/ui";
import { safeOfficialUrl } from "@/lib/urls";
import { displayDate } from "@/lib/utils";
import type { SchemeDetail } from "@/lib/api/contracts";

export interface OfficialApplyLinkProps {
  scheme: SchemeDetail;
  applicationUrl: string;
  hasSteps: boolean;
  sameVersion: boolean;
}

export function OfficialApplyLink({
  scheme,
  applicationUrl,
  hasSteps,
  sameVersion,
}: OfficialApplyLinkProps) {
  const safe = safeOfficialUrl(applicationUrl);
  const canApply =
    scheme.review_status === "verified" &&
    scheme.status === "active" &&
    sameVersion &&
    hasSteps &&
    safe;

  return (
    <GlassCard
      variant="elevated"
      glow="emerald"
      className="panel application-portal p-6 sm:p-7 space-y-4 border-emerald-400/30"
    >
      <div>
        <p className="eyebrow text-xs font-bold uppercase tracking-wider text-emerald-800">
          When you’re ready
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          The next step is yours
        </h2>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        Applications are handled directly on the government’s official portal. We help you prepare; we do not submit or approve applications on your behalf.
      </p>

      {canApply ? (
        <a
          className="button primary wide w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all"
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Apply on official portal</span>
          <ExternalLink size={17} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <InlineAlert>
          {scheme.status === "closed"
            ? "Applications are closed."
            : scheme.status === "unknown"
              ? "The application window is unknown."
              : "An official application link could not be verified."}{" "}
          Confirm the current process directly with the responsible authority.
        </InlineAlert>
      )}

      <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <ShieldCheck size={14} className="text-emerald-700 shrink-0" aria-hidden="true" />
        <span>Last verified on {displayDate(scheme.last_verified_at)}</span>
      </div>
    </GlassCard>
  );
}
