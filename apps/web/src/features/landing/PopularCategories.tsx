"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  House,
  Sprout,
  UsersRound,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const items = [
  {
    name: "Agriculture",
    value: "agriculture",
    icon: Sprout,
    circleBg: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Education",
    value: "education",
    icon: GraduationCap,
    circleBg: "bg-sky-100 text-sky-800",
  },
  {
    name: "Women",
    value: "women",
    icon: HeartHandshake,
    circleBg: "bg-rose-100 text-rose-800",
  },
  {
    name: "Senior Citizen",
    value: "senior_citizen",
    icon: UsersRound,
    circleBg: "bg-teal-100 text-teal-800",
  },
  {
    name: "Small Business",
    value: "entrepreneurship",
    icon: BriefcaseBusiness,
    circleBg: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Housing",
    value: "housing",
    icon: House,
    circleBg: "bg-amber-100 text-amber-900",
  },
];

export function PopularCategories() {
  return (
    <div className="my-14 sm:my-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 id="categories-title" className="text-2xl sm:text-3xl font-extrabold text-[#022c2b] tracking-tight">
            Explore scheme categories
          </h2>
          <p className="text-sm text-[#3d5654] mt-1">
            Browse by category to see relevant government schemes.
          </p>
        </div>
        <Link
          href="/discover#browse"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#035352] hover:text-[#024241] transition-colors shrink-0"
        >
          <span>View all schemes</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <section aria-label="Popular categories">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {items.map(({ name, value, icon: Icon, circleBg }) => (
          <Link
            key={value}
            href={`/discover?category=${value}#browse`}
            className="group block"
          >
            <GlassCard
              variant="standard"
              interactive
              className="p-4 sm:p-4.5 rounded-2xl bg-cream/90 border border-white/95 shadow-xs group-hover:border-[#035352]/30 transition-all flex items-center justify-between gap-2 h-full"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full ${circleBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#022c2b] truncate group-hover:text-[#035352] transition-colors">
                    {name}
                  </h3>
                  <p className="text-[11px] text-[#3d5654] truncate">
                    Schemes
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-slate-400 group-hover:text-[#035352] group-hover:translate-x-0.5 transition-all shrink-0"
                aria-hidden="true"
              />
            </GlassCard>
          </Link>
        ))}
      </div>
      </section>
    </div>
  );
}
