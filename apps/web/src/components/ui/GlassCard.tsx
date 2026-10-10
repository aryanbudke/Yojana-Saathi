import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "elevated" | "subtle" | "ghost";
  glow?: "emerald" | "saffron" | "cyan" | "indigo" | "none";
  interactive?: boolean;
  as?: React.ElementType;
}

export function GlassCard({
  children,
  className = "",
  variant = "standard",
  glow = "none",
  interactive = false,
  as: Component = "div",
  ...props
}: GlassCardProps) {
  const variantStyles = {
    standard:
      "bg-cream/80 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_-4px_rgba(2,44,43,0.06),0_4px_12px_-2px_rgba(2,44,43,0.03)]",
    elevated:
      "bg-cream/92 backdrop-blur-2xl border border-white shadow-[0_20px_48px_-6px_rgba(2,44,43,0.08),0_8px_20px_-3px_rgba(2,44,43,0.04)]",
    subtle:
      "bg-[#e9dca4]/50 backdrop-blur-md border border-[#e9dca4]/80 shadow-xs",
    ghost:
      "bg-cream/40 backdrop-blur-sm border border-white/60",
  };

  const glowStyles = {
    none: "",
    emerald:
      "hover:border-[#035352]/40 hover:shadow-[0_16px_36px_-6px_rgba(3,83,82,0.18)]",
    saffron:
      "hover:border-[#7d5a2a]/40 hover:shadow-[0_16px_36px_-6px_rgba(182,138,69,0.18)]",
    cyan:
      "hover:border-[#204f4a]/40 hover:shadow-[0_16px_36px_-6px_rgba(32,79,74,0.18)]",
    indigo:
      "hover:border-[#035352]/40 hover:shadow-[0_16px_36px_-6px_rgba(3,83,82,0.18)]",
  };

  return (
    <Component
      className={cn(
        "relative rounded-3xl p-6 transition-all duration-200",
        // Top specular reflection highlight
        "before:absolute before:inset-x-6 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent before:pointer-events-none",
        variantStyles[variant],
        glow !== "none" && glowStyles[glow],
        interactive && "hover:-translate-y-1 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
