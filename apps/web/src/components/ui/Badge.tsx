import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "saffron" | "emerald" | string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  className = "",
  tone = "neutral",
  size = "md",
  ...props
}: BadgeProps) {
  const toneClasses: Record<string, string> = {
    neutral:
      "bg-cream/80 text-[#022c2b] border-[#022c2b]/10 shadow-xs",
    success:
      "bg-[#035352]/12 text-[#035352] border-[#035352]/25 shadow-xs",
    emerald:
      "bg-[#035352]/12 text-[#035352] border-[#035352]/25 shadow-xs",
    warning:
      "bg-[#7d5a2a]/15 text-[#644723] border-[#7d5a2a]/30 shadow-xs",
    saffron:
      "bg-[#7d5a2a]/15 text-[#644723] border-[#7d5a2a]/30 shadow-xs",
    gold:
      "bg-[#7d5a2a]/15 text-[#644723] border-[#7d5a2a]/30 shadow-xs",
    danger:
      "bg-rose-100/90 text-rose-950 border-rose-300/80 shadow-xs",
    info:
      "bg-[#204f4a]/10 text-[#204f4a] border-[#204f4a]/25 shadow-xs",
    cyan:
      "bg-[#204f4a]/10 text-[#204f4a] border-[#204f4a]/25 shadow-xs",
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const selectedTone = toneClasses[tone] ?? toneClasses.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border backdrop-blur-md transition-colors leading-relaxed",
        sizeClasses[size],
        selectedTone,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
