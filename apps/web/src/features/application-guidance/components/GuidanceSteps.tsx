import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SourceLink, InlineAlert } from "@/components/ui";
import type { Guidance } from "@/lib/api/contracts";

export interface GuidanceStepsProps {
  steps: Guidance["steps"];
  sources: Guidance["sources"];
}

export function GuidanceSteps({ steps, sources }: GuidanceStepsProps) {
  if (!steps.length) {
    return (
      <InlineAlert>
        Verified application steps are unavailable. Confirm the process with the government authority.
      </InlineAlert>
    );
  }

  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <GlassCard variant="standard" glow="emerald" className="panel p-6 sm:p-8 space-y-6">
      <div>
        <p className="eyebrow text-xs font-bold uppercase tracking-wider text-emerald-800">
          The official pathway
        </p>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          Application steps
        </h2>
      </div>

      <ol className="application-steps space-y-4" role="list">
        {sortedSteps.map((step) => {
          const source = sources.find((s) => s.id === step.source_id);

          return (
            <li
              key={step.step_number}
              className="p-4.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 flex items-start gap-4 transition-all duration-200 hover:bg-white"
            >
              <span className="step-number w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
                {step.step_number}
              </span>
              <div className="flex-1 space-y-2">
                <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                  {step.instruction}
                </p>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {source && (
                    <SourceLink url={source.official_url}>
                      {source.title}
                    </SourceLink>
                  )}
                  {step.official_url && (
                    <SourceLink url={step.official_url}>
                      Official step page
                    </SourceLink>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
