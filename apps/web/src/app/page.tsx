import { ModeNotice } from "@/features/profile/ProfileComposer";
import { FeatureStrip } from "@/features/landing/FeatureStrip";
import { HeroSection } from "@/features/landing/HeroSection";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { SchemeFinder } from "@/features/landing/SchemeFinder";
import { PopularCategories } from "@/features/landing/PopularCategories";
import { OfficialSources } from "@/features/landing/OfficialSources";

export default function Home() {
  return (
    <>
      <ModeNotice />
      <HeroSection />
      <FeatureStrip />
      <HowItWorks />
      <SchemeFinder />
      <PopularCategories />
      <OfficialSources />
    </>
  );
}
