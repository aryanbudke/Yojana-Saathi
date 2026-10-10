import React from "react";
import type { Metadata } from "next";
import { ProfileForm } from "@/features/user-profile/components/ProfileForm";
import { ProfileEditor } from "@/features/user-profile/components/ProfileEditor";

export const metadata: Metadata = {
  title: "My Profile — yojana saathi",
  description: "Review and edit your profile details for scheme matching.",
};

export default function ProfilePage() {
  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      <div className="page-heading">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Anonymous session
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Your Profile &amp; Preferences<span className="text-emerald-700">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Your details are stored in this browser tab only. Review and adjust
          extracted facts to ensure accurate scheme eligibility matching.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ProfileForm />
        <ProfileEditor />
      </div>
    </div>
  );
}
