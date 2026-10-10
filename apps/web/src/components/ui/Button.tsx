import React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet" | "saffron" | "danger" | "cyan";
  size?: "sm" | "md" | "lg";
  busy?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  busy = false,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg min-h-[36px]",
    md: "px-5 py-2.5 text-sm rounded-xl min-h-[46px]",
    lg: "px-7 py-3.5 text-base rounded-2xl min-h-[54px] font-semibold",
  };

  const variantClasses = {
    primary:
      "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border border-transparent",
    secondary:
      "bg-cream/80 backdrop-blur-md text-slate-800 border border-white/90 shadow-sm hover:bg-cream hover:border-emerald-500/40 hover:shadow-md hover:text-emerald-900 hover:-translate-y-0.5 active:translate-y-0",
    quiet:
      "bg-transparent text-emerald-800 hover:bg-emerald-50/70 hover:text-emerald-950 border border-transparent hover:border-emerald-200/50",
    saffron:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-600/25 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 border border-amber-300/40",
    danger:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
    cyan:
      "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/25 hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 border border-cyan-400/30",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none select-none",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || busy}
      aria-busy={busy}
      {...props}
    >
      {busy && <LoaderCircle size={18} className="animate-spin text-current" aria-hidden="true" />}
      {children}
    </button>
  );
}
