import React from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ExternalLink, Files, SearchCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getMessages } from "@/i18n/server";

const icons = [ClipboardCheck, Files, ExternalLink, SearchCheck];

export async function ApplicationGuidance() {
  const m = await getMessages();
  const t = m.home.guidance;
  const steps = t.steps.map((item, i) => ({
    ...item,
    step: String(i + 1).padStart(2, "0"),
    icon: icons[i],
  }));
  return (
    <section className="my-14 sm:my-20" aria-labelledby="guidance-title">
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#035352] mb-2">
          {t.eyebrow}
        </p>
        <h2 id="guidance-title" className="text-2xl sm:text-3xl font-extrabold text-[#022c2b] tracking-tight">
          {t.title}
        </h2>
        <p className="text-sm text-[#3d5654] mt-1">
          {t.lead}
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
          {t.note}
        </p>
        <Link
          className="inline-flex items-center gap-1 font-bold text-[#035352] hover:text-[#024241] shrink-0 transition-colors"
          href="/discover"
        >
          <span>{t.link}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
