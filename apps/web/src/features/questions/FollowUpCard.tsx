"use client";
import { useCallback, useState } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import { Button, Input, InlineAlert, Skeleton } from "@/components/ui";
import type { MatchesResponse, NextQuestion } from "@/lib/api/contracts";
import { useProfile } from "@/features/profile/hooks";
import { useMatching } from "@/features/matching/hooks";
import { fields } from "@/features/profile/types";
import { labelFor } from "@/lib/format";
import { useMessages } from "@/i18n/client";
import { answerValue, describeChanges } from "./model";
export function FollowUpCard({ matches }: { matches: MatchesResponse }) {
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
    <section
      className="question-card"
      aria-labelledby="question-title"
      aria-busy={busy}
    >
      <div className="row">
        <HelpCircle size={18} />
        <p className="eyebrow">{t.eyebrow}</p>
      </div>
      <h3 id="question-title">{t.title}</h3>
      {notice && <InlineAlert>{notice}</InlineAlert>}
      {error && <InlineAlert error>{error}</InlineAlert>}
      {r.loading && !editing ? (
        <Skeleton />
      ) : r.error && !editing ? (
        <>
          <InlineAlert error>{r.error}</InlineAlert>
          <Button variant="secondary" onClick={r.retry}>
            {t.retry}
          </Button>
        </>
      ) : q?.question ? (
        fields.some((f) => f.key === q.field) ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <fieldset disabled={busy}>
              <legend>{q.question}</legend>
              {q.answer_type === "single_choice" ? (
                <div className="question-options">
                  {q.options.map((option) => (
                    <label
                      key={option}
                      className={`radio-option ${value === option ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="follow-up-answer"
                        value={option}
                        checked={value === option}
                        onChange={() => setValue(option)}
                        required
                      />
                      {labelFor(m.answers, option)}
                    </label>
                  ))}
                </div>
              ) : (
                <>
                  <label className="sr-only" htmlFor="question-answer">
                    {q.question}
                  </label>
                  <Input
                    id="question-answer"
                    type={q.answer_type === "number" ? "number" : "text"}
                    step={q.field === "land_area_acres" ? "any" : 1}
                    value={value}
                    maxLength={120}
                    required
                    onChange={(e) => setValue(e.target.value)}
                  />
                </>
              )}
              <details className="question-reason">
                <summary>{t.why}</summary>
                <p>{q.reason}</p>
              </details>
            </fieldset>
            <div className="question-actions">
              <Button type="submit" busy={busy} disabled={!value}>
                {t.update}
                <ArrowRight size={15} />
              </Button>
              <Button
                type="button"
                variant="quiet"
                disabled={busy}
                onClick={() => void submit(true)}
              >
                {t.skip}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setEditing(false)}
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
        <p className="small muted">
          {t.none}
        </p>
      )}
      {last && !editing && (
        <Button
          variant="quiet"
          disabled={busy}
          onClick={() => {
            setEditing(true);
            setValue("");
          }}
        >
          {t.editPrevious}
        </Button>
      )}
    </section>
  );
}
