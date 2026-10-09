import Link from "next/link";
import { ArrowUpRight, Landmark } from "lucide-react";
import { categories } from "./types";
import { Badge, SourceLink } from "@/components/ui";
import type { SchemeSummary } from "@/lib/api/contracts";
import { displayDate, humanize } from "@/lib/format";
export function SchemeCard({ scheme }: { scheme: SchemeSummary }) {
  const Icon =
    categories.find((c) => c.value === scheme.category)?.icon ?? Landmark;
  return (
    <article className="panel scheme-card">
      <div className="scheme-card-top">
        <span className="category-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="row">
          <Badge>{humanize(scheme.category)}</Badge>
          <Badge tone={scheme.status === "active" ? "success" : "warning"}>
            {scheme.status === "active"
              ? "Active"
              : scheme.status === "closed"
                ? "Closed"
                : "Application status unknown"}
          </Badge>
        </div>
      </div>
      <h3>
        <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
      </h3>
      <p className="muted">{scheme.summary}</p>
      <div className="scheme-meta">
        <span>{humanize(scheme.government_level)} scheme</span>
        <span>Last verified on {displayDate(scheme.last_verified_at)}</span>
      </div>
      {scheme.review_status !== "verified" && (
        <Badge tone="warning">
          Manual verification required · {humanize(scheme.review_status)}
        </Badge>
      )}
      <div className="scheme-card-footer">
        <SourceLink url={scheme.official_sources[0].official_url} />
        <Link className="button quiet" href={`/schemes/${scheme.id}`}>
          View details
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
