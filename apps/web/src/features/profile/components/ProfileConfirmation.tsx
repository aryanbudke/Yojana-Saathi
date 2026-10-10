"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useProfile } from "../hooks";
import { useMatching } from "@/features/matching/hooks";
import {
  getMissingEssentialFields,
  getAdditionalFields,
} from "../model";
import { errorMessage } from "@/lib/api";
import { useMessages } from "@/i18n/client";
import { InlineAlert } from "@/components/ui";
import { ProfileProgressSummary } from "./ProfileProgressSummary";
import { ExtractedField } from "./ExtractedField";
import { OptionalProfileField } from "./OptionalProfileField";
import { AdditionalDetailsAccordion } from "./AdditionalDetailsAccordion";
import { ProfilePrivacyNotice } from "./ProfilePrivacyNotice";
import { ConfirmProfileActions } from "./ConfirmProfileActions";

export interface ProfileConfirmationProps {
  onConfirmed?: () => void;
  onEditOriginalMessage?: () => void;
  onClear?: () => void;
}

export function ProfileConfirmation({
  onConfirmed,
  onEditOriginalMessage,
  onClear,
}: ProfileConfirmationProps) {
  const m = useMessages();
  const t = m.profile;
  const p = useProfile();
  const matching = useMatching();
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
      const activeSession = await p.confirm();
      if (activeSession) {
        await matching.rematch(activeSession.session_id, activeSession.facts);
      }
      if (onConfirmed) onConfirmed();
    } catch (err) {
      setError(errorMessage(err, m.errors));
    } finally {
      setBusy(null);
    }
  }


  async function handleClear() {
    setBusy("clear");
    setError("");
    try {
      await p.clear();
      if (onClear) onClear();
    } catch (err) {
      setError(errorMessage(err, m.errors));
    } finally {
      setBusy(null);
    }
  }


  const extractedFields = p.extractedFields;
  const missingEssentials = getMissingEssentialFields(extractedFields);
  const additionalFields = getAdditionalFields(extractedFields);

  return (
    <section
      id="profile-review"
      className="profile-review panel p-6 sm:p-8 space-y-6 max-w-4xl mx-auto rounded-3xl bg-[#F7F5F0]/90 backdrop-blur-md border border-stone-200/90 shadow-sm"
      aria-labelledby="review-heading"
    >
      {/* Header and dynamic extracted count */}
      <ProfileProgressSummary
        extractedCount={p.extractedCount}
        confirmed={p.confirmed}
        headingRef={headingRef}
      />

      <form onSubmit={handleConfirm} className="space-y-6">
        <fieldset disabled={busy !== null} className="space-y-6">
          <legend className="sr-only">{t.reviewLegend}</legend>

          {/* Section A — Extracted Information */}
          {extractedFields.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#165541]">
                  {t.extractedSectionTitle}
                </h3>
                <span className="text-xs text-[#3D4B44]">
                  {t.extractedSectionLead}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {extractedFields.map((field) => (
                  <ExtractedField
                    key={field}
                    field={field}
                    value={p.draft.facts[field]}
                    status={p.getFieldStatus(field)}
                    onChange={(val) => p.edit(field, val)}
                    disabled={busy !== null}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section B — Essential Missing Information */}
          {missingEssentials.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200/70">
              <div>
                <h3 className="text-sm font-bold text-[#102A24]">
                  {t.missingSectionTitle}
                </h3>
                <p className="text-xs text-[#3D4B44] mt-0.5">
                  {t.missingSectionLead}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5 rounded-2xl bg-white/50 border border-stone-200/80">
                {missingEssentials.map((field) => (
                  <OptionalProfileField
                    key={field}
                    field={field}
                    value={p.draft.facts[field]}
                    onChange={(val) => p.edit(field, val)}
                    disabled={busy !== null}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section C — Additional Details (Accordion) */}
          {additionalFields.length > 0 && (
            <div className="pt-1">
              <AdditionalDetailsAccordion
                fields={additionalFields}
                facts={p.draft.facts}
                onChange={(field, val) => p.edit(field, val)}
                disabled={busy !== null}
              />
            </div>
          )}

          {/* Section D — Privacy Message */}
          <ProfilePrivacyNotice />
        </fieldset>

        {/* Section E — Primary Actions */}
        <ConfirmProfileActions
          busy={busy}
          confirmed={p.confirmed}
          onEditMessage={onEditOriginalMessage}
          onClear={handleClear}
        />
      </form>

      {error && <InlineAlert error>{error}</InlineAlert>}

      {/* Confirmation feedback with next step recommendation link */}
      {p.confirmed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#E7EDE7]/90 border border-[#165541]/30 flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-sm text-[#102A24] font-medium">
            <CheckCircle2 size={19} className="text-[#165541] shrink-0" aria-hidden="true" />
            <span>{t.confirmedNotice}</span>
          </div>

          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#165541] hover:text-[#102A24] underline underline-offset-4"
          >
            <span>{t.seeRecommendations}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="sr-only" role="status">
        {busy === "confirm" ? t.statusSaving : ""}
      </div>
    </section>
  );
}
