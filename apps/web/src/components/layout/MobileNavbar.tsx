"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Globe2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { cn } from "@/lib/utils";

export interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavbar({ isOpen, onClose }: MobileNavbarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover schemes" },
    { href: "/profile", label: "My Profile" },
    { href: "/recommendations", label: "Recommendations" },
    { href: "/saved", label: "Saved Schemes" },
    { href: "/help", label: "How it works" },
    { href: "/about", label: "About Yojana Saathi" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md md:hidden animate-reveal"
      onClick={onClose}
    >
      <div
        className="w-4/5 max-w-sm h-full bg-cream/95 backdrop-blur-2xl border-r border-white/80 p-6 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <Brand />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1.5" aria-label="Mobile navigation">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center justify-between",
                    active
                      ? "bg-emerald-100 text-emerald-950 font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-950",
                  )}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe2 size={16} className="text-emerald-600" />
            <span>Language: English (India)</span>
          </div>
          <Link
            href="/discover"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold shadow-md shadow-emerald-700/20"
          >
            Find my schemes
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
