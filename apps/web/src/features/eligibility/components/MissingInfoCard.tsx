import React from "react";
import { HelpCircle, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui";
import type { RuleOutcome } from "@/lib/api/contracts";

export interface MissingInfoCardProps {
  unknownRules: RuleOutcome[];
  onAnswerQuestion?: () => void;
}

export function MissingInfoCard({
  unknownRules,
  onAnswerQuestion,
}: MissingInfoCardProps) {
  if (!unknownRules.length) return null;

  return (
    <GlassCard variant="standard" glow="saffron" className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
          <HelpCircle size={18} aria-hidden="true" />
        </span>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Conditions Needing Information ({unknownRules.length})
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
        These conditions could not be verified because relevant profile details were left blank or unknown.
      </p>

      <ul className="space-y-2 mb-4">
        {unknownRules.map((rule) => (
          <li
            key={rule.rule_key}
            className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 font-medium"
          >
            {rule.reason}
          </li>
        ))}
      </ul>

      {onAnswerQuestion && (
        <Button
          variant="saffron"
          size="sm"
          onClick={onAnswerQuestion}
          className="w-full text-xs font-bold"
        >
          <span>Answer questions to resolve</span>
          <ArrowRight size={14} />
        </Button>
      )}
    </GlassCard>
  );
}
