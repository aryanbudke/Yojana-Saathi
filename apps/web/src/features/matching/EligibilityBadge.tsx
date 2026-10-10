"use client";
import { Badge } from "@/components/ui";
import type { SchemeMatch } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";
import { verdictTones } from "./types";
export function EligibilityBadge({
  status,
}: {
  status: SchemeMatch["status"];
}) {
  const m = useMessages();
  return <Badge tone={verdictTones[status]}>{m.verdicts[status]}</Badge>;
}
