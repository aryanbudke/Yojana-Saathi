"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, TextArea, InlineAlert, Badge } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { example } from "@/features/profile/model";
import { isMock, errorMessage } from "@/lib/api";

export interface ProfileFormProps {
  onSuccess?: () => void;
  landing?: boolean;
}

export function ProfileForm({ onSuccess, landing = false }: ProfileFormProps) {
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
      setError(errorMessage(err));
      p.setReviewing(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard variant="standard" glow="emerald" className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {landing
            ? "Find schemes for your situation"
            : "Tell us about your situation"}
        </h2>
        <Badge tone="emerald">Your profile</Badge>
      </div>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {landing
          ? "Describe your situation in plain language. We’ll help find relevant schemes."
          : "You don’t need to know a scheme’s name. Just share a few details about yourself."}
      </p>

      <form onSubmit={handleExtract} className="space-y-4">
        <label className="sr-only" htmlFor="profile-text">
          Tell us about yourself
        </label>

        <TextArea
          id="profile-text"
          maxLength={1000}
          placeholder="I’m a farmer in Maharashtra looking for support for my family…"
          value={p.text}
          onChange={(e) => p.setText(e.target.value)}
          aria-describedby="profile-privacy profile-counter"
        />

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <Button
            type="button"
            variant="quiet"
            onClick={() => p.setText(example)}
            className="text-xs py-1 px-2.5 h-auto min-h-0 text-emerald-800 font-semibold"
          >
            <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
            Try an example
          </Button>
          <span id="profile-counter" className="tabular-nums">
            {p.text.length}/1000 characters
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
            <span>{busy ? "Reviewing your details…" : "Find my schemes"}</span>
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
            <span>Enter details manually</span>
          </Button>
        </div>

        {isMock && (
          <p className="text-xs text-slate-500 text-center pt-1">
            Mock extraction returns the sample farmer profile. Use manual entry for your own details.
          </p>
        )}

        <div id="profile-privacy" className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
          <ShieldCheck size={15} className="text-emerald-700 shrink-0" aria-hidden="true" />
          <span>Only share what’s needed. Never enter Aadhaar numbers.</span>
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
