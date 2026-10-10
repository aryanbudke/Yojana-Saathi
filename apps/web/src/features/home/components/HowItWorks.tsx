import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { format } from "@/i18n/config";
import { getMessages } from "@/i18n/server";

export async function HowItWorks() {
  const m = await getMessages();
  const t = m.home.how;
  return (
    <section id="how-it-works" className="my-14 sm:my-20 scroll-mt-24" aria-labelledby="how-title">
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#035352] mb-2">
          {t.eyebrow}
        </p>
        <h2 id="how-title" className="text-3xl sm:text-4xl font-extrabold text-[#022c2b] tracking-tight">
          {t.title}
        </h2>
        <p className="text-[#3d5654] text-base mt-1.5">
          {t.lead}
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 list-none p-0 m-0 relative">
        {/* Step 1 */}
        <li className="flex flex-col list-none">
          <GlassCard
            variant="standard"
            interactive
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-cream/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#e9dca4] text-[#035352] text-xs font-black flex items-center justify-center">
                  1
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#e9dca4]/60 text-[#035352] flex items-center justify-center">
                  <MessageSquareText size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#022c2b] tracking-tight">
                {t.step1Title}
                <span className="sr-only">{t.step1SrHint}</span>
              </h3>
              <p className="text-[#3d5654] text-sm mt-2 leading-relaxed">
                {t.step1Text}
              </p>

              <div className="my-4 p-3 rounded-xl bg-[#f3e8bc] border border-[#022c2b]/06">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                  {t.forExample}
                </span>
                <blockquote className="text-xs font-medium text-[#022c2b] italic line-clamp-2">
                  “{m.profile.example}”
                </blockquote>
              </div>
            </div>

            <div className="pt-3 border-t border-[#022c2b]/06 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#035352]">{format(t.step, { n: "01" })}</span>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#035352] hover:text-[#024241] transition-colors"
              >
                <span>{t.step1Link}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </GlassCard>
        </li>

        {/* Step 2 */}
        <li className="flex flex-col list-none">
          <GlassCard
            variant="standard"
            interactive
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-cream/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#e9dca4] text-[#035352] text-xs font-black flex items-center justify-center">
                  2
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#e9dca4]/60 text-[#035352] flex items-center justify-center">
                  <ScanSearch size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#022c2b] tracking-tight">
                {t.step2Title}
              </h3>
              <p className="text-[#3d5654] text-sm mt-2 leading-relaxed">
                {t.step2Text}
              </p>
            </div>

            <div className="pt-3 border-t border-[#022c2b]/06 flex items-center justify-between mt-6">
              <span className="text-[11px] font-bold text-[#035352]">{format(t.step, { n: "02" })}</span>
              <span className="text-[11px] font-medium text-[#3d5654]">{t.step2Tag}</span>
            </div>
          </GlassCard>
        </li>

        {/* Step 3 */}
        <li className="flex flex-col list-none">
          <GlassCard
            variant="standard"
            interactive
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-cream/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#e9dca4] text-[#035352] text-xs font-black flex items-center justify-center">
                  3
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#e9dca4]/60 text-[#035352] flex items-center justify-center">
                  <ClipboardList size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#022c2b] tracking-tight">
                {t.step3Title}
              </h3>
              <p className="text-[#3d5654] text-sm mt-2 leading-relaxed">
                {t.step3Text}
              </p>
            </div>

            <div className="pt-3 border-t border-[#022c2b]/06 flex items-center justify-between mt-6">
              <span className="text-[11px] font-bold text-[#035352]">{format(t.step, { n: "03" })}</span>
              <span className="text-[11px] font-medium text-[#3d5654]">{t.step3Tag}</span>
            </div>
          </GlassCard>
        </li>
      </ol>
    </section>
  );
}
