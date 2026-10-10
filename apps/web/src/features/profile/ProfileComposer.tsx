"use client";
import { useState, useEffect, useRef } from "react";
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
  Input,
  TextArea,
} from "@/components/ui";
import { errorMessage, isMock } from "@/lib/api";
import { useProfile } from "./hooks";
import { useMatching } from "@/features/matching/hooks";
import { fields, states } from "./types";
import { fieldValue } from "./model";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import Link from "next/link";
import { SpeechInputControls } from "@/features/speech/SpeechControls";

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
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (p.reviewing) reviewHeading.current?.focus();
  }, [p.reviewing]);
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
        <section
          className="panel profile-review"
          aria-labelledby="review-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.reviewEyebrow}</p>
              <h2 id="review-heading" ref={reviewHeading} tabIndex={-1}>
                {t.reviewTitle}
              </h2>
            </div>
            <Badge tone={p.confirmed ? "success" : "warning"}>
              {p.confirmed ? m.common.confirmedByYou : t.needsReview}
            </Badge>
          </div>
          <p className="muted">{t.reviewLead}</p>
          <div className="review-summary" aria-live="polite">
            <span>
              {format(t.provided, {
                count: fields.filter((f) => p.draft.facts[f.key] !== null)
                  .length,
              })}
            </span>
            <span>
              {format(t.stillUnknown, {
                count: fields.filter((f) => p.draft.facts[f.key] === null)
                  .length,
              })}
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run("confirm");
            }}
          >
            <fieldset
              className="profile-edit-fields"
              disabled={busy === "confirm" || busy === "clear"}
            >
              <legend className="sr-only">{t.reviewLegend}</legend>
              <div className="profile-fields">
                {fields.map((f) => {
                  const v = p.draft.facts[f.key];
                  const id = "fact-" + f.key;
                  return (
                    <div className="field" key={f.key}>
                      <label htmlFor={id}>{m.fields[f.key]}</label>
                      {f.kind === "state" ||
                      f.kind === "choice" ||
                      f.kind === "boolean" ? (
                        <select
                          id={id}
                          aria-describedby={`${id}-origin`}
                          className="input"
                          value={
                            v === null
                              ? ""
                              : typeof v === "boolean"
                                ? v
                                  ? "yes"
                                  : "no"
                                : String(v)
                          }
                          onChange={(e) =>
                            p.edit(f.key, fieldValue(f.kind, e.target.value))
                          }
                        >
                          <option value="">{m.common.unknown}</option>
                          {f.kind === "state" ? (
                            states.map((code) => (
                              <option key={code} value={code}>
                                {m.states[code]}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="yes">{m.common.yes}</option>
                              <option value="no">{m.common.no}</option>
                              {f.kind === "choice" && (
                                <option value="not_sure">
                                  {m.common.notSure}
                                </option>
                              )}
                            </>
                          )}
                        </select>
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
                              : f.key === "support_needs"
                                ? 400
                                : f.key === "gender"
                                  ? 40
                                  : 80
                          }
                          step={f.key === "land_area_acres" ? "any" : 1}
                          value={v === null ? "" : String(v)}
                          placeholder={
                            f.key === "support_needs"
                              ? t.supportNeedsPlaceholder
                              : m.common.unknown
                          }
                          onChange={(e) =>
                            p.edit(f.key, fieldValue(f.kind, e.target.value))
                          }
                        />
                      )}
                      <span id={`${id}-origin`} className="field-origin">
                        {p.draft.origins[f.key] === "user"
                          ? t.originUser
                          : v === null
                            ? t.originBlank
                            : t.originExtracted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <div className="review-actions">
              <Button
                type="submit"
                busy={busy === "confirm"}
                disabled={busy !== null}
              >
                {p.confirmed ? t.confirmUpdated : t.confirm}
                <ArrowRight size={16} />
              </Button>
              <Button
                type="button"
                variant="quiet"
                busy={busy === "clear"}
                disabled={busy !== null}
                onClick={() => void run("clear")}
              >
                {t.clear}
              </Button>
            </div>
          </form>
          {error && <InlineAlert error>{error}</InlineAlert>}
          {p.confirmed && (
            <InlineAlert>
              {t.confirmedNotice}{" "}
              <Link href="/recommendations" className="text-link">
                {t.seeRecommendations}
              </Link>
            </InlineAlert>
          )}
        </section>
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
