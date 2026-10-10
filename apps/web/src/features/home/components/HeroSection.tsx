import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SchemeShowcase } from "./SchemeShowcase";
import { heroValueProps } from "@/features/landing/content";

export function HeroSection() {
  return (
    <section className="relative pt-2 sm:pt-4 pb-10 lg:pb-16" aria-labelledby="hero-title">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-0 w-80 h-80 rounded-full bg-teal-400/18 blur-[90px] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Copy */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#165541]">
            <span>GOVERNMENT SCHEMES, MADE SIMPLE</span>
          </div>

          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-[#17211D] leading-[1.12]"
          >
            The support you deserve is{" "}
            <span className="text-[#165541]">closer</span>
            <br />
            <span className="text-[#165541]">than you</span>{" "}
            <span className="text-[#8A6020]">think.</span>
          </h1>

          <p className="text-base sm:text-[17px] text-[#3D4B44] max-w-xl leading-relaxed">
            Discover government schemes that match your situation, understand
            eligibility rules clearly, and take the right next step — all in one simple,
            independent place.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <Link
              className="button primary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#165541] hover:bg-[#0e3d2e] text-white font-bold text-base shadow-md shadow-[#165541]/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
              href="#finder"
            >
              <span>Find my schemes</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              className="button secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#17211D] font-semibold text-base border border-[#17211D]/15 shadow-xs transition-all hover:-translate-y-0.5"
              href="/discover"
            >
              Explore catalogue
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm font-semibold text-[#17211D]">
            {heroValueProps.map((prop) => (
              <li
                key={prop}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#17211D]"
              >
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E7EDE7] text-[#165541] shrink-0">
                  <Check size={11} strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{prop}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Showcase */}
        <div className="lg:col-span-6 xl:col-span-5 relative">
          <SchemeShowcase />
        </div>
      </div>
    </section>
  );
}
