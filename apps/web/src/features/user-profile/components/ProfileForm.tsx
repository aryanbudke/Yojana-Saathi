"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, TextArea, InlineAlert, Badge } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { isMock, errorMessage } from "@/lib/api";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";

export interface ProfileFormProps {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const m = useMessages();
  const t = m.profile;
  const p = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    if (!p.text.trim()) return;

    setBusy(true);
    setError("");
    try {
      await p.extract();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(errorMessage(err, m.errors));
      p.setReviewing(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard variant="standard" glow="emerald" className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t.title}
        </h2>
        <Badge tone="emerald">{t.badge}</Badge>
      </div>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {t.lead}
      </p>

      <form onSubmit={handleExtract} className="space-y-4">
        <label className="sr-only" htmlFor="profile-text">
          {t.textLabel}
        </label>

        <TextArea
          id="profile-text"
          maxLength={1000}
          placeholder={t.placeholder}
          value={p.text}
          onChange={(e) => p.setText(e.target.value)}
          aria-describedby="profile-privacy profile-counter"
        />

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <Button
            type="button"
            variant="quiet"
            onClick={() => p.setText(t.example)}
            className="text-xs py-1 px-2.5 h-auto min-h-0 text-emerald-800 font-semibold"
          >
            <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
            {t.tryExample}
          </Button>
          <span id="profile-counter" className="tabular-nums">
            {format(t.characters, { count: p.text.length })}
          </span>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            busy={busy}
            disabled={!p.text.trim() || busy}
          >
            <span>{busy ? t.reviewing : t.findMySchemes}</span>
            <ArrowRight size={17} />
          </Button>

          <Button
            type="button"
            variant="quiet"
            className="w-full text-slate-600 hover:text-slate-900"
            disabled={busy}
            onClick={() => {
              p.setReviewing(true);
              setError("");
            }}
          >
            <SlidersHorizontal size={15} />
            <span>{t.enterManually}</span>
          </Button>
        </div>

        {isMock && (
          <p className="text-xs text-slate-500 text-center pt-1">
            {t.mockNote}
          </p>
        )}

        <div id="profile-privacy" className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
          <ShieldCheck size={15} className="text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{t.privacy}</span>
        </div>
      </form>

      {error && !p.reviewing && (
        <div className="mt-4">
          <InlineAlert error>{error}</InlineAlert>
        </div>
      )}
    </GlassCard>
  );
}
