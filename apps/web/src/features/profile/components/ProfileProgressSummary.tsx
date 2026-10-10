"use client";

import React, { type RefObject } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";

export interface ProfileProgressSummaryProps {
  extractedCount: number;
  confirmed: boolean;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function ProfileProgressSummary({
  extractedCount,
  confirmed,
  headingRef,
}: ProfileProgressSummaryProps) {
  const m = useMessages();
  const t = m.profile;

  const summaryText =
    extractedCount > 0
      ? format(t.extractedSummary, { count: extractedCount })
      : t.manualEntrySummary;

  return (
    <div className="space-y-3 pb-5 border-b border-stone-200/80">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#165541]">
            {t.confirmEyebrow}
          </p>
          <h2
            id="review-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-extrabold text-[#102A24] tracking-tight mt-1 outline-none"
          >
            {t.confirmTitle}
          </h2>
        </div>

        <Badge tone={confirmed ? "success" : "warning"}>
          {confirmed ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} aria-hidden="true" />
              {m.common.confirmedByYou}
            </span>
          ) : (
            t.needsReview
          )}
        </Badge>
      </div>

      <p className="text-sm text-[#3D4B44] max-w-2xl leading-relaxed">
        {t.confirmLead}
      </p>

      {/* Dynamic profile summary pill */}
      <div
        className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#E7EDE7]/70 border border-[#165541]/15 text-xs font-semibold text-[#102A24]"
        aria-live="polite"
      >
        <Sparkles size={13} className="text-[#8A6020] shrink-0" aria-hidden="true" />
        <span>{summaryText}</span>
      </div>
    </div>
  );
}
