import React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ambientGlow?: boolean;
}

export function PageContainer({
  children,
  className = "",
  ambientGlow = true,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("relative min-h-[calc(100vh-140px)] w-full", className)} {...props}>
      {ambientGlow && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          {/* Subtle Sage Mist wash at top */}
          <div className="absolute -top-32 left-1/4 w-[700px] h-[500px] rounded-full bg-[#E7EDE7]/60 blur-[120px]" />
          {/* Subtle warm champagne accent top-right */}
          <div className="absolute top-10 right-0 w-[500px] h-[450px] rounded-full bg-[#D8C5A1]/20 blur-[100px]" />
        </div>
      )}
      {children}
    </div>
  );
}
