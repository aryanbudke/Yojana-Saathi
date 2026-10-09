"use client";
import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import {
  Badge,
  Button,
  InlineAlert,
  Skeleton,
  SourceLink,
} from "@/components/ui";
import { displayDate, humanize } from "@/lib/format";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { useMatching } from "@/features/matching/hooks";
import { useProfile } from "@/features/profile/hooks";
import { RuleChecklist } from "@/features/matching/RuleChecklist";
import { verdictLabels } from "@/features/matching/types";
export function SchemeDetail({ id }: { id: string }) {
  const load = useCallback(() => api.detail(id), [id]);
  const r = useResource(load);
  const matching = useMatching();
  const p = useProfile();
  const match =
    p.confirmed &&
    matching.key ===
      JSON.stringify({ sessionId: p.session?.session_id, facts: p.draft.facts })
      ? matching.matches?.results.find(
          (m) =>
            m.scheme_id === id &&
            m.scheme_version_id === r.data?.scheme_version_id,
        )
      : undefined;
  if (r.loading)
    return (
      <>
        <ModeNotice />
        <div className="page-heading">
          <Skeleton />
        </div>
      </>
    );
  if (r.error || !r.data)
    return (
      <>
        <ModeNotice />
        <Link className="back-link" href="/discover#browse">
          <ArrowLeft size={16} />
          Back to discovery
        </Link>
        <InlineAlert error>
          {r.error || "Scheme details are unavailable."}
        </InlineAlert>
        <Button variant="secondary" onClick={r.retry}>
          Try again
        </Button>
      </>
    );
  const scheme = r.data;
  const required = scheme.eligibility_rules.filter(
    (rule) => rule.severity !== "exclusion",
  );
  const exclusions = scheme.eligibility_rules.filter(
    (rule) => rule.severity === "exclusion",
  );
  return (
    <>
      <ModeNotice />
      <header className="page-heading detail-heading">
        <Link
          className="back-link"
          href={p.confirmed ? "/recommendations" : "/discover#browse"}
        >
          <ArrowLeft size={16} />
          {p.confirmed ? "Back to my recommendations" : "Back to discovery"}
        </Link>
        <div className="row">
          <Badge>{humanize(scheme.category)}</Badge>
          <Badge>{humanize(scheme.government_level)} scheme</Badge>
          <Badge tone={scheme.status === "active" ? "success" : "warning"}>
            {scheme.status === "active"
              ? "Active"
              : scheme.status === "closed"
                ? "Applications closed"
                : "Application status unknown"}
          </Badge>
          {match && (
            <Badge tone={verdictLabels[match.status].tone}>
              {verdictLabels[match.status].text}
            </Badge>
          )}
        </div>
        <h1>{scheme.name}</h1>
        <p className="muted">{scheme.summary}</p>
        <p className="verification">
          <ShieldCheck size={15} />
          Last verified on {displayDate(scheme.last_verified_at)}
        </p>
      </header>
      {scheme.review_status !== "verified" && (
        <InlineAlert>
          Manual verification required. This source is{" "}
          {humanize(scheme.review_status).toLowerCase()}; check the current
          requirements with the official authority.
        </InlineAlert>
      )}
      <div className="detail-layout">
        <div className="stack">
          <section className="panel">
            <p className="eyebrow">The support</p>
            <h2>Benefits at a glance</h2>
            <p className="detail-copy">{scheme.benefit_text}</p>
          </section>
          <details className="panel detail-section" open>
            <summary>
              <BookOpen size={18} />
              <h2>Eligibility & exclusions</h2>
            </summary>
            <div>
              <p className="small muted">
                Conditions come from the reviewed source. Your checked outcomes
                appear only when available for this exact version.
              </p>
              {required.map((rule) => (
                <article key={rule.rule_key} className="criteria-detail">
                  <Badge
                    tone={
                      rule.severity === "manual_review" ? "info" : "neutral"
                    }
                  >
                    {rule.severity === "manual_review"
                      ? "Manual review"
                      : "Required condition"}
                  </Badge>
                  <p>{rule.explanation}</p>
                  <SourceLink url={rule.source.official_url}>
                    {rule.source.title}
                  </SourceLink>
                  <p className="citation-locator">
                    {rule.source.excerpt_locator}
                  </p>
                </article>
              ))}
              {exclusions.length ? (
                <>
                  <h3>Exclusions</h3>
                  {exclusions.map((rule) => (
                    <article key={rule.rule_key} className="criteria-detail">
                      <p>{rule.explanation}</p>
                      <SourceLink url={rule.source.official_url}>
                        {rule.source.title}
                      </SourceLink>
                    </article>
                  ))}
                </>
              ) : (
                <p className="small muted">
                  No separate exclusion entries were supplied. This is not a
                  guarantee that no exclusions apply.
                </p>
              )}
              {match ? (
                <RuleChecklist
                  rules={[
                    ...match.matched_rules,
                    ...match.failed_rules,
                    ...match.unknown_rules,
                    ...match.manual_review_rules,
                  ]}
                  sources={scheme.official_sources}
                />
              ) : (
                <InlineAlert>
                  Your profile has not been checked against this scheme version.{" "}
                  <Link className="text-link" href="/discover">
                    Review your profile
                  </Link>{" "}
                  to get matching results.
                </InlineAlert>
              )}
            </div>
          </details>
          <details className="panel detail-section">
            <summary>
              <FileText size={18} />
              <h2>Documents</h2>
            </summary>
            <div>
              {scheme.required_documents.length ? (
                <ul className="document-summary">
                  {scheme.required_documents.map((doc, i) => (
                    <li key={i}>
                      <strong>{doc.name}</strong>
                      {doc.when_required && (
                        <p className="small muted">
                          Conditional requirement. Confirm whether it applies to
                          your situation.
                        </p>
                      )}
                      <SourceLink url={doc.source.official_url}>
                        {doc.source.title}
                      </SourceLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <InlineAlert>
                  Document requirements have not been supplied. Confirm them
                  with the official authority.
                </InlineAlert>
              )}
            </div>
          </details>
          <details className="panel detail-section" id="application-steps">
            <summary>
              <ArrowUpRight size={18} />
              <h2>How to apply</h2>
            </summary>
            <div>
              {scheme.application_steps.length ? (
                <ol className="application-steps">
                  {[...scheme.application_steps]
                    .sort((a, b) => a.step_number - b.step_number)
                    .map((step) => (
                      <li key={step.step_number}>
                        <span className="step-number">{step.step_number}</span>
                        <div>
                          <p>{step.instruction}</p>
                          <SourceLink url={step.source.official_url}>
                            {step.source.title}
                          </SourceLink>
                          {step.official_url && (
                            <SourceLink url={step.official_url}>
                              Official step page
                            </SourceLink>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              ) : (
                <InlineAlert>
                  Verified application steps are unavailable. Please confirm the
                  process with the official authority.
                </InlineAlert>
              )}
              <p className="small muted">
                Applications take place on the official portal. Yojana Saathi
                does not submit applications.
              </p>
            </div>
          </details>
        </div>
        <aside className="stack">
          <section className="panel source-panel">
            <p className="eyebrow">Trace it to the source</p>
            <h2>Official sources</h2>
            <p className="small muted">
              Check the original policy and its latest updates.
            </p>
            {scheme.official_sources.map((source) => (
              <article key={source.id}>
                <h3>{source.title}</h3>
                <p>{source.excerpt_locator}</p>
                <p>Checked on {displayDate(source.checked_at)}</p>
                {source.document_date && (
                  <p>Document date: {displayDate(source.document_date)}</p>
                )}
                <SourceLink url={source.official_url}>
                  Read original source
                </SourceLink>
              </article>
            ))}
            <p className="small muted version-note">
              Scheme version: {scheme.scheme_version_id}
            </p>
          </section>
          <div className="next-step-note">
            <h3>Prepare with clarity</h3>
            <p>
              Keep track of requirements before you visit the official portal.
              Never upload identity documents here.
            </p>
            <Link
              href={`/schemes/${id}/apply`}
              className="button secondary wide"
            >
              Prepare my checklist
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
