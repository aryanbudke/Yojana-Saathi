"use client";

import { useProfile } from "@/features/profile/hooks";
import { fields, states } from "@/features/profile/types";
import { Recommendations } from "@/features/matching/Recommendations";
import { humanize } from "@/lib/format";

export function MatchingPreview() {
  const p = useProfile();
  return (
    <aside className="matching-preview" aria-labelledby="preview-title">
      <div className="section-heading">
        <h2 id="preview-title">Your matching preview</h2>
      </div>
      <p className="muted">
        {p.confirmed
          ? "Checked against your confirmed details. Government authorities make final decisions."
          : "Review your details before any scheme conditions are checked."}
      </p>
      <dl className="preview-facts">
        {fields.slice(0, 6).map(({ key, label }) => {
          const value = p.draft.facts[key];
          return (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {value === null
                  ? "Unknown"
                  : key === "state_code"
                    ? (states.find(([code]) => code === value)?.[1] ??
                      String(value))
                    : key === "land_registration"
                      ? humanize(String(value))
                      : String(value)}
              </dd>
            </div>
          );
        })}
      </dl>
      {p.confirmed ? (
        <Recommendations embedded />
      ) : (
        <div className="preview-empty">
          <h3>
            {p.reviewing ? "Ready for your review" : "Start with your story"}
          </h3>
          <p>
            {p.reviewing
              ? "Correct the extracted details and confirm them to see matches and useful follow-up questions."
              : "Your extracted details, rule checks and follow-up question will appear here. No eligibility is assumed."}
          </p>
        </div>
      )}
    </aside>
  );
}
