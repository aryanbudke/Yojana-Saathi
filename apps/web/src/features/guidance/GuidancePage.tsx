"use client";
import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Printer, ClipboardList } from "lucide-react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import {
  Button,
  InlineAlert,
  Skeleton,
  SourceLink,
  safeOfficialUrl,
} from "@/components/ui";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { useProfile } from "@/features/profile/hooks";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { DocumentChecklist } from "./DocumentChecklist";
import { ReadAloudButton } from "@/features/speech/SpeechControls";
import { EligibilityVerificationPanel } from "./EligibilityVerificationPanel";
export function GuidancePage({ id }: { id: string }) {
  const m = useMessages();
  const t = m.guidance;
  const date = useDisplayDate();
  const profile = useProfile();
  const sessionId = profile.confirmed ? profile.session?.session_id : undefined;
  const load = useCallback(async () => {
    const [scheme, guidance] = await Promise.all([
      api.detail(id),
      api.guidance(id, sessionId),
    ]);
    return { scheme, guidance };
  }, [id, sessionId]);
  const r = useResource(load);
  return (
    <>
      <ModeNotice />
      <section className="page-heading">
        <Link className="back-link" href={`/schemes/${id}`}>
          <ArrowLeft size={16} />
          {t.back}
        </Link>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>
          {t.title}
          <span className="green">.</span>
        </h1>
        <p className="muted">{t.lead}</p>
      </section>
      {r.loading ? (
        <div className="stack">
          <Skeleton />
          <Skeleton />
        </div>
      ) : r.error || !r.data ? (
        <>
          <InlineAlert error>{r.error || t.unavailable}</InlineAlert>
          <Button onClick={r.retry}>{t.retry}</Button>
        </>
      ) : (
        (() => {
          const { scheme, guidance } = r.data;
          const sameVersion =
            scheme.scheme_version_id === guidance.scheme_version_id;
          const safe = safeOfficialUrl(guidance.official_application_url);
          const canApply =
            scheme.review_status === "verified" &&
            scheme.status === "active" &&
            sameVersion &&
            guidance.steps.length > 0 &&
            safe;
          return (
            <>
              <div className="guidance-title">
                <div>
                  <ClipboardList size={24} />
                  <h2>{guidance.scheme_name}</h2>
                </div>
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  {t.print}
                </Button>
              </div>
              <ReadAloudButton
                text={[
                  guidance.scheme_name,
                  ...guidance.unresolved_preconditions,
                  ...guidance.documents.map((document) => document.name),
                  ...guidance.steps.map((step) => step.instruction),
                  guidance.disclaimer,
                ].join(". ")}
              />
              {!sameVersion && <InlineAlert>{t.versionChanged}</InlineAlert>}
              {guidance.unresolved_preconditions.length > 0 && (
                <section className="alert">
                  <div>
                    <strong>{t.preconditions}</strong>
                    <ul>
                      {guidance.unresolved_preconditions.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
              <div className="detail-layout">
                <div className="stack">
                  <DocumentChecklist
                    key={guidance.scheme_version_id}
                    guidance={guidance}
                  />
                  <section className="panel">
                    <p className="eyebrow">{t.pathwayEyebrow}</p>
                    <h2>{t.steps}</h2>
                    {guidance.steps.length ? (
                      <ol className="application-steps">
                        {[...guidance.steps]
                          .sort((a, b) => a.step_number - b.step_number)
                          .map((step) => {
                            const source = guidance.sources.find(
                              (s) => s.id === step.source_id,
                            );
                            return (
                              <li key={step.step_number}>
                                <span className="step-number">
                                  {step.step_number}
                                </span>
                                <div>
                                  <p>{step.instruction}</p>
                                  {source ? (
                                    <SourceLink url={source.official_url}>
                                      {source.title}
                                    </SourceLink>
                                  ) : (
                                    <p className="source-unavailable">
                                      {t.sourceUnavailable}
                                    </p>
                                  )}
                                  {step.official_url && (
                                    <SourceLink url={step.official_url}>
                                      {m.common.officialStepPage}
                                    </SourceLink>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                      </ol>
                    ) : (
                      <InlineAlert>{t.noSteps}</InlineAlert>
                    )}
                  </section>
                </div>
                <aside className="stack">
                  <EligibilityVerificationPanel schemeId={id} />
                  <section className="panel application-portal">
                    <p className="eyebrow">{t.readyEyebrow}</p>
                    <h2>{t.readyTitle}</h2>
                    <p>{t.readyText}</p>
                    {canApply ? (
                      <a
                        className="button primary wide"
                        href={safe}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.apply}
                        <ExternalLink size={16} />
                        <span className="sr-only">
                          {m.common.opensInNewTab}
                        </span>
                      </a>
                    ) : (
                      <InlineAlert>
                        {scheme.status === "closed"
                          ? t.closed
                          : scheme.status === "unknown"
                            ? t.windowUnknown
                            : t.linkUnverified}{" "}
                        {t.confirmProcess}
                      </InlineAlert>
                    )}
                    <p className="small muted">
                      {format(m.common.lastVerifiedOn, {
                        date: date(scheme.last_verified_at),
                      })}
                    </p>
                  </section>
                  <section className="panel source-panel">
                    <h3>{t.sourcesTitle}</h3>
                    {guidance.sources.map((source) => (
                      <article key={source.id}>
                        <SourceLink url={source.official_url}>
                          {source.title}
                        </SourceLink>
                        <p>{source.excerpt_locator}</p>
                        <p>
                          {format(m.common.checkedOn, {
                            date: date(source.checked_at),
                          })}
                        </p>
                      </article>
                    ))}
                  </section>
                </aside>
              </div>
              <p className="disclaimer guidance-disclaimer">
                {guidance.disclaimer}
              </p>
            </>
          );
        })()
      )}
    </>
  );
}
