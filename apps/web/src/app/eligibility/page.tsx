import React from "react";
import type { Metadata } from "next";
import { getMessages } from "@/i18n/server";
import { MatchResults } from "@/features/recommendations/components/MatchResults";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return { title: m.meta.eligibility, description: m.meta.eligibilityDescription };
}

export default async function EligibilityPage() {
  const m = await getMessages();
  return (
    <div className="py-8 space-y-8">
      <div className="page-heading">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {m.eligibilityPage.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          {m.eligibilityPage.title}<span className="text-emerald-700">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          {m.eligibilityPage.lead}
        </p>
      </div>

      <MatchResults />
    </div>
  );
}
