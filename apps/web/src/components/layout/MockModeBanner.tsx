"use client";

import React from "react";
import { isMock } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export function MockModeBanner() {
  if (!isMock) return null;

  return (
    <div
      className="mode-notice mb-3 rounded-xl bg-amber-500/10 backdrop-blur-md border border-amber-500/25 px-3.5 py-1.5 flex items-center gap-2.5 text-xs text-amber-950 shadow-xs"
      role="status"
    >
      <div className="flex items-center gap-1.5 font-bold shrink-0 text-amber-900">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
        <AlertCircle size={14} aria-hidden="true" />
        Mock mode
      </div>
      <span className="text-amber-950/85 text-xs leading-normal">
        Synthetic contract examples. These are not real government scheme recommendations.
      </span>
    </div>
  );
}
