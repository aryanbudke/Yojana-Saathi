import React from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ExternalLink, Files, SearchCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const steps = [
  {
    step: "01",
    title: "Check eligibility",
    text: "Read the checked conditions and resolve any missing or unverified details.",
    icon: ClipboardCheck,
  },
  {
    step: "02",
    title: "Prepare documents",
    text: "Use the scheme’s personal checklist to prepare the documents its reviewed guidance lists.",
    icon: Files,
  },
  {
    step: "03",
    title: "Apply through the official portal",
    text: "Follow the verified application route. Some schemes require an office visit instead.",
    icon: ExternalLink,
  },
  {
    step: "04",
    title: "Track on the official portal",
    text: "Where tracking is available, keep your reference number and check with the responsible authority.",
    icon: SearchCheck,
  },
];

export function ApplicationGuidance() {
  return (
    <section className="my-14 sm:my-20" aria-labelledby="guidance-title">
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#035352] mb-2">
          APPLICATION ROADMAP
        </p>
        <h2 id="guidance-title" className="text-2xl sm:text-3xl font-extrabold text-[#022c2b] tracking-tight">
          Application guidance
        </h2>
        <p className="text-sm text-[#3d5654] mt-1">
          Four clear stages to prepare and submit your government scheme application.
        </p>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        {steps.map(({ step, title, text, icon: Icon }) => (
          <li key={title} className="flex flex-col list-none">
            <GlassCard
              variant="standard"
              interactive
              className="p-5 rounded-2xl bg-cream/85 border border-white/95 shadow-xs flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#e9dca4] text-[#035352] flex items-center justify-center">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-black text-[#035352]/70 tracking-wider">
                    {step}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-[#022c2b] tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[#3d5654] mt-1.5 leading-relaxed">
                  {text}
                </p>
              </div>
            </GlassCard>
          </li>
        ))}
      </ol>

      <div className="mt-6 p-4 rounded-2xl bg-cream/70 border border-[#022c2b]/08 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#3d5654]">
        <p>
          Yojana Saathi provides guidance and does not submit or approve government applications.
        </p>
        <Link
          className="inline-flex items-center gap-1 font-bold text-[#035352] hover:text-[#024241] shrink-0 transition-colors"
          href="/discover"
        >
          <span>Explore scheme guidance</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
