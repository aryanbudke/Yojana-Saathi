"use client";
import { useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import { Button, EmptyState, InlineAlert, Skeleton } from "@/components/ui";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { labelFor } from "@/lib/format";

// ponytail: first catalogue page only; link out to /discover for the rest. Paginate if the catalogue outgrows one page.
const query = new URLSearchParams({ limit: "20" });

/** Real catalogue schemes, each linking to its source-backed checklist. Nothing here is written by hand. */
export function GuideSchemes() {
  const m = useMessages();
  const t = m.guidePage;
  const date = useDisplayDate();
  const load = useCallback(() => api.schemes(query), []);
  const r = useResource(load);
  return (
    <section className="guide-schemes" aria-labelledby="guide-schemes-title">
      <div className="section-heading">
        <div>
          <h2 id="guide-schemes-title">{t.schemesTitle}</h2>
          <p className="small muted">{t.schemesLead}</p>
        </div>
      </div>
      {r.loading ? (
        <div className="scheme-grid">
          <Skeleton />
          <Skeleton />
        </div>
      ) : r.error ? (
        <>
          <InlineAlert error>{r.error}</InlineAlert>
          <Button variant="secondary" onClick={r.retry}>
            {m.common.tryAgain}
          </Button>
        </>
      ) : r.data?.items.length ? (
        <ul className="guide-scheme-list">
          {r.data.items.map((scheme) => (
            <li key={scheme.id} className="panel">
              <div>
                <p className="small muted">
                  {labelFor(m.categoryNames, scheme.category)} ·{" "}
                  {format(m.common.lastVerifiedOn, {
                    date: date(scheme.last_verified_at),
                  })}
                </p>
                <h3>
                  <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
                </h3>
              </div>
              <Link
                className="button secondary"
                href={`/schemes/${scheme.id}/apply`}
              >
                <ClipboardList size={16} aria-hidden="true" />
                {t.prepare}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t.empty}>
          <Link className="button secondary" href="/discover#browse">
            {t.browseAll}
          </Link>
        </EmptyState>
      )}
      {r.data?.next_cursor && (
        <Link className="text-link guide-browse-all" href="/discover#browse">
          {t.browseAll}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
