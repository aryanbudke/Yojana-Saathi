import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const sources = [
  {
    name: "Ministry of Agriculture & Farmers Welfare",
    url: "https://agricoop.gov.in/",
    type: "emblem",
  },
  {
    name: "Ministry of Education",
    url: "https://www.education.gov.in/",
    type: "emblem",
  },
  {
    name: "Ministry of Rural Development",
    url: "https://rural.gov.in/",
    type: "emblem",
  },
  {
    name: "National Portal of India",
    subtitle: "Government of India",
    url: "https://www.india.gov.in/",
    type: "gov",
  },
];

export function TrustedSources() {
  return (
    <div className="my-14 sm:my-20">
      <section aria-label="Trusted official sources">
        <div className="mb-8">
          <h2 id="sources-title" className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tracking-tight">
            Trusted official sources
          </h2>
          <p className="text-sm text-[#68736D] mt-1">
            All scheme information is sourced from official government portals.
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
              className="p-4 sm:p-4.5 rounded-2xl bg-white/90 border border-white/95 shadow-xs group-hover:border-[#165541]/30 transition-all flex items-center justify-between gap-3 h-full"
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
                  <h3 className="text-xs sm:text-[13px] font-bold text-[#17211D] leading-snug group-hover:text-[#165541] transition-colors line-clamp-2">
                    {name}
                  </h3>
                  {subtitle && (
                    <p className="text-[10px] text-[#68736D] truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <ExternalLink
                size={14}
                className="text-slate-400 group-hover:text-[#165541] transition-colors shrink-0"
                aria-hidden="true"
              />
            </GlassCard>
          </a>
        ))}
        </div>
      </section>

      {/* Bottom guidance callout strip */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#E7EDE7]/70 border border-[#D2DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#165541]/12 text-[#165541] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#17211D]">
              We help you prepare. We don’t submit, approve or track applications on your behalf.
            </p>
            <p className="text-xs text-[#3D4741] mt-0.5">
              Follow official procedures and use the provided links to complete your application.
            </p>
          </div>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-xs font-bold text-[#165541] border border-[#17211D]/10 shadow-2xs shrink-0 self-start sm:self-auto transition-colors"
        >
          <span>Explore scheme guidance</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
