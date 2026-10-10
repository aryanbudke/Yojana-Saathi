"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, Input, Select, Badge, InlineAlert } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { fields, states } from "@/features/profile/types";
import { fieldValue } from "@/features/profile/model";
import { errorMessage } from "@/lib/api";

export interface ProfileEditorProps {
  onConfirmed?: () => void;
}

export function ProfileEditor({ onConfirmed }: ProfileEditorProps) {
  const p = useProfile();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState<"confirm" | "clear" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy("confirm");
    setError("");
    try {
      await p.confirm();
      if (onConfirmed) onConfirmed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleClear() {
    setBusy("clear");
    setError("");
    try {
      await p.clear();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const providedCount = fields.filter((f) => p.draft.facts[f.key] !== null).length;
  const unknownCount = fields.filter((f) => p.draft.facts[f.key] === null).length;

  return (
    <GlassCard
      variant="elevated"
      glow="emerald"
      className="profile-review p-6 sm:p-8 space-y-6"
      aria-labelledby="review-heading"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200/70">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            02 / CHECK YOUR DETAILS
          </p>
          <h2
            id="review-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-slate-900 tracking-tight outline-none"
          >
            Check your details
          </h2>
        </div>
        <Badge tone={p.confirmed ? "success" : "warning"}>
          {p.confirmed ? "Confirmed by you" : "Needs your review"}
        </Badge>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        Correct anything that doesn’t look right. Blank fields stay unknown; nothing is assumed.
      </p>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 py-2 px-3.5 rounded-xl bg-slate-100/70 w-fit" aria-live="polite">
        <span className="text-emerald-800">{providedCount} details provided</span>
        <span>•</span>
        <span className="text-amber-800">{unknownCount} still unknown</span>
      </div>

      <form onSubmit={handleConfirm} className="space-y-6">
        <fieldset
          className="profile-edit-fields space-y-5"
          disabled={busy !== null}
        >
          <legend className="sr-only">Review your profile facts</legend>

          <div className="profile-fields grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {fields.map((f) => {
              const v = p.draft.facts[f.key];
              const id = `fact-${f.key}`;
              const isUserOrigin = p.draft.origins[f.key] === "user";

              return (
                <div key={f.key} className="space-y-1.5 field">
                  <label htmlFor={id} className="block text-xs font-bold text-slate-700">
                    {f.label}
                  </label>

                  {f.kind === "state" || f.kind === "choice" || f.kind === "boolean" ? (
                    <Select
                      id={id}
                      aria-describedby={`${id}-origin`}
                      value={
                        v === null
                          ? ""
                          : typeof v === "boolean"
                            ? v ? "yes" : "no"
                            : String(v)
                      }
                      onChange={(e) =>
                        p.edit(f.key, fieldValue(f.kind, e.target.value))
                      }
                    >
                      <option value="">Unknown</option>
                      {f.kind === "state" ? (
                        states.map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                          {f.kind === "choice" && <option value="not_sure">Not sure</option>}
                        </>
                      )}
                    </Select>
                  ) : (
                    <Input
                      id={id}
                      aria-describedby={`${id}-origin`}
                      type={f.kind === "number" ? "number" : "text"}
                      min={f.kind === "number" ? 0 : undefined}
                      max={f.max}
                      maxLength={
                        f.key === "occupation"
                          ? 120
                          : f.key === "gender"
                            ? 40
                            : 80
                      }
                      step={f.key === "land_area_acres" ? "any" : 1}
                      value={v === null ? "" : String(v)}
                      placeholder="Unknown"
                      onChange={(e) =>
                        p.edit(f.key, fieldValue(f.kind, e.target.value))
                      }
                    />
                  )}

                  <span id={`${id}-origin`} className="field-origin block text-[11px] text-slate-500">
                    {isUserOrigin
                      ? "Edited or confirmed by you"
                      : v === null
                        ? "Not provided · stays unknown"
                        : "Extracted · please review"}
                  </span>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            busy={busy === "confirm"}
            disabled={busy !== null}
          >
            <span>{p.confirmed ? "Confirm updated details" : "Confirm my details"}</span>
            <ArrowRight size={16} />
          </Button>

          <Button
            type="button"
            variant="quiet"
            busy={busy === "clear"}
            disabled={busy !== null}
            onClick={handleClear}
            className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
          >
            <Trash2 size={15} />
            <span>Clear my details</span>
          </Button>
        </div>
      </form>

      {error && <InlineAlert error>{error}</InlineAlert>}

      {p.confirmed && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-emerald-950 font-medium">
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
            <span>Details confirmed for this anonymous session.</span>
          </div>
          <Link
            href="/recommendations"
            className="text-sm font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            See my recommendations →
          </Link>
        </div>
      )}
    </GlassCard>
  );
}
