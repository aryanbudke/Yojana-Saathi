"use client";
import { useState } from "react";
import { Badge, SectionHeading, SourceLink } from "@/components/ui";
import type { Guidance } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
export function DocumentChecklist({ guidance }: { guidance: Guidance }) {
  const m = useMessages();
  const t = m.checklist;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const total = guidance.documents.length;
  return (
    <section className="panel checklist">
      <p className="eyebrow">{t.eyebrow}</p>
      <SectionHeading title={t.title}>
        <Badge>{format(t.ready, { checked: checked.size, total })}</Badge>
      </SectionHeading>
      <p className="small muted">{t.note}</p>
      <div
        className="readiness-track"
        role="progressbar"
        aria-label={t.progressLabel}
        aria-valuemin={0}
        aria-valuemax={total || 1}
        aria-valuenow={checked.size}
      >
        <span
          style={{ width: total ? `${(checked.size / total) * 100}%` : "0%" }}
        />
      </div>
      {total ? (
        <ul>
          {guidance.documents.map((doc, index) => {
            const source = guidance.sources.find((s) => s.id === doc.source_id);
            return (
              <li key={`${doc.source_id}-${index}`}>
                <label className="checklist-label">
                  <input
                    type="checkbox"
                    checked={checked.has(index)}
                    onChange={(e) =>
                      setChecked((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(index);
                        else next.delete(index);
                        return next;
                      })
                    }
                  />
                  <span>
                    <strong>{doc.name}</strong>
                    <span className="small muted">{t.haveIt}</span>
                  </span>
                </label>
                <div className="document-note">
                  <Badge
                    tone={
                      doc.status === "missing"
                        ? "danger"
                        : doc.status === "present"
                          ? "success"
                          : "warning"
                    }
                  >
                    {m.documentStatus[doc.status]}
                  </Badge>
                  {doc.note && <p>{doc.note}</p>}
                  {source ? (
                    <SourceLink url={source.official_url}>
                      {source.title}
                    </SourceLink>
                  ) : (
                    <p className="source-unavailable">
                      {t.sourceUnavailable}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty">
          {t.empty}
        </p>
      )}
    </section>
  );
}
