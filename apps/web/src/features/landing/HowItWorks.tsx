import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { example } from "@/features/profile/model";
import { cn } from "@/lib/classes";
import styles from "./sections.module.css";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  text: string;
  label: string;
};

const steps: Step[] = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "Share your needs",
    text: "Describe your situation in your own words — your work, where you live, what you need help with. Start with a short description or enter details manually.",
    label: "Plain language",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Discover relevant schemes",
    text: "AI turns your words into a few profile details that you review and correct. Rule-based checks then compare your confirmed details with each published scheme’s conditions.",
    label: "AI extraction + rule checks",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "Understand your next step",
    text: "See which conditions are met, which need more information, and which documents to prepare — with links to the official portal.",
    label: "Documents & official links",
  },
];

function ProcessStepCard({ step, lead }: { step: Step; lead?: boolean }) {
  const Icon = step.icon;
  return (
    <li className={cn(styles.step, lead && styles.stepLead)}>
      <div className={styles.stepHead}>
        <span className={styles.stepNumber} aria-hidden="true">
          {step.number}
        </span>
        <span className={styles.stepIcon} aria-hidden="true">
          <Icon size={20} />
        </span>
      </div>
      <h3 className={styles.stepTitle}>
        <span className="sr-only">Step {step.number}: </span>
        {step.title}
      </h3>
      <p className={styles.stepText}>{step.text}</p>
      <span className={styles.stepLabel}>{step.label}</span>
      {lead && (
        <figure className={styles.stepExample}>
          <figcaption>For example</figcaption>
          <blockquote>“{example}”</blockquote>
        </figure>
      )}
      {lead && (
        <Link className={cn("button primary", styles.stepCta)} href="#finder">
          Describe your situation
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}

export function HowItWorks() {
  const [first, ...rest] = steps;
  return (
    <section
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-title"
    >
      <div className={styles.sectionHead}>
        <p className="section-eyebrow">Simple &amp; transparent process</p>
        <h2 id="how-title" className={styles.sectionTitle}>
          Government support, made simpler.
        </h2>
        <p className={styles.sectionLead}>
          Three simple steps to find schemes relevant to your situation.
        </p>
      </div>
      <ol className={styles.stepGrid}>
        <ProcessStepCard step={first} lead />
        {rest.map((step) => (
          <ProcessStepCard key={step.number} step={step} />
        ))}
      </ol>
    </section>
  );
}
