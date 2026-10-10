import React from "react";
import type { Metadata } from "next";
import { getMessages } from "@/i18n/server";
import { ProfileForm } from "@/features/user-profile/components/ProfileForm";
import { ProfileEditor } from "@/features/user-profile/components/ProfileEditor";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return { title: m.meta.profile, description: m.meta.profileDescription };
}

export default async function ProfilePage() {
  const m = await getMessages();
  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      <div className="page-heading">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {m.profilePage.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          {m.profilePage.title}<span className="text-emerald-700">.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          {m.profilePage.lead}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ProfileForm />
        <ProfileEditor />
      </div>
    </div>
  );
}
