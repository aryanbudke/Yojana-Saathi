import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui";
import { getMessages } from "@/i18n/server";

export default async function NotFound() {
  const m = await getMessages();
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <GlassCard variant="elevated" glow="emerald" className="max-w-md w-full p-8 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center shadow-xs">
          <Compass size={32} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mt-1">{m.notFound.title}</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {m.notFound.text}
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" className="w-full">
              <ArrowLeft size={16} />
              <span>{m.notFound.home}</span>
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
