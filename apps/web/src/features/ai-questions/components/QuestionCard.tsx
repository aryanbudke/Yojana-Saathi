"use client";

import React, { useCallback, useState } from "react";
import { ArrowRight, HelpCircle, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, InlineAlert, Skeleton } from "@/components/ui";
import { AnswerOptions } from "./AnswerOptions";
import { api, errorMessage } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import { useProfile } from "@/features/profile/hooks";
import { useMatching } from "@/features/matching/hooks";
import { fields } from "@/features/profile/types";
import { answerValue, describeChanges } from "@/features/questions/model";
import type { MatchesResponse, NextQuestion } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";

export interface QuestionCardProps {
  matches: MatchesResponse;
}

export function QuestionCard({ matches }: QuestionCardProps) {
  const m = useMessages();
  const t = m.followUp;
  const p = useProfile();
  const matching = useMatching();
  const id = p.session?.session_id;

  const load = useCallback(
    () => (id ? api.nextQuestion(id, matches.run_id) : Promise.resolve(null)),
    [id, matches.run_id],
  );

  const r = useResource(load);
  const [last, setLast] = useState<NextQuestion | null>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const q = editing ? last : r.data;

  async function submit(skip = false) {
    if (!q || !id) return;
    setBusy(true);
    setError("");
    try {
      const answer = answerValue(q, skip ? "not_sure" : value, m);
      const facts = await p.applyAnswer(answer.field, answer.value);
      setLast(q);
      const next = await matching.rematch(id, facts);
      setNotice(describeChanges(matches, next, m));
      setEditing(false);
      setValue("");
    } catch (e) {
      setError(errorMessage(e, m.errors));
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard
      variant="elevated"
      glow="saffron"
      className="question-card p-6 sm:p-7 space-y-4 border-amber-300/40"
      aria-labelledby="question-title"
      aria-busy={busy}
    >
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-md bg-amber-100 text-amber-800">
          <HelpCircle size={17} aria-hidden="true" />
        </span>
        <p className="eyebrow text-xs font-bold uppercase tracking-wider text-amber-900">
          {t.eyebrow}
        </p>
      </div>

      <h3 id="question-title" className="text-xl font-bold text-slate-900 tracking-tight">
        {t.title}
      </h3>

      {notice && <InlineAlert>{notice}</InlineAlert>}
      {error && <InlineAlert error>{error}</InlineAlert>}

      {r.loading && !editing ? (
        <Skeleton />
      ) : r.error && !editing ? (
        <div className="space-y-3">
          <InlineAlert error>{r.error}</InlineAlert>
          <Button variant="secondary" size="sm" onClick={r.retry}>
            {t.retry}
          </Button>
        </div>
      ) : q?.question ? (
        fields.some((f) => f.key === q.field) ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            <fieldset disabled={busy} className="space-y-3">
              <legend className="text-sm sm:text-base font-semibold text-slate-900">
                {q.question}
              </legend>

              <AnswerOptions
                question={q}
                value={value}
                onChange={setValue}
                disabled={busy}
              />

              {q.reason && (
                <details className="question-reason text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50">
                  <summary className="font-semibold text-amber-900 cursor-pointer">
                    {t.why}
                  </summary>
                  <p className="mt-1.5 leading-relaxed">{q.reason}</p>
                </details>
              )}
            </fieldset>

            <div className="question-actions flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                busy={busy}
                disabled={!value || busy}
              >
                <span>{t.update}</span>
                <ArrowRight size={15} />
              </Button>

              <Button
                type="button"
                variant="quiet"
                disabled={busy}
                onClick={() => void submit(true)}
                className="text-slate-600 hover:text-slate-900"
              >
                {t.skip}
              </Button>

              {editing && (
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setEditing(false)}
                  className="text-slate-500"
                >
                  {t.cancel}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <InlineAlert>
            {t.manual}
          </InlineAlert>
        )
      ) : (
        <p className="text-xs text-slate-500">
          {t.none}
        </p>
      )}

      {last && !editing && (
        <div className="pt-3 border-t border-slate-200/60">
          <Button
            type="button"
            variant="quiet"
            size="sm"
            disabled={busy}
            onClick={() => {
              setEditing(true);
              setValue("");
            }}
            className="text-xs text-emerald-800 font-semibold"
          >
            <RotateCcw size={13} />
            <span>{t.editPrevious}</span>
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
