import React from "react";
import { BookmarkCheck, FileText, ShieldCheck, UsersRound } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getMessages } from "@/i18n/server";

const icons = [FileText, UsersRound, BookmarkCheck, ShieldCheck];

export async function BenefitsStrip() {
  const m = await getMessages();
  const valueProps = m.home.benefits.items.map((item, i) => ({
    ...item,
    icon: icons[i],
  }));

  return (
    <section className="my-10 sm:my-14" aria-labelledby="benefits-title">
      <h2 id="benefits-title" className="sr-only">
        {m.home.benefits.title}
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
