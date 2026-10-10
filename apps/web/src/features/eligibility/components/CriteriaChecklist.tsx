"use client";
import React from "react";
import { Check, X, HelpCircle, FileQuestion } from "lucide-react";
import { SourceLink } from "@/components/ui";
import type { RuleOutcome, SourceReference } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { cn } from "@/lib/utils";

const ruleIcons = {
  pass: Check,
  fail: X,
  unknown: HelpCircle,
  manual_review: FileQuestion,
};

const ruleStyles = {
  pass: {
    container: "bg-emerald-50/80 border-emerald-200/80 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-800",
    icon: "text-emerald-700",
  },
  fail: {
    container: "bg-rose-50/80 border-rose-200/80 text-rose-950",
    badge: "bg-rose-100 text-rose-800",
    icon: "text-rose-700",
  },
  unknown: {
    container: "bg-amber-50/80 border-amber-200/80 text-amber-950",
    badge: "bg-amber-100 text-amber-900",
    icon: "text-amber-700",
  },
  manual_review: {
    container: "bg-sky-50/80 border-sky-200/80 text-sky-950",
    badge: "bg-sky-100 text-sky-900",
    icon: "text-sky-700",
  },
};

export interface CriteriaChecklistProps {
  rules: RuleOutcome[];
  sources?: SourceReference[];
}

export function CriteriaChecklist({ rules, sources = [] }: CriteriaChecklistProps) {
  const m = useMessages();
  if (!rules.length) return null;

  return (
    <ul className="rule-list space-y-3" role="list">
      {rules.map((rule) => {
        const Icon = ruleIcons[rule.result] ?? HelpCircle;
        const style = ruleStyles[rule.result] ?? ruleStyles.unknown;
        const source = sources.find((s) => s.id === rule.source_id);

        return (
          <li
            key={rule.rule_key}
            className={cn(
              "rule-row p-3.5 rounded-2xl border backdrop-blur-sm flex items-start gap-3 text-xs sm:text-sm",
              style.container,
            )}
          >
            <span
              className={cn(
                "rule-icon p-1.5 rounded-xl shrink-0 mt-0.5",
                style.badge,
              )}
            >
              <Icon size={15} aria-hidden="true" />
            </span>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  {m.ruleResults[rule.result]}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {rule.rule_key}
                </span>
              </div>

              <p className="font-medium leading-relaxed">{rule.reason}</p>

              {source ? (
                <div className="pt-1 flex items-center gap-2 text-xs flex-wrap">
                  <SourceLink url={source.official_url}>
                    {source.title}
                  </SourceLink>
                  <span className="citation-locator text-[11px] text-slate-500">
                    · {source.excerpt_locator}
                  </span>
                </div>
              ) : (
                <span className="source-unavailable text-[11px] text-slate-500">
                  {format(m.match.sourceCitation, { id: rule.source_id })}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
