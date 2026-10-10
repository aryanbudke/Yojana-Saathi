"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, Select, Skeleton, EmptyState, InlineAlert } from "@/components/ui";
import { EligibilityBadge } from "@/features/eligibility/components/EligibilityBadge";
import { CriteriaChecklist } from "@/features/eligibility/components/CriteriaChecklist";
import { MatchExplanation } from "./MatchExplanation";
import { QuestionCard } from "@/features/ai-questions/components/QuestionCard";
import { ProfileSummary } from "@/features/user-profile/components/ProfileSummary";
import { useProfile } from "@/features/profile/hooks";
import { useMatching } from "@/features/matching/hooks";
import { useResource } from "@/lib/api/use-resource";
import { api } from "@/lib/api";
import { labelFor } from "@/lib/format";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import type { SchemeMatch } from "@/lib/api/contracts";

export interface MatchResultsProps {
  embedded?: boolean;
}

export function MatchResults({ embedded = false }: MatchResultsProps) {
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

  if (!sessionId) {
    return (
      <EmptyState title={t.startTitle}>
        <p>{t.startText}</p>
        <Link className="button primary inline-flex items-center gap-2" href="/discover">
          <span>{t.createProfile}</span>
          <ArrowUpRight size={16} />
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className={`recommendation-layout grid grid-cols-1 ${embedded ? "lg:grid-cols-1" : "lg:grid-cols-12"} gap-8`}>
      {/* Matches Stream */}
      <div className={`${embedded ? "w-full" : "lg:col-span-8"} space-y-6`}>
        {r.loading ? (
          <div className="space-y-6">
            <Skeleton />
            <Skeleton />
          </div>
        ) : r.error ? (
          <div className="space-y-4">
            <InlineAlert error>{r.error}</InlineAlert>
            <Button variant="secondary" onClick={r.retry}>
              {t.retry}
            </Button>
          </div>
        ) : results?.results.length ? (
          <>
            <div className="section-heading flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200/60">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.shortlist}</h2>
                <span className="small muted text-xs text-slate-500 font-medium">
                  {format(
                    results.results.length === 1 ? t.evaluatedOne : t.evaluatedOther,
                    { count: results.results.length },
                  )}
                </span>
              </div>

              {/* Status Filter Dropdown */}
              <div className="recommendation-toolbar flex items-center gap-3">
                <label htmlFor="match-filter" className="text-xs font-bold text-slate-700">
                  {t.showConditions}
                </label>
                <div className="w-48">
                  <Select
                    id="match-filter"
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
                  </Select>
                </div>
                <span className="small muted text-xs text-slate-500 font-medium" aria-live="polite">
                  {format(t.shown, { count: visibleMatches.length })}
                </span>
              </div>
            </div>

            {!visibleMatches.length && (
              <div className="empty p-8 text-center rounded-3xl bg-cream/60 backdrop-blur-md border border-slate-200/80">
                <h3 className="text-base font-bold text-slate-800 mb-2">{t.noStatusTitle}</h3>
                <Button variant="quiet" onClick={() => setFilter("all")}>
                  {t.showAll}
                </Button>
              </div>
            )}

            {visibleMatches.map((match) => (
              <MatchCardItem key={match.scheme_id} match={match} />
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

      {/* Aside Sidebar */}
      {!embedded && (
        <aside className="lg:col-span-4 space-y-6">
          {results && <QuestionCard matches={results} />}
          <ProfileSummary />

          <GlassCard variant="standard" glow="emerald" className="p-6 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {t.guidanceNote}
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {t.guidanceTitle}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.guidanceText}
            </p>
          </GlassCard>
        </aside>
      )}
    </div>
  );
}

function MatchCardItem({ match }: { match: SchemeMatch }) {
  const m = useMessages();
  const load = useCallback(() => api.detail(match.scheme_id), [match.scheme_id]);
  const d = useResource(load);
  const current =
    d.data?.scheme_version_id === match.scheme_version_id ? d.data : null;

  return (
    <GlassCard
      variant="standard"
      glow="emerald"
      className="panel match-card p-6 sm:p-7 space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <EligibilityBadge status={match.status} />
          {current && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {labelFor(m.categoryNames, current.category)}
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          <Link href={`/schemes/${match.scheme_id}`} className="hover:text-emerald-800 transition-colors">
            {match.scheme_name}
          </Link>
        </h2>
        {current && (
          <p className="text-sm text-slate-600 mt-1.5 match-summary leading-relaxed">
            {current.summary}
          </p>
        )}
      </div>

      {current && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-950 font-medium">
          <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800 block mb-0.5">
            {m.match.supportAtAGlance}
          </span>
          <p>{current.benefit_text}</p>
        </div>
      )}

      <div className="pt-2">
        <CriteriaChecklist
          rules={[
            ...match.matched_rules,
            ...match.failed_rules,
            ...match.unknown_rules,
            ...match.manual_review_rules,
          ]}
          sources={current?.official_sources}
        />
      </div>

      <MatchExplanation match={match} />

      <div className="scheme-card-footer pt-4 border-t border-slate-200/70 flex items-center justify-between gap-3 flex-wrap text-xs">
        <span className="small muted text-slate-500 font-medium">
          {match.unknown_rules.length
            ? format(
                match.unknown_rules.length === 1
                  ? m.match.unknownOne
                  : m.match.unknownOther,
                { count: match.unknown_rules.length },
              )
            : m.match.readEvery}
        </span>
        <Link
          className="button quiet inline-flex items-center gap-1.5 text-emerald-800 font-bold hover:text-emerald-950"
          href={`/schemes/${match.scheme_id}`}
        >
          <span>{m.match.explore}</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </GlassCard>
  );
}
