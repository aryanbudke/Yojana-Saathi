"use client";
import { useState } from "react";
import { Badge, SourceLink } from "@/components/ui";
import type { Guidance } from "@/lib/api/contracts";
const labels = {
  present: "Reported present",
  missing: "Missing",
  unknown: "Unknown",
  may_be_required: "May be required",
};
export function DocumentChecklist({ guidance }: { guidance: Guidance }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const total = guidance.documents.length;
  return (
    <section className="panel checklist">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Get your documents together</p>
          <h2>Your personal checklist</h2>
        </div>
        <Badge>
          {checked.size} / {total} marked ready
        </Badge>
      </div>
      <p className="small muted">
        “I have it” is your own note. It does not verify a document or indicate
        government approval. These notes stay in this page only.
      </p>
      <div
        className="readiness-track"
        role="progressbar"
        aria-label="Documents marked ready by you"
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
                    <span className="small muted">I have it</span>
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
                    {labels[doc.status]}
                  </Badge>
                  {doc.note && <p>{doc.note}</p>}
                  {source ? (
                    <SourceLink url={source.official_url}>
                      {source.title}
                    </SourceLink>
                  ) : (
                    <p className="source-unavailable">
                      Source reference unavailable. Confirm the requirement with
                      the authority.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty">
          Document requirements are unavailable. Check the current official
          requirements.
        </p>
      )}
    </section>
  );
}
