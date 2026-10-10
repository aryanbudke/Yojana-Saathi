export { AppHeader } from "@/components/AppHeader";
export { Button } from "./Button";
export { GlassCard } from "./GlassCard";
export { Badge } from "./Badge";
export { Input, TextArea } from "./Input";
export { Select } from "./Select";
export { Modal } from "./Modal";
export { Skeleton } from "./Skeleton";
export { SignIn1, SignUp1 } from "./modern-stunning-sign-in";
export type { AuthFormValues } from "./modern-stunning-sign-in";
export { safeOfficialUrl } from "@/lib/urls";
export { SourceLink, Disclaimer } from "./text";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <GlassCard className={className}>{children}</GlassCard>;
}

export function InlineAlert({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`alert ${error ? "error" : ""} rounded-2xl backdrop-blur-md`}
      role={error ? "alert" : "status"}
    >
      <Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="section-description text-slate-600 text-sm mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty rounded-3xl p-8 sm:p-12 text-center bg-cream/60 backdrop-blur-md border border-slate-200/80">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <div className="empty-content text-slate-600 text-sm max-w-md mx-auto space-y-4">
        {children}
      </div>
    </div>
  );
}
