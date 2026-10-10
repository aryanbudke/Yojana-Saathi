"use client";

import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useMessages } from "@/i18n/client";

export function ProfilePrivacyNotice() {
  const m = useMessages();
  const t = m.profile;

  return (
    <div className="p-4 rounded-2xl bg-[#E7EDE7]/60 border border-[#165541]/15 text-[#102A24] space-y-2">
      <div className="flex items-start gap-2.5">
        <ShieldCheck
          size={18}
          className="text-[#165541] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#102A24] leading-relaxed">
            {t.privacyPanelText}
          </p>
          <p className="text-xs text-[#2E3C36] flex items-center gap-1.5 font-semibold">
            <AlertCircle size={13} className="shrink-0 text-[#8A6020]" aria-hidden="true" />
            <span>{t.privacyPanelAadhaar}</span>
          </p>

        </div>
      </div>
    </div>
  );
}
