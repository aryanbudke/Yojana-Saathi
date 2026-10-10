"use client";
import { useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SourceLink } from "@/components/ui";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import type { SchemeMatch } from "@/lib/api/contracts";
import { labelFor } from "@/lib/format";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { EligibilityBadge } from "./EligibilityBadge";
import { RuleChecklist } from "./RuleChecklist";
export function MatchCard({ match }: { match: SchemeMatch }) {
  const m = useMessages();
  const date = useDisplayDate();
  const load = useCallback(
    () =>
      match.verification_status === "preliminary"
        ? Promise.resolve(null)
        : api.detail(match.scheme_id),
    [match.scheme_id, match.verification_status],
  );
  const d = useResource(load);
  const current =
    d.data?.scheme_version_id === match.scheme_version_id ? d.data : null;
  return (
    <article className="panel match-card">
      <div className="row">
        <EligibilityBadge status={match.status} />
        {match.verification_status === "preliminary" && (
          <span className="small muted">{m.match.preliminaryLabel}</span>
        )}
        {current && (
          <span className="small muted">
            {labelFor(m.categoryNames, current.category)}
          </span>
        )}
      </div>
      <h2>
        {match.verification_status === "verified" ? (
          <Link href={`/schemes/${match.scheme_id}`}>{match.scheme_name}</Link>
        ) : (
          match.scheme_name
        )}
      </h2>
      {(current || match.benefit_text) && (
        <>
          {current && <p className="muted match-summary">{current.summary}</p>}
          <div className="benefit-line">
            <span>{m.match.supportAtAGlance}</span>
            <p>{current?.benefit_text ?? match.benefit_text}</p>
          </div>
        </>
      )}
      {match.documents_text && (
        <p className="small muted">
          <strong>{m.match.documents}:</strong> {match.documents_text}
        </p>
      )}
      {match.application_text && (
        <p className="small muted">
          <strong>{m.match.howToApply}:</strong> {match.application_text}
        </p>
      )}
      <RuleChecklist
        rules={[
          ...match.matched_rules,
          ...match.failed_rules,
          ...match.unknown_rules,
          ...match.manual_review_rules,
        ]}
        sources={current?.official_sources}
      />
      <details className="explanation">
        <summary>{m.match.why}</summary>
        <div>
          <p>
            {match.verification_status === "preliminary"
              ? m.match.preliminaryText
              : m.match.whyText}
          </p>
          {match.matching_reasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
          {match.last_verified_at ? (
            <p className="small muted">
              {format(m.match.verifiedVersion, {
                date: date(match.last_verified_at),
                version: match.scheme_version_id,
              })}
            </p>
          ) : (
            <p className="small muted">{m.match.noOfficialSource}</p>
          )}
          {match.official_source_urls.map((url) => (
            <SourceLink key={url} url={url} />
          ))}
        </div>
      </details>
      <div className="scheme-card-footer">
        <span className="small muted">
          {match.unknown_rules.length
            ? format(
                match.unknown_rules.length === 1
                  ? m.match.unknownOne
                  : m.match.unknownOther,
                { count: match.unknown_rules.length },
              )
            : m.match.readEvery}
        </span>
        {match.verification_status === "verified" && (
          <Link className="button quiet" href={`/schemes/${match.scheme_id}`}>
            {m.match.explore}
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
