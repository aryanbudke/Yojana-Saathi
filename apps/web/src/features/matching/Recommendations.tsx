"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  GlassPanel,
  InlineAlert,
  Skeleton,
} from "@/components/ui";
import { useResource } from "@/lib/api/use-resource";
import { useProfile } from "@/features/profile/hooks";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { fields, states } from "@/features/profile/types";
import { useMatching } from "./hooks";
import { verdictLabels } from "./types";
import type { SchemeMatch } from "@/lib/api/contracts";
import { MatchCard } from "./MatchCard";
import { FollowUpCard } from "@/features/questions/FollowUpCard";
export function Recommendations() {
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
      <ModeNotice />
      <section className="page-heading">
        <p className="eyebrow">Your story. Your possibilities.</p>
        <h1>
          Let’s make your options clearer<span className="green">.</span>
        </h1>
        <p className="muted">
          A shortlist with the reasons, the unknowns, and your next steps.
        </p>
      </section>
      {!sessionId ? (
        <div className="empty">
          <h2>Start with your details</h2>
          <p>
            Review and confirm a profile before checking scheme conditions.
            Profile data stays in this tab’s memory.
          </p>
          <Link className="button primary" href="/discover">
            Create my profile
          </Link>
        </div>
      ) : (
        <div className="recommendation-layout">
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
                  Retry matching
                </Button>
              </>
            ) : results?.results.length ? (
              <>
                <div className="section-heading">
                  <h2>Your shortlist</h2>
                  <span className="small muted">
                    {results.results.length} scheme
                    {results.results.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="recommendation-toolbar">
                  <label htmlFor="match-filter">Show conditions</label>
                  <select
                    id="match-filter"
                    className="input"
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value as SchemeMatch["status"] | "all")
                    }
                  >
                    <option value="all">All statuses</option>
                    {Object.entries(verdictLabels).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label.text}
                      </option>
                    ))}
                  </select>
                  <span className="small muted" aria-live="polite">
                    {visibleMatches.length} shown
                  </span>
                </div>
                {!visibleMatches.length && (
                  <div className="empty">
                    <h3>No schemes with this status</h3>
                    <Button variant="quiet" onClick={() => setFilter("all")}>
                      Show all statuses
                    </Button>
                  </div>
                )}
                {visibleMatches.map((m) => (
                  <MatchCard key={m.scheme_id} match={m} />
                ))}
              </>
            ) : (
              <div className="empty">
                <h3>No matches found yet</h3>
                <p>
                  Try correcting your details or explore the scheme catalogue.
                </p>
                <Link className="button secondary" href="/discover">
                  Edit profile or browse
                </Link>
              </div>
            )}
          </div>
          <aside className="stack">
            {results && <FollowUpCard matches={results} />}
            <GlassPanel className="profile-snapshot">
              <div className="section-heading">
                <h3>Your profile</h3>
                <Badge tone="success">Confirmed by you</Badge>
              </div>
              <dl>
                {fields.slice(0, 6).map((f) => {
                  const value = p.draft.facts[f.key];
                  return (
                    <div key={f.key}>
                      <dt>{f.label}</dt>
                      <dd>
                        {value === null
                          ? "Unknown"
                          : f.key === "state_code"
                            ? (states.find(([code]) => code === value)?.[1] ??
                              String(value))
                            : String(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <Link
                className="button secondary wide"
                href="/discover"
                onClick={matching.reset}
              >
                Edit profile
              </Link>
              <p className="small muted">
                Your corrections take priority over extracted details.
              </p>
            </GlassPanel>
            <div className="next-step-note">
              <p className="eyebrow">A match is a starting point</p>
              <h3>
                Read the conditions.
                <br />
                Check the source.
              </h3>
              <p>
                Only the relevant government authority can determine eligibility
                and approve an application.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
