import { Badge } from "@/components/ui";
import type { SchemeMatch } from "@/lib/api/contracts";
import { verdictLabels } from "./types";
export function EligibilityBadge({
  status,
}: {
  status: SchemeMatch["status"];
}) {
  const label = verdictLabels[status];
  return <Badge tone={label.tone}>{label.text}</Badge>;
}
