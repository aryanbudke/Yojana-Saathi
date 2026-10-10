import React from "react";
import type { Metadata } from "next";
import { MatchResults } from "@/features/recommendations/components/MatchResults";

export const metadata: Metadata = {
  title: "Eligibility Checks — yojana saathi",
  description: "Detailed eligibility criteria, rule results and preconditions.",
};

export default function EligibilityPage() {
  return (
    <div className="py-8 space-y-8">
      <div className="page-heading">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Rule-based analysis
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Eligibility &amp; Rule Explanations<span className="text-emerald-700">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          See which criteria pass, which fail, and which need manual verification
          based on your confirmed profile details.
        </p>
      </div>

      <MatchResults />
    </div>
  );
}
