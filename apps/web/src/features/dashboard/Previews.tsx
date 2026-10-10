"use client";

import Link from "next/link";
import { useCallback } from "react";
import { ArrowUpRight, Bookmark, FileCheck2 } from "lucide-react";
import {
  Badge,
  Button,
  GlassCard,
  InlineAlert,
  Skeleton,
  SourceLink,
} from "@/components/ui";
import { SaveSchemeButton } from "@/features/saved-schemes/components/SaveSchemeButton";
import { useSavedSchemes } from "@/features/saved-schemes/hooks/useSavedSchemes";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { labelFor } from "@/lib/format";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";

export function CataloguePreview() {
  const m = useMessages();
  const t = m.dashboard;
  const date = useDisplayDate();
  const load = useCallback(
    () => api.schemes(new URLSearchParams({ limit: "3" })),
    [],
  );
  const resource = useResource(load);
  return (
    <GlassCard
      as="section"
      className="dashboard-panel dashboard-catalogue"
      aria-labelledby="catalogue-title"
    >
      <div className="dashboard-section-heading">
        <div>
          <p className="section-eyebrow">{t.catalogueEyebrow}</p>
          <h2 id="catalogue-title">{t.catalogueTitle}</h2>
        </div>
        <Link className="text-link" href="/discover#browse">
          {t.browseAll}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <p className="muted small">{t.catalogueLead}</p>
      {resource.loading ? (
        <Skeleton />
      ) : resource.error ? (
        <div className="stack">
          <InlineAlert error>{resource.error}</InlineAlert>
          <Button variant="secondary" onClick={resource.retry}>
            {t.retryCatalogue}
          </Button>
        </div>
      ) : resource.data?.items.length ? (
        <div className="dashboard-catalogue-list">
          {resource.data.items.slice(0, 3).map((scheme) => (
            <article key={scheme.id}>
              <span className="dashboard-icon">
                <FileCheck2 size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="small muted">
                  {m.governmentLevel[scheme.government_level]} ·{" "}
                  {labelFor(m.categoryNames, scheme.category)}
                </p>
                <h3>
                  <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
                </h3>
                <p className="small muted">{scheme.summary}</p>
                <div className="dashboard-source">
                  <span>
                    {format(m.common.lastVerifiedOn, {
                      date: date(scheme.last_verified_at),
                    })}
                  </span>
                  <SourceLink url={scheme.official_sources[0].official_url} />
                </div>
                <SaveSchemeButton scheme={scheme} />
              </div>
              <Link
                className="dashboard-arrow"
                href={`/schemes/${scheme.id}`}
                aria-label={format(t.readAbout, { name: scheme.name })}
              >
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="dashboard-inline-empty">{t.catalogueEmpty}</p>
      )}
    </GlassCard>
  );
}

export function SavedPreview() {
  const { saved } = useSavedSchemes();
  const m = useMessages();
  const t = m.dashboard;
  return (
    <GlassCard
      as="section"
      className="dashboard-panel dashboard-saved"
      id="dashboard-saved"
      aria-labelledby="dashboard-saved-title"
    >
      <div className="dashboard-section-heading">
        <div className="dashboard-saved-title">
          <Bookmark size={19} aria-hidden="true" />
          <h2 id="dashboard-saved-title">{m.saved.title}</h2>
        </div>
        <Badge tone="neutral">{saved.length}</Badge>
      </div>
      <p className="small muted">{t.savedLead}</p>
      {saved.length ? (
        <ul className="dashboard-saved-list">
          {saved.slice(0, 3).map((scheme) => (
            <li key={scheme.id}>
              <Link href={`/schemes/${scheme.id}`}>
                <span>{scheme.name}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-inline-empty">{t.savedEmpty}</p>
      )}
      <Link className="text-link" href="/saved">
        {t.viewSaved}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}
