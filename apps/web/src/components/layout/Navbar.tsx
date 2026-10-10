"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Globe2, Menu, X, Sparkles } from "lucide-react";
import { Brand } from "@/components/Brand";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  isActive: (path: string) => boolean;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", isActive: (p) => p === "/" },
  {
    href: "/discover",
    label: "Discover schemes",
    isActive: (p) =>
      p.startsWith("/discover") ||
      p.startsWith("/schemes") ||
      p.startsWith("/recommendations"),
  },
  {
    href: "/help",
    label: "How it works",
    isActive: (p) => p === "/help",
  },
  { href: "/about", label: "About", isActive: (p) => p === "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setMobileOpen(false);

  return (
    <header
      className="header sticky top-0 z-40 w-full transition-all duration-200 border-b border-[#022c2b]/08 bg-[#f3e8bc]/85 backdrop-blur-xl shadow-xs"
      onKeyDown={(event) => {
        if (event.key === "Escape" && mobileOpen) {
          setMobileOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link
          className="brand flex items-center gap-3 text-[#022c2b] hover:opacity-90 transition-opacity"
          href="/"
          aria-label="yojana saathi home"
          onClick={close}
        >
          <Brand />
        </Link>

        {/* Desktop Nav */}
        <nav
          id="main-navigation"
          className={cn(
            "hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-cream/90 backdrop-blur-md border border-[#022c2b]/08 shadow-xs",
            mobileOpen && "is-open flex flex-col md:flex-row absolute md:static top-full left-0 right-0 p-5 md:p-1 bg-cream md:bg-cream/90 border-b md:border-b-0 border-[#022c2b]/10 shadow-xl md:shadow-xs",
          )}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = link.isActive(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={close}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 relative",
                  active
                    ? "text-[#022c2b] bg-[#e9dca4] font-bold shadow-2xs"
                    : "text-[#3d5654] hover:text-[#022c2b] hover:bg-slate-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            className="button primary nav-cta-mobile md:hidden mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#035352] hover:bg-[#024241] text-white font-semibold shadow-sm"
            href="/discover"
            onClick={close}
          >
            Find my schemes
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions flex items-center gap-3">
          <span
            className="header-language hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-cream/90 text-[#022c2b] border border-[#022c2b]/10 shadow-2xs"
            aria-label="Current language: English"
          >
            <Globe2 size={14} className="text-[#035352]" aria-hidden="true" />
            English
            <span className="text-[10px] text-slate-400">▾</span>
          </span>
          <Link
            className="button primary header-cta inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#035352] hover:bg-[#024241] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            href="/discover"
          >
            <Sparkles size={14} className="text-[#D8C5A1]" aria-hidden="true" />
            <span>Find my schemes</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            ref={triggerRef}
            className="menu-toggle md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="main-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
