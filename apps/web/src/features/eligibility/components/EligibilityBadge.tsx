import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { SchemeMatch } from "@/lib/api/contracts";
import { verdictLabels } from "@/features/matching/types";

export interface EligibilityBadgeProps {
  status: SchemeMatch["status"];
}

export function EligibilityBadge({ status }: EligibilityBadgeProps) {
  const meta = verdictLabels[status] ?? {
    text: "Unknown status",
    tone: "neutral",
  };

  return <Badge tone={meta.tone}>{meta.text}</Badge>;
}
