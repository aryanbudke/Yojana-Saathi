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
import { labelFor } from "@/lib/format";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { useMatching } from "@/features/matching/hooks";
import { useProfile } from "@/features/profile/hooks";
import { RuleChecklist } from "@/features/matching/RuleChecklist";
import { EligibilityBadge } from "@/features/matching/EligibilityBadge";
import { ReadAloudButton } from "@/features/speech/SpeechControls";
export function SchemeDetail({ id }: { id: string }) {
  const m = useMessages();
  const t = m.scheme;
  const date = useDisplayDate();
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
          {t.backToDiscovery}
        </Link>
        <InlineAlert error>{r.error || t.unavailable}</InlineAlert>
        <Button variant="secondary" onClick={r.retry}>
          {m.common.tryAgain}
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
          {p.confirmed ? t.backToRecommendations : t.backToDiscovery}
        </Link>
        <div className="row">
          <Badge>{labelFor(m.categoryNames, scheme.category)}</Badge>
          <Badge>
            {format(m.common.schemeLevel, {
              level: m.governmentLevel[scheme.government_level],
            })}
          </Badge>
          <Badge tone={scheme.status === "active" ? "success" : "warning"}>
            {scheme.status === "active"
              ? m.common.active
              : scheme.status === "closed"
                ? m.common.applicationsClosed
                : m.common.applicationStatusUnknown}
          </Badge>
          {match && <EligibilityBadge status={match.status} />}
        </div>
        <h1>{scheme.name}</h1>
        <p className="muted">{scheme.summary}</p>
        <ReadAloudButton
          text={`${scheme.name}. ${scheme.summary} Benefits: ${scheme.benefit_text}`}
        />
        <p className="verification">
          <ShieldCheck size={15} />
          {format(m.common.lastVerifiedOn, {
            date: date(scheme.last_verified_at),
          })}
        </p>
      </header>
      {scheme.review_status !== "verified" && (
        <InlineAlert>
          {format(t.manualVerification, {
            status: m.reviewStatus[scheme.review_status],
          })}
        </InlineAlert>
      )}
      <div className="detail-layout">
        <div className="stack">
          <section className="panel">
            <p className="eyebrow">{t.supportEyebrow}</p>
            <h2>{t.benefits}</h2>
            <p className="detail-copy">{scheme.benefit_text}</p>
          </section>
          <details className="panel detail-section" open>
            <summary>
              <BookOpen size={18} />
              <h2>{t.eligibility}</h2>
            </summary>
            <div>
              <p className="small muted">{t.eligibilityNote}</p>
              {required.map((rule) => (
                <article key={rule.rule_key} className="criteria-detail">
                  <Badge
                    tone={
                      rule.severity === "manual_review" ? "info" : "neutral"
                    }
                  >
                    {rule.severity === "manual_review"
                      ? m.ruleResults.manual_review
                      : t.requiredCondition}
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
                  <h3>{t.exclusions}</h3>
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
                <p className="small muted">{t.noExclusions}</p>
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
                  {t.notCheckedBefore}{" "}
                  <Link className="text-link" href="/discover">
                    {t.notCheckedLink}
                  </Link>{" "}
                  {t.notCheckedAfter}
                </InlineAlert>
              )}
            </div>
          </details>
          <details className="panel detail-section">
            <summary>
              <FileText size={18} />
              <h2>{t.documents}</h2>
            </summary>
            <div>
              {scheme.required_documents.length ? (
                <ul className="document-summary">
                  {scheme.required_documents.map((doc, i) => (
                    <li key={i}>
                      <strong>{doc.name}</strong>
                      {doc.when_required && (
                        <p className="small muted">{t.conditional}</p>
                      )}
                      <SourceLink url={doc.source.official_url}>
                        {doc.source.title}
                      </SourceLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <InlineAlert>{t.noDocuments}</InlineAlert>
              )}
            </div>
          </details>
          <details className="panel detail-section" id="application-steps">
            <summary>
              <ArrowUpRight size={18} />
              <h2>{t.howToApply}</h2>
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
                              {m.common.officialStepPage}
                            </SourceLink>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              ) : (
                <InlineAlert>{t.noSteps}</InlineAlert>
              )}
              <p className="small muted">{t.portalNote}</p>
            </div>
          </details>
        </div>
        <aside className="stack">
          <section className="panel source-panel">
            <p className="eyebrow">{t.sourcesEyebrow}</p>
            <h2>{t.sources}</h2>
            <p className="small muted">{t.sourcesNote}</p>
            {scheme.official_sources.map((source) => (
              <article key={source.id}>
                <h3>{source.title}</h3>
                <p>{source.excerpt_locator}</p>
                <p>
                  {format(m.common.checkedOn, {
                    date: date(source.checked_at),
                  })}
                </p>
                {source.document_date && (
                  <p>
                    {format(m.common.documentDate, {
                      date: date(source.document_date),
                    })}
                  </p>
                )}
                <SourceLink url={source.official_url}>
                  {t.readOriginal}
                </SourceLink>
              </article>
            ))}
            <p className="small muted version-note">
              {format(t.version, { version: scheme.scheme_version_id })}
            </p>
          </section>
          <div className="next-step-note">
            <h3>{t.prepareTitle}</h3>
            <p>{t.prepareText}</p>
            <Link
              href={`/schemes/${id}/apply`}
              className="button secondary wide"
            >
              {t.prepareLink}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
