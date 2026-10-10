import React from "react";
import { Landmark, ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SourceLink } from "@/components/ui";
import { showcaseSchemes } from "@/features/landing/content";
import { cn } from "@/lib/utils";

export function SchemeShowcase() {
  const offsets = ["", "sm:ml-2 lg:ml-3", "sm:ml-4 lg:ml-6"];

  return (
    <div
      className="relative w-full max-w-lg mx-auto lg:max-w-none pt-6 sm:pt-8 overflow-hidden sm:overflow-visible"
      aria-label="Example schemes"
    >
      {/* Background Indian Landmark Architecture */}
      <div className="absolute top-0 right-0 w-[220px] sm:w-[260px] h-[330px] rounded-3xl overflow-hidden pointer-events-none -z-10 shadow-sm opacity-90 sm:opacity-95">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-landmark-clean.jpg"
          alt=""
          className="w-full h-full object-cover object-top"
          aria-hidden="true"
        />
        {/* Soft edge blend into porcelain canvas */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F5F0] via-[#F7F5F0]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] via-transparent to-transparent" />
      </div>

      {/* Script note with arrow */}
      <div className="absolute top-0 right-4 sm:right-10 z-10 hidden sm:block pointer-events-none select-none">
        <span className="font-serif italic text-base sm:text-lg text-[#102A24] tracking-wide rotate-[-3deg] inline-block font-semibold">
          Real schemes. Real opportunities.
        </span>
        <svg
          className="w-5 h-5 text-[#102A24]/70 ml-10 -mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M4 4c2 7 7 11 11 13m0 0l-3-1m3 1l-1-3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* 3 Cascading Glass Cards */}
      <div className="space-y-3 relative z-10">
        {showcaseSchemes.map((scheme, index) => {
          const glowTypes: Array<"emerald" | "cyan" | "saffron"> = [
            "emerald",
            "cyan",
            "saffron",
          ];
          const glow = glowTypes[index % glowTypes.length];
          const offsetClass = offsets[index] ?? "";

          return (
            <GlassCard
              key={scheme.shortName}
              variant="elevated"
              glow={glow}
              interactive
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border border-white/95 bg-white/92 shadow-[0_12px_28px_-4px_rgba(16,42,36,0.08)]",
                offsetClass,
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-full">
                    Example scheme
                  </span>
                  <Badge tone={glow}>{scheme.category}</Badge>
                </div>
                <SourceLink url={scheme.officialUrl}>
                  Official portal
                </SourceLink>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-[#17211D] tracking-tight group-hover:text-[#165541] transition-colors flex items-center gap-1">
                  <span>{scheme.shortName}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-slate-400 group-hover:text-[#165541] transition-colors"
                    aria-hidden="true"
                  />
                </h3>
              </div>

              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {scheme.fullName}
              </p>

              <p className="text-[11px] font-semibold text-[#165541] flex items-center gap-1 mt-1 truncate">
                <Landmark size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{scheme.authority}</span>
              </p>

              <p className="text-xs text-slate-700 mt-1 leading-relaxed line-clamp-1">
                {scheme.purpose}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
