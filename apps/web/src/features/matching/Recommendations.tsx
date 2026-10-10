"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  GlassPanel,
  EmptyState,
  InlineAlert,
  Skeleton,
} from "@/components/ui";
import { useResource } from "@/lib/api/use-resource";
import { useProfile } from "@/features/profile/hooks";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { fields } from "@/features/profile/types";
import { factLabel } from "@/features/profile/model";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { useMatching } from "./hooks";
import type { SchemeMatch } from "@/lib/api/contracts";
import { MatchCard } from "./MatchCard";
import { FollowUpCard } from "@/features/questions/FollowUpCard";
import { cn } from "@/lib/classes";
export function Recommendations({ embedded = false }: { embedded?: boolean }) {
  const m = useMessages();
  const t = m.recommendations;
  const [filter, setFilter] = useState<SchemeMatch["status"] | "all">("all");
  const p = useProfile();
  const matching = useMatching();
  const { rematch } = matching;
  const sessionId = p.confirmed ? p.session?.session_id : null;
  const load = useCallback(
    () =>
      sessionId ? rematch(sessionId, p.draft.facts) : Promise.resolve(null),
    [sessionId, p.draft.facts, rematch],
  );
  const r = useResource(load);
  const results =
    matching.key === JSON.stringify({ sessionId, facts: p.draft.facts })
      ? matching.matches
      : r.data;
  const visibleMatches =
    results?.results.filter((m) => filter === "all" || m.status === filter) ??
    [];
  return (
    <>
      {!embedded && (
        <>
          <ModeNotice />
          <section className="page-heading">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>
              {t.title}
              <span className="green">.</span>
            </h1>
            <p className="muted">{t.lead}</p>
          </section>
        </>
      )}
      {!sessionId ? (
        <EmptyState title={t.startTitle}>
          <p>{t.startText}</p>
          <Link className="button primary" href="/discover">
            {t.createProfile}
          </Link>
        </EmptyState>
      ) : (
        <div
          className={cn(
            "recommendation-layout",
            embedded && "embedded-matches",
          )}
        >
          <div className="stack">
            {r.loading ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : r.error ? (
              <>
                <InlineAlert error>{r.error}</InlineAlert>
                <Button variant="secondary" onClick={r.retry}>
                  {t.retry}
                </Button>
              </>
            ) : results?.results.length ? (
              <>
                <div className="section-heading">
                  <h2>{t.shortlist}</h2>
                  <span className="small muted">
                    {format(
                      results.results.length === 1 ? t.countOne : t.countOther,
                      { count: results.results.length },
                    )}
                  </span>
                </div>
                <div className="recommendation-toolbar">
                  <label htmlFor="match-filter">{t.showConditions}</label>
                  <select
                    id="match-filter"
                    className="input"
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value as SchemeMatch["status"] | "all")
                    }
                  >
                    <option value="all">{t.allStatuses}</option>
                    {Object.entries(m.verdicts).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="small muted" aria-live="polite">
                    {format(t.shown, { count: visibleMatches.length })}
                  </span>
                </div>
                {!visibleMatches.length && (
                  <div className="empty">
                    <h3>{t.noStatusTitle}</h3>
                    <Button variant="quiet" onClick={() => setFilter("all")}>
                      {t.showAll}
                    </Button>
                  </div>
                )}
                {visibleMatches.map((m) => (
                  <MatchCard key={m.scheme_id} match={m} />
                ))}
              </>
            ) : (
              <EmptyState title={t.noMatchesTitle}>
                <p>{t.noMatchesText}</p>
                <Link className="button secondary" href="/discover">
                  {t.editOrBrowse}
                </Link>
              </EmptyState>
            )}
          </div>
          <aside className="stack">
            {results && <FollowUpCard matches={results} />}
            {!embedded && (
              <>
                <GlassPanel className="profile-snapshot">
                  <div className="section-heading">
                    <h3>{t.yourProfile}</h3>
                    <Badge tone="success">{m.common.confirmedByYou}</Badge>
                  </div>
                  <dl>
                    {fields.slice(0, 6).map((f) => (
                      <div key={f.key}>
                        <dt>{m.fields[f.key]}</dt>
                        <dd>{factLabel(f.key, p.draft.facts[f.key], m)}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    className="button secondary wide"
                    href="/discover"
                    onClick={matching.reset}
                  >
                    {t.editProfile}
                  </Link>
                  <p className="small muted">{t.correctionsNote}</p>
                </GlassPanel>
                <div className="next-step-note">
                  <p className="eyebrow">{t.nextEyebrow}</p>
                  <h3>
                    {t.nextTitleLine1}
                    <br />
                    {t.nextTitleLine2}
                  </h3>
                  <p>{t.nextText}</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
