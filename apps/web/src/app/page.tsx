import React from "react";
import { MockModeBanner } from "@/components/layout/MockModeBanner";
import { HeroSection } from "@/features/home/components/HeroSection";
import { BenefitsStrip } from "@/features/home/components/BenefitsStrip";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { SchemeFinder } from "@/features/landing/SchemeFinder";
import { PopularCategories } from "@/features/landing/PopularCategories";
import { TrustedSources } from "@/features/home/components/TrustedSources";
import { ApplicationGuidance } from "@/features/landing/ApplicationGuidance";

export default function Home() {
  return (
    <div>
      <MockModeBanner />
      <div className="space-y-12">
        <HeroSection />
        <BenefitsStrip />
        <HowItWorks />
        <SchemeFinder />
        <PopularCategories />
        <TrustedSources />
        <ApplicationGuidance />
      </div>
    </div>
  );
}
