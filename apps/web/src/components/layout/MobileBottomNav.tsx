"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, User, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/recommendations", label: "Matches", icon: Sparkles },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-cream/85 backdrop-blur-2xl border border-white/90 shadow-[0_8px_32px_rgba(16,80,50,0.15)] rounded-2xl px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile quick dock"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[54px]",
              active
                ? "text-emerald-700 font-bold scale-105"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-colors",
                active && "bg-emerald-100 text-emerald-800 shadow-xs",
              )}
            >
              <Icon size={19} aria-hidden="true" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
