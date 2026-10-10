"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Input,
  TextArea,
  InlineAlert,
  Skeleton,
} from "@/components/ui";
import { askDrafts, type DraftAnswer } from "./model";
import { DraftResult } from "./DraftResult";

export function RagTester() {
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState(
    "According to the unverified Atal Pension Yojana record, what monthly pension range is listed? Treat this as draft evidence.",
  );
  const [result, setResult] = useState<DraftAnswer | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setResult(null);
    try {
      setResult(await askDrafts(question.trim(), token.trim()));
    } catch (failure) {
      setError(
        failure instanceof Error &&
          failure.name !== "TypeError" &&
          failure.name !== "TimeoutError"
          ? failure.message
          : "Could not reach the local backend. Check that it is running and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8 text-base">
      <form
        onSubmit={submit}
        className="panel space-y-6"
        aria-label="Ask unverified scheme drafts"
      >
        <div className="space-y-2">
          <label htmlFor="review-token" className="font-semibold">
            Reviewer token
          </label>
          <Input
            id="review-token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
            minLength={32}
            maxLength={512}
            autoComplete="off"
            aria-describedby={error ? "token-help rag-error" : "token-help"}
            aria-invalid={error.startsWith("Reviewer token rejected")}
            disabled={pending}
            className="input text-base"
          />
          <p id="token-help" className="muted">
            Use ADMIN_REVIEW_TOKEN from the private backend .env. It stays in
            this tab’s memory and is sent only to your local API.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="draft-question" className="font-semibold">
            Your question
          </label>
          <TextArea
            id="draft-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
            minLength={2}
            maxLength={500}
            aria-describedby="question-help"
            disabled={pending}
            className="input textarea text-base"
          />
          <p id="question-help" className="muted">
            Try Atal Pension Yojana, Jan Dhan accounts, seed support or handloom
            loans.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            busy={pending}
            disabled={question.trim().length < 2 || token.trim().length < 32}
          >
            {pending ? "Reading draft sources…" : "Ask draft records"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !token}
            onClick={() => {
              setToken("");
              setResult(null);
              setError("");
            }}
          >
            Clear token and answer
          </Button>
        </div>
      </form>
      {error && (
        <div id="rag-error">
          <InlineAlert error>{error}</InlineAlert>
        </div>
      )}
      <div aria-live="polite" aria-busy={pending}>
        {pending ? (
          <>
            <p className="mb-4 muted">
              Retrieving records and checking answer citations…
            </p>
            <Skeleton />
          </>
        ) : result ? (
          <DraftResult result={result} />
        ) : (
          <p className="muted">
            Enter your reviewer token, then ask a question to see a draft answer
            and the exact retrieved records.
          </p>
        )}
      </div>
    </div>
  );
}
