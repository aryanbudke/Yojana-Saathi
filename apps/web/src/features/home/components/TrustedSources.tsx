import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getMessages } from "@/i18n/server";

export async function TrustedSources() {
  const m = await getMessages();
  const t = m.home.sources;
  const sources = [
    { name: t.agriculture, url: "https://agricoop.gov.in/", type: "emblem" },
    { name: t.education, url: "https://www.education.gov.in/", type: "emblem" },
    { name: t.rural, url: "https://rural.gov.in/", type: "emblem" },
    {
      name: t.nationalPortal,
      subtitle: t.governmentOfIndia,
      url: "https://www.india.gov.in/",
      type: "gov",
    },
  ];
  return (
    <div className="my-14 sm:my-20">
      <section aria-label={t.title}>
        <div className="mb-8">
          <h2 id="sources-title" className="text-2xl sm:text-3xl font-extrabold text-[#022c2b] tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm text-[#3d5654] mt-1">
            {t.lead}
          </p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map(({ name, subtitle, url, type }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <GlassCard
              variant="standard"
              interactive
              className="p-4 sm:p-4.5 rounded-2xl bg-cream/90 border border-white/95 shadow-xs group-hover:border-[#035352]/30 transition-all flex items-center justify-between gap-3 h-full"
            >
              <div className="flex items-center gap-3 min-w-0">
                {type === "emblem" ? (
                  <div className="w-8 h-9 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/emblem.png"
                      alt=""
                      className="h-8 w-auto object-contain"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-8 shrink-0 flex items-center justify-center bg-slate-50 rounded px-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/india-gov-logo.png"
                      alt=""
                      className="h-6 w-auto object-contain"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-[#022c2b] leading-snug group-hover:text-[#035352] transition-colors line-clamp-2">
                    {name}
                  </h3>
                  {subtitle && (
                    <p className="text-[10px] text-[#3d5654] truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <ExternalLink
                size={14}
                className="text-slate-400 group-hover:text-[#035352] transition-colors shrink-0"
                aria-hidden="true"
              />
            </GlassCard>
          </a>
        ))}
        </div>
      </section>

      {/* Bottom guidance callout strip */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#e9dca4]/70 border border-[#d8c98a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#035352]/12 text-[#035352] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#022c2b]">
              {t.calloutTitle}
            </p>
            <p className="text-xs text-[#3D4741] mt-0.5">
              {t.calloutText}
            </p>
          </div>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream hover:bg-slate-50 text-xs font-bold text-[#035352] border border-[#022c2b]/10 shadow-2xs shrink-0 self-start sm:self-auto transition-colors"
        >
          <span>{t.calloutLink}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
