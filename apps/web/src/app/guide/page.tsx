import type { Metadata } from "next";
import { ClipboardCheck, ExternalLink, Files, SearchCheck } from "lucide-react";
import { GuideSchemes } from "@/features/guidance/GuideSchemes";
import { getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return { title: m.guidePage.meta, description: m.guidePage.metaDescription };
}

const icons = [ClipboardCheck, Files, ExternalLink, SearchCheck];

/** Landing page for the Application guide nav item. Scheme-specific guidance stays at /schemes/[id]/apply. */
export default async function GuidePage() {
  const m = await getMessages();
  const t = m.guidePage;
  return (
    <>
      <section className="page-heading" aria-labelledby="guide-title">
        <p className="section-eyebrow">{t.eyebrow}</p>
        <h1 id="guide-title">
          {t.title}
          <span className="green">.</span>
        </h1>
        <p className="muted">{t.lead}</p>
      </section>
      <section className="guide-stages" aria-labelledby="guide-stages-title">
        <h2 id="guide-stages-title">{t.stagesTitle}</h2>
        <ol>
          {m.home.guidance.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step.title}>
                <span className="guide-stage-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="guide-stage-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </section>
      <GuideSchemes />
    </>
  );
}
