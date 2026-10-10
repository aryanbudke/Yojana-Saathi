import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui";
import { Discovery } from "@/features/discovery/Discovery";
import {
  ModeNotice,
  ProfileComposer,
} from "@/features/profile/ProfileComposer";
import { getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getMessages()).meta.discover };
}

export default async function DiscoverPage() {
  const m = await getMessages();
  return (
    <>
      <ModeNotice />
      <section className="page-heading" aria-labelledby="discover-title">
        <p className="section-eyebrow">{m.discover.eyebrow}</p>
        <h1 id="discover-title">
          {m.discover.title}
          <span className="green">.</span>
        </h1>
        <p className="muted">{m.discover.lead}</p>
      </section>
      <div className="home-workspace">
        <ProfileComposer />
        <Suspense fallback={<Skeleton />}>
          <Discovery />
        </Suspense>
      </div>
    </>
  );
}
