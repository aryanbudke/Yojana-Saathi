import {
  ModeNotice,
  ProfileComposer,
} from "@/features/profile/ProfileComposer";
import { Discovery } from "@/features/discovery/Discovery";
import { Skeleton } from "@/components/ui";
import { MessageSquare, ListChecks, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <ModeNotice />
      <section className="home-heading" aria-labelledby="home-title">
        <p className="eyebrow">Government schemes, made simple.</p>
        <h1 id="home-title">
          Support you didn’t know you had<span className="green">.</span>
        </h1>
        <p>
          Tell us a little about yourself. Discover relevant government schemes,
          understand your eligibility, and find your next step.
        </p>
      </section>
      <div className="home-workspace">
        <ProfileComposer />
        <Suspense fallback={<Skeleton />}>
          <Discovery />
        </Suspense>
      </div>
      <section className="workflow-strip" aria-label="How it works">
        {[
          {
            icon: MessageSquare,
            title: "Tell your story",
            text: "Share a few details. Review and correct what we understand.",
          },
          {
            icon: ListChecks,
            title: "Understand your options",
            text: "See which conditions match and what still needs checking.",
          },
          {
            icon: ArrowUpRight,
            title: "Take the next step",
            text: "Prepare your checklist and visit the official portal.",
          },
        ].map(({ icon: Icon, title, text }, index) => (
          <div key={title}>
            <span className="workflow-icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <span className="workflow-number">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
