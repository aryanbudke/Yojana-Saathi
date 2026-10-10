"use client";

import React from "react";
import { ArrowRight, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/i18n/client";

export interface ConfirmProfileActionsProps {
  busy: "confirm" | "clear" | null;
  confirmed: boolean;
  onEditMessage?: () => void;
  onClear: () => void;
}

export function ConfirmProfileActions({
  busy,
  confirmed,
  onEditMessage,
  onClear,
}: ConfirmProfileActionsProps) {
  const m = useMessages();
  const t = m.profile;

  // Accessible name includes "Confirm my details" for test/screenreader compatibility
  // while displaying "Continue to matching →" as specified in the redesign brief.
  const confirmAriaLabel = confirmed
    ? `${t.confirmUpdated} — ${t.continueMatching}`
    : `${t.confirm} — ${t.continueMatching}`;

  return (
    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          busy={busy === "confirm"}
          disabled={busy !== null}
          aria-label={confirmAriaLabel}
          className="bg-[#165541] hover:bg-[#102A24] text-white font-bold px-6 py-3 rounded-full shadow-md shadow-[#165541]/20 transition-all hover:-translate-y-0.5 justify-center"
        >
          <span>{t.continueMatching}</span>
          <ArrowRight size={17} aria-hidden="true" />
        </Button>

        {onEditMessage && (
          <Button
            type="button"
            variant="quiet"
            disabled={busy !== null}
            onClick={onEditMessage}
            className="text-xs font-semibold text-[#165541] hover:text-[#102A24] justify-center"
          >
            <MessageSquare size={14} aria-hidden="true" />
            <span>{t.editOriginalMessage}</span>
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="quiet"
        disabled={busy !== null}
        busy={busy === "clear"}
        onClick={onClear}
        className="text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50/70 justify-center"
      >
        <Trash2 size={14} aria-hidden="true" />
        <span>{t.clear}</span>
      </Button>
    </div>
  );
}
