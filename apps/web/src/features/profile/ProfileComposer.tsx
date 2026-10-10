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
import { example, fieldValue } from "./model";
import Link from "next/link";

export function ModeNotice() {
  return isMock ? (
    <div className="mode-notice">
      <span className="mode-dot" />
      <strong>Mock mode</strong>
      <span>
        Synthetic contract examples. These are not government scheme
        recommendations.
      </span>
    </div>
  ) : null;
}
export function ProfileComposer() {
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
      setError(errorMessage(e));
      if (kind === "extract") p.setReviewing(true);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="profile-workspace">
      <GlassPanel className="composer-shell">
        <div className="section-heading">
          <h2>Tell us about your situation</h2>
          <Badge>Your profile</Badge>
        </div>
        <p className="muted composer-description">
          You don’t need to know a scheme’s name. Just share a few details about yourself.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run("extract");
          }}
        >
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
          <div className="composer-meta">
            <Button
              type="button"
              variant="quiet"
              onClick={() => p.setText(example)}
            >
              <Sparkles size={15} aria-hidden="true" />
              Try an example
            </Button>
            <span id="profile-counter" className="small muted">
              {p.text.length}/1000 characters
            </span>
          </div>
          <Button
            type="submit"
            className="wide"
            busy={busy === "extract"}
            disabled={!p.text.trim() || busy !== null}
          >
            {busy === "extract" ? "Reviewing your details…" : "Find my schemes"}
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
            Enter details manually
            <SlidersHorizontal size={15} />
          </Button>
          {isMock && (
            <p className="small muted mock-extract-note">
              Mock extraction returns the sample farmer profile. Use manual
              entry for your own details.
            </p>
          )}
          <p id="profile-privacy" className="privacy-note">
            <ShieldCheck size={15} aria-hidden="true" />
            Only share what’s needed. Don’t enter Aadhaar numbers.
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
              <p className="eyebrow">02 / CHECK YOUR DETAILS</p>
              <h2 id="review-heading" ref={reviewHeading} tabIndex={-1}>
                Check your details
              </h2>
            </div>
            <Badge tone={p.confirmed ? "success" : "warning"}>
              {p.confirmed ? "Confirmed by you" : "Needs your review"}
            </Badge>
          </div>
          <p className="muted">
            Correct anything that doesn’t look right. Blank fields stay unknown;
            nothing is assumed.
          </p>
          <div className="review-summary" aria-live="polite">
            <span>
              {fields.filter((f) => p.draft.facts[f.key] !== null).length}{" "}
              details provided
            </span>
            <span>
              {fields.filter((f) => p.draft.facts[f.key] === null).length} still
              unknown
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
              <legend className="sr-only">Review your profile facts</legend>
              <div className="profile-fields">
                {fields.map((f) => {
                  const v = p.draft.facts[f.key];
                  const id = "fact-" + f.key;
                  return (
                    <div className="field" key={f.key}>
                      <label htmlFor={id}>{f.label}</label>
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
                              {f.kind === "choice" && (
                                <option value="not_sure">Not sure</option>
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
                      <span id={`${id}-origin`} className="field-origin">
                        {p.draft.origins[f.key] === "user"
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
            <div className="review-actions">
              <Button
                type="submit"
                busy={busy === "confirm"}
                disabled={busy !== null}
              >
                {p.confirmed ? "Confirm updated details" : "Confirm my details"}
                <ArrowRight size={16} />
              </Button>
              <Button
                type="button"
                variant="quiet"
                busy={busy === "clear"}
                disabled={busy !== null}
                onClick={() => void run("clear")}
              >
                Clear my details
              </Button>
            </div>
          </form>
          {error && <InlineAlert error>{error}</InlineAlert>}
          {p.confirmed && (
            <InlineAlert>
              Your details are confirmed for this anonymous session.{" "}
              <Link href="/recommendations" className="text-link">
                See my recommendations →
              </Link>
            </InlineAlert>
          )}
        </section>
      )}
      <div className="sr-only" role="status">
        {busy === "extract"
          ? "Reviewing your details"
          : busy === "confirm"
            ? "Saving confirmed details"
            : ""}
      </div>
    </div>
  );
}
