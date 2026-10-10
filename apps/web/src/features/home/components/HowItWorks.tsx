import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { example } from "@/features/profile/model";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="my-14 sm:my-20 scroll-mt-24" aria-labelledby="how-title">
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#165541] mb-2">
          A CLEARER NEXT STEP
        </p>
        <h2 id="how-title" className="text-3xl sm:text-4xl font-extrabold text-[#17211D] tracking-tight">
          How it works
        </h2>
        <p className="text-[#68736D] text-base mt-1.5">
          From your situation to the right opportunities, in three simple steps.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 list-none p-0 m-0 relative">
        {/* Step 1 */}
        <li className="flex flex-col list-none">
          <GlassCard
            variant="standard"
            interactive
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#E7EDE7] text-[#165541] text-xs font-black flex items-center justify-center">
                  1
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E7EDE7]/60 text-[#165541] flex items-center justify-center">
                  <MessageSquareText size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#17211D] tracking-tight">
                Tell us about your situation
                <span className="sr-only"> (Share your needs)</span>
              </h3>
              <p className="text-[#68736D] text-sm mt-2 leading-relaxed">
                Describe your background, needs and goals in plain language.
              </p>

              <div className="my-4 p-3 rounded-xl bg-[#F7F5F0] border border-[#17211D]/06">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                  For example
                </span>
                <blockquote className="text-xs font-medium text-[#17211D] italic line-clamp-2">
                  “{example}”
                </blockquote>
              </div>
            </div>

            <div className="pt-3 border-t border-[#17211D]/06 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#165541]">Step 01</span>
              <Link
                href="#finder"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#165541] hover:text-[#0e3d2e] transition-colors"
              >
                <span>Describe your situation</span>
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
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#E7EDE7] text-[#165541] text-xs font-black flex items-center justify-center">
                  2
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E7EDE7]/60 text-[#165541] flex items-center justify-center">
                  <ScanSearch size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#17211D] tracking-tight">
                Get a personalised match
              </h3>
              <p className="text-[#68736D] text-sm mt-2 leading-relaxed">
                We find relevant schemes and show key details for your review.
              </p>
            </div>

            <div className="pt-3 border-t border-[#17211D]/06 flex items-center justify-between mt-6">
              <span className="text-[11px] font-bold text-[#165541]">Step 02</span>
              <span className="text-[11px] font-medium text-[#68736D]">AI + Rule checks</span>
            </div>
          </GlassCard>
        </li>

        {/* Step 3 */}
        <li className="flex flex-col list-none">
          <GlassCard
            variant="standard"
            interactive
            className="h-full p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#E7EDE7] text-[#165541] text-xs font-black flex items-center justify-center">
                  3
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E7EDE7]/60 text-[#165541] flex items-center justify-center">
                  <ClipboardList size={16} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#17211D] tracking-tight">
                Take the next step
              </h3>
              <p className="text-[#68736D] text-sm mt-2 leading-relaxed">
                Follow official links and prepare your application with confidence.
              </p>
            </div>

            <div className="pt-3 border-t border-[#17211D]/06 flex items-center justify-between mt-6">
              <span className="text-[11px] font-bold text-[#165541]">Step 03</span>
              <span className="text-[11px] font-medium text-[#68736D]">Official links &amp; checklist</span>
            </div>
          </GlassCard>
        </li>
      </ol>
    </section>
  );
}
