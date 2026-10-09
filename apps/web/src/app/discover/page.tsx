import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui";
import { Discovery } from "@/features/discovery/Discovery";
import {
  ModeNotice,
  ProfileComposer,
} from "@/features/profile/ProfileComposer";

export const metadata: Metadata = {
  title: "Discover schemes — yojana saathi",
};

export default function DiscoverPage() {
  return (
    <>
      <ModeNotice />
      <section className="page-heading" aria-labelledby="discover-title">
        <p className="section-eyebrow">Discover schemes</p>
        <h1 id="discover-title">
          Find support that fits your situation
          <span className="green">.</span>
        </h1>
        <p className="muted">
          Describe your situation for a personal shortlist, or browse the
          catalogue by category and state.
        </p>
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
