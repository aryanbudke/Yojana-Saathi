"use client";
import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  Badge,
  Button,
  GlassPanel,
  InlineAlert,
  TextArea,
} from "@/components/ui";
import { errorMessage, isMock } from "@/lib/api";
import { useProfile } from "./hooks";
import { useMatching } from "@/features/matching/hooks";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { SpeechInputControls } from "@/features/speech/SpeechControls";
import { ProfileConfirmation } from "./ProfileConfirmation";

export function ModeNotice() {
  const m = useMessages();
  return isMock ? (
    <div className="mode-notice">
      <span className="mode-dot" />
      <strong>{m.mock.label}</strong>
      <span>{m.mock.notice}</span>
    </div>
  ) : null;
}
export function ProfileComposer() {
  const m = useMessages();
  const t = m.profile;
  const p = useProfile();
  const matching = useMatching();
  const [busy, setBusy] = useState<"extract" | "confirm" | "clear" | null>(
    null,
  );
  const [error, setError] = useState("");
  async function run(kind: "extract" | "confirm" | "clear") {
    setBusy(kind);
    setError("");
    try {
      await p[kind]();
      if (kind === "clear") matching.reset();
    } catch (e) {
      setError(errorMessage(e, m.errors));
      if (kind === "extract") p.setReviewing(true);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="profile-workspace">
      <GlassPanel className="composer-shell">
        <div className="section-heading">
          <h2>{t.title}</h2>
          <Badge>{t.badge}</Badge>
        </div>
        <p className="muted composer-description">{t.lead}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run("extract");
          }}
        >
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
          <SpeechInputControls
            onTranscript={(transcript) =>
              p.setText(
                p.text.trim() ? `${p.text.trim()} ${transcript}` : transcript,
              )
            }
          />
          <div className="composer-meta">
            <Button
              type="button"
              variant="quiet"
              onClick={() => p.setText(t.example)}
            >
              <Sparkles size={15} aria-hidden="true" />
              {t.tryExample}
            </Button>
            <span id="profile-counter" className="small muted">
              {format(t.characters, { count: p.text.length })}
            </span>
          </div>
          <Button
            type="submit"
            className="wide"
            busy={busy === "extract"}
            disabled={!p.text.trim() || busy !== null}
          >
            {busy === "extract" ? t.reviewing : t.findMySchemes}
            <ArrowRight size={18} />
          </Button>
          <Button
            type="button"
            variant="quiet"
            className="wide"
            disabled={busy !== null}
            onClick={() => {
              p.setReviewing(true);
              setError("");
            }}
          >
            {t.enterManually}
            <SlidersHorizontal size={15} />
          </Button>
          {isMock && (
            <p className="small muted mock-extract-note">{t.mockNote}</p>
          )}
          <p id="profile-privacy" className="privacy-note">
            <ShieldCheck size={15} aria-hidden="true" />
            {t.privacy}
          </p>
        </form>
        {error && !p.reviewing && <InlineAlert error>{error}</InlineAlert>}
      </GlassPanel>
      {p.reviewing && (
        <ProfileConfirmation
          onEditOriginalMessage={() => {
            const el = document.getElementById("profile-text");
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.focus();
          }}
          onClear={() => {
            matching.reset();
          }}
        />
      )}

      <div className="sr-only" role="status">
        {busy === "extract"
          ? t.statusReviewing
          : busy === "confirm"
            ? t.statusSaving
            : ""}
      </div>
    </div>
  );
}
