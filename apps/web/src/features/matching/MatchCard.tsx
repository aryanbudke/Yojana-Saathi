"use client";
import { useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SourceLink } from "@/components/ui";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import type { SchemeMatch } from "@/lib/api/contracts";
import { displayDate } from "@/lib/format";
import { EligibilityBadge } from "./EligibilityBadge";
import { RuleChecklist } from "./RuleChecklist";
export function MatchCard({ match }: { match: SchemeMatch }) {
  const load = useCallback(
    () => api.detail(match.scheme_id),
    [match.scheme_id],
  );
  const d = useResource(load);
  const current =
    d.data?.scheme_version_id === match.scheme_version_id ? d.data : null;
  return (
    <article className="panel match-card">
      <div className="row">
        <EligibilityBadge status={match.status} />
        {current && <span className="small muted">{current.category}</span>}
      </div>
      <h2>
        <Link href={`/schemes/${match.scheme_id}`}>{match.scheme_name}</Link>
      </h2>
      {current && (
        <>
          <p className="muted match-summary">{current.summary}</p>
          <div className="benefit-line">
            <span>SUPPORT AT A GLANCE</span>
            <p>{current.benefit_text}</p>
          </div>
        </>
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
        <summary>Why this match?</summary>
        <div>
          <p>
            These are the service’s checks for the reviewed scheme version. An
            unknown condition still needs information. Passing these checks does
            not mean official approval.
          </p>
          <p className="small muted">
            Last verified on {displayDate(match.last_verified_at)} · Version{" "}
            {match.scheme_version_id}
          </p>
          {match.official_source_urls.map((url) => (
            <SourceLink key={url} url={url} />
          ))}
        </div>
      </details>
      <div className="scheme-card-footer">
        <span className="small muted">
          {match.unknown_rules.length
            ? `${match.unknown_rules.length} condition${match.unknown_rules.length === 1 ? "" : "s"} still unknown`
            : "Read every condition before applying"}
        </span>
        <Link className="button quiet" href={`/schemes/${match.scheme_id}`}>
          Explore this scheme
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
