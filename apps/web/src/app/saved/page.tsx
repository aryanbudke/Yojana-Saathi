import React from "react";
import type { Metadata } from "next";
import { SavedSchemesList } from "@/features/saved-schemes/components/SavedSchemesList";

export const metadata: Metadata = {
  title: "Saved Schemes — yojana saathi",
  description: "Your bookmarked government schemes and application checklists.",
};

export default function SavedPage() {
  return (
    <div className="py-8 space-y-8">
      <div className="page-heading">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Bookmarked items
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Saved Schemes<span className="text-emerald-700">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Access your saved schemes anytime. Remember to verify deadlines and
          requirements on each official portal before applying.
        </p>
      </div>

      <SavedSchemesList />
    </div>
  );
}
