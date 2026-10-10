import React from "react";
import { BookmarkCheck, FileText, ShieldCheck, UsersRound } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function BenefitsStrip() {
  const valueProps = [
    {
      icon: FileText,
      title: "Find schemes for your situation",
      text: "Describe your situation in plain language and get relevant schemes.",
    },
    {
      icon: UsersRound,
      title: "Clear eligibility guidance",
      text: "Understand who can apply and what conditions apply.",
    },
    {
      icon: BookmarkCheck,
      title: "Official and trusted sources",
      text: "Direct links to government portals and official information.",
    },
    {
      icon: ShieldCheck,
      title: "Independent and unbiased",
      text: "We help you discover and prepare. We don't submit applications.",
    },
  ];

  return (
    <section className="my-10 sm:my-14" aria-labelledby="benefits-title">
      <h2 id="benefits-title" className="sr-only">
        What yojana saathi helps with
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {valueProps.map(({ icon: Icon, title, text }) => (
          <GlassCard
            key={title}
            variant="standard"
            interactive
            className="p-5 rounded-2xl bg-cream/80 backdrop-blur-md border border-white/90 shadow-xs hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#e9dca4] text-[#035352] flex items-center justify-center mb-3.5">
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="text-[15px] font-bold text-[#022c2b] tracking-tight leading-snug">
                {title}
              </p>
              <p className="text-xs text-[#3d5654] mt-1.5 leading-relaxed">
                {text}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
