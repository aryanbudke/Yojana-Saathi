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
import { displayDate } from "@/lib/format";
import { DocumentChecklist } from "./DocumentChecklist";
export function GuidancePage({ id }: { id: string }) {
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
          Back to scheme
        </Link>
        <p className="eyebrow">A prepared next step</p>
        <h1>
          Know what to take. Know where to go<span className="green">.</span>
        </h1>
        <p className="muted">
          Application guidance, with a checklist you can work through at your
          pace.
        </p>
      </section>
      {r.loading ? (
        <div className="stack">
          <Skeleton />
          <Skeleton />
        </div>
      ) : r.error || !r.data ? (
        <>
          <InlineAlert error>
            {r.error || "Guidance is unavailable."}
          </InlineAlert>
          <Button onClick={r.retry}>Retry guidance</Button>
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
                  Print checklist
                </Button>
              </div>
              {!sameVersion && (
                <InlineAlert>
                  Scheme information changed between requests. Refresh this page
                  before relying on these steps.
                </InlineAlert>
              )}
              {guidance.unresolved_preconditions.length > 0 && (
                <section className="alert">
                  <div>
                    <strong>Before you apply, check these details</strong>
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
                    <p className="eyebrow">The official pathway</p>
                    <h2>Application steps</h2>
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
                                      Source reference unavailable.
                                    </p>
                                  )}
                                  {step.official_url && (
                                    <SourceLink url={step.official_url}>
                                      Official step page
                                    </SourceLink>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                      </ol>
                    ) : (
                      <InlineAlert>
                        Verified steps are unavailable. Confirm the process with
                        the government authority.
                      </InlineAlert>
                    )}
                  </section>
                </div>
                <aside className="stack">
                  <section className="panel application-portal">
                    <p className="eyebrow">When you’re ready</p>
                    <h2>The next step is yours</h2>
                    <p>
                      Applications are handled by the government’s official
                      portal. We help you prepare; we do not submit or approve
                      applications.
                    </p>
                    {canApply ? (
                      <a
                        className="button primary wide"
                        href={safe}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply on official portal
                        <ExternalLink size={16} />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <InlineAlert>
                        {scheme.status === "closed"
                          ? "Applications are closed."
                          : scheme.status === "unknown"
                            ? "The application window is unknown."
                            : "An application link could not be verified."}{" "}
                        Confirm the current process with the official authority.
                      </InlineAlert>
                    )}
                    <p className="small muted">
                      Last verified on {displayDate(scheme.last_verified_at)}
                    </p>
                  </section>
                  <section className="panel source-panel">
                    <h3>Sources behind these steps</h3>
                    {guidance.sources.map((source) => (
                      <article key={source.id}>
                        <SourceLink url={source.official_url}>
                          {source.title}
                        </SourceLink>
                        <p>{source.excerpt_locator}</p>
                        <p>Checked on {displayDate(source.checked_at)}</p>
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
