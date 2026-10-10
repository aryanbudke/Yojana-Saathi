"use client";
import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { SchemeMatch } from "@/lib/api/contracts";
import { verdictTones } from "@/features/matching/types";
import { useMessages } from "@/i18n/client";

export interface EligibilityBadgeProps {
  status: SchemeMatch["status"];
}

export function EligibilityBadge({ status }: EligibilityBadgeProps) {
  const m = useMessages();
  return (
    <Badge tone={verdictTones[status] ?? "neutral"}>
      {m.verdicts[status] ?? m.match.unknownStatus}
    </Badge>
  );
}
