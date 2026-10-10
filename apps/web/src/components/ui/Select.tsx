import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none bg-cream/85 backdrop-blur-md text-slate-900 border border-slate-300/80 rounded-xl px-4 py-3 pr-10 min-h-[46px] text-sm transition-all duration-200 cursor-pointer",
            "hover:border-emerald-500/50 hover:bg-cream",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 focus-visible:bg-cream focus-visible:shadow-[0_0_16px_rgba(3,83,82,0.15)]",
            "disabled:opacity-50 disabled:bg-slate-100/50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
