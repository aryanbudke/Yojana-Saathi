import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { Discovery } from "@/features/discovery/Discovery";
import {
  ModeNotice,
  ProfileComposer,
} from "@/features/profile/ProfileComposer";
import { FeatureStrip } from "@/features/landing/FeatureStrip";
import { HeroSection } from "@/features/landing/HeroSection";

export default function Home() {
  return (
    <>
      <ModeNotice />
      <HeroSection />
      <FeatureStrip />
      {/* SR-05 replaces this with the scheme finder and matching preview. */}
      <section
        id="finder"
        className="home-workspace"
        aria-label="Scheme finder"
      >
        <ProfileComposer />
        <Suspense fallback={<Skeleton />}>
          <Discovery />
        </Suspense>
      </section>
    </>
  );
}
