import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-cream/85 backdrop-blur-md text-slate-900 placeholder:text-slate-400 border border-slate-300/80 rounded-xl px-4 py-3 min-h-[46px] text-sm transition-all duration-200",
            "hover:border-emerald-500/50 hover:bg-cream",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 focus-visible:bg-cream focus-visible:shadow-[0_0_16px_rgba(3,83,82,0.15)]",
            "disabled:opacity-50 disabled:bg-slate-100/50 disabled:cursor-not-allowed",
            icon ? "pl-10" : "",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-cream/85 backdrop-blur-md text-slate-900 placeholder:text-slate-400 border border-slate-300/80 rounded-2xl p-4 min-h-[140px] text-sm transition-all duration-200 resize-y",
          "hover:border-emerald-500/50 hover:bg-cream",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 focus-visible:bg-cream focus-visible:shadow-[0_0_16px_rgba(3,83,82,0.15)]",
          "disabled:opacity-50 disabled:bg-slate-100/50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";
