import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "line" | "circle" | "button";
}

export function Skeleton({ className = "", variant = "card", ...props }: SkeletonProps) {
  if (variant === "line") {
    return (
      <div
        className={cn(
          "h-4 w-full rounded-md bg-slate-200/70 backdrop-blur-sm animate-pulse",
          className,
        )}
        role="status"
        aria-label="Loading content"
        {...props}
      />
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-slate-200/70 backdrop-blur-sm animate-pulse",
          className,
        )}
        role="status"
        aria-label="Loading content"
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/70 shadow-sm animate-pulse space-y-4",
        className,
      )}
      role="status"
      aria-label="Loading content"
      {...props}
    >
      <span className="sr-only">Loading…</span>
      <div className="h-4 w-28 rounded-md bg-slate-200/80" />
      <div className="h-6 w-3/4 rounded-lg bg-slate-200/90" />
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-200/70" />
        <div className="h-3.5 w-5/6 rounded bg-slate-200/70" />
      </div>
      <div className="flex gap-3 pt-2">
        <div className="h-9 w-28 rounded-xl bg-slate-200/80" />
        <div className="h-9 w-24 rounded-xl bg-slate-200/60" />
      </div>
    </div>
  );
}
