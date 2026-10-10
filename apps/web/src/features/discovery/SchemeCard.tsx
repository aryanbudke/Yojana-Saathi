"use client";
import Link from "next/link";
import { ArrowUpRight, Landmark } from "lucide-react";
import { categories } from "./types";
import { Badge, SourceLink } from "@/components/ui";
import type { SchemeSummary } from "@/lib/api/contracts";
import { useDisplayDate, useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { labelFor } from "@/lib/format";

export function SchemeCard({ scheme }: { scheme: SchemeSummary }) {
  const m = useMessages();
  const date = useDisplayDate();
  const Icon =
    categories.find((c) => c.value === scheme.category)?.icon ?? Landmark;
  return (
    <article className="panel scheme-card">
      <div className="scheme-card-top">
        <span className="category-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="row">
          <Badge>{labelFor(m.categoryNames, scheme.category)}</Badge>
          <Badge tone={scheme.status === "active" ? "success" : "warning"}>
            {scheme.status === "active"
              ? m.common.active
              : scheme.status === "closed"
                ? m.common.closed
                : m.common.applicationStatusUnknown}
          </Badge>
        </div>
      </div>
      <h3>
        <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
      </h3>
      <p className="muted">{scheme.summary}</p>
      <div className="scheme-meta">
        <span>
          {format(m.common.schemeLevel, {
            level: m.governmentLevel[scheme.government_level],
          })}
        </span>
        <span>
          {format(m.common.lastVerifiedOn, {
            date: date(scheme.last_verified_at),
          })}
        </span>
      </div>
      {scheme.review_status !== "verified" && (
        <Badge tone="warning">
          {format(m.discover.manualVerification, {
            status: m.reviewStatus[scheme.review_status],
          })}
        </Badge>
      )}
      <div className="scheme-card-footer">
        <SourceLink url={scheme.official_sources[0].official_url} />
        <Link className="button quiet" href={`/schemes/${scheme.id}`}>
          {m.common.viewDetails}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
